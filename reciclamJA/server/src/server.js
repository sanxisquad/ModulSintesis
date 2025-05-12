// Importaciones necesarias
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const app = express();
const server = http.createServer(app);

// Configuración de Socket.IO con CORS
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173', // URL del cliente
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware para autenticar conexiones de socket
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    return next(new Error('Authentication error: Token not provided'));
  }
  
  try {
    // Verificar el token (ajusta la clave secreta según tu configuración)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded; // Guardar info del usuario en el socket
    next();
  } catch (err) {
    return next(new Error('Authentication error: Invalid token'));
  }
});

// Gestionar conexiones de socket
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.user.id}`);
  
  // Unir al usuario a una sala basada en su rol para enviar notificaciones específicas
  if (socket.user.is_staff) {
    socket.join('staff');
  }
  
  // Crear una sala específica para cada usuario
  socket.join(`user:${socket.user.id}`);
  
  // Solicitar notificaciones al conectarse
  // Esto permite obtener notificaciones actualizadas sin hacer clic
  socket.emit('notifications:fetch');
  
  // Evento para cuando el servidor envía notificaciones al cliente
  // Este evento ahora automáticamente marca las notificaciones como vistas
  socket.on('notifications:fetch', async () => {
    try {
      // Aquí obtendrías las notificaciones de la base de datos
      // const notifications = await getNotificationsForUser(socket.user.id);
      
      // Ejemplo de notificaciones
      const notifications = {
        items: [], // aquí irían tus notificaciones reales
        hasUnread: false // ya las marcamos como leídas automáticamente
      };
      
      // Marcamos automáticamente como leídas en la base de datos
      // await markNotificationsAsRead(socket.user.id);
      
      // Enviamos las notificaciones ya marcadas como leídas
      socket.emit('notifications:list', notifications);
      
      // Notificamos a todos los dispositivos del usuario que las notificaciones están actualizadas
      io.to(`user:${socket.user.id}`).emit('notifications:updated', {
        hasUnread: false
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  });
  
  // Nueva función para enviar notificaciones en tiempo real y marcarlas automáticamente
  socket.on('notifications:new', async ({ userId, notification }) => {
    try {
      // Guardar la notificación en la base de datos (si es necesario)
      // await saveNotification(userId, notification);
      
      // Si es para un usuario específico
      if (userId) {
        // Enviar notificación en tiempo real
        io.to(`user:${userId}`).emit('notifications:received', notification);
        
        // Marcarla automáticamente como leída
        // await markNotificationAsRead(userId, notification.id);
        
        // Actualizar UI
        io.to(`user:${userId}`).emit('notifications:updated', {
          hasUnread: false
        });
      } 
      // Si es para todo el staff
      else if (notification.isStaffNotification) {
        io.to('staff').emit('notifications:received', notification);
        
        // Para cada miembro del staff conectado, marcar como leída
        const staffSockets = await io.in('staff').fetchSockets();
        for (const staffSocket of staffSockets) {
          // await markNotificationAsRead(staffSocket.user.id, notification.id);
          
          io.to(`user:${staffSocket.user.id}`).emit('notifications:updated', {
            hasUnread: false
          });
        }
      }
    } catch (error) {
      console.error('Error processing new notification:', error);
    }
  });
  
  // Escuchar la desconexión
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.user.id}`);
  });
});

// Hacer disponible io para usarlo en otros archivos
app.set('io', io);

// El resto de tu configuración de Express...

server.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on port ${process.env.PORT || 3000}`);
});
