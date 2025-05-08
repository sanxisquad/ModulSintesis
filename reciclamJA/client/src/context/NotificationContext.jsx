import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { getNotificaciones, marcarTodasLeidas, marcarNotificacionLeida } from '../api/zr.api';
import { useAuth } from '../../hooks/useAuth';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loadingNotificaciones, setLoadingNotificaciones] = useState(false);
  const [socket, setSocket] = useState(null);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Conectar al socket cuando el usuario está autenticado
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    // Conectar al servidor Socket.IO
    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
      auth: {
        token: localStorage.getItem('token')
      }
    });
    
    setSocket(newSocket);

    // Escuchar eventos de notificación
    newSocket.on('nueva_notificacion', (data) => {
      // Añadir la nueva notificación al estado
      setNotificaciones(prev => [data, ...prev]);
    });

    newSocket.on('actualizar_notificaciones', () => {
      // Recargar todas las notificaciones cuando se recibe este evento
      fetchNotificaciones();
    });

    // Limpieza al desmontar
    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, [isAuthenticated, user]);

  // Cargar notificaciones iniciales
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchNotificaciones();
    } else {
      setNotificaciones([]);
    }
  }, [isAuthenticated, user]);

  const fetchNotificaciones = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoadingNotificaciones(true);
      const response = await getNotificaciones();
      setNotificaciones(response.data);
    } catch (error) {
      console.error("Error al cargar notificaciones:", error);
    } finally {
      setLoadingNotificaciones(false);
    }
  };

  const handleNotificacionClick = async (id, ruta) => {
    try {
      await marcarNotificacionLeida(id);
      setNotificaciones(notificaciones.map(notif => 
        notif.id === id ? { ...notif, leida: true } : notif
      ));
      
      // Si hay una ruta asociada, navegar a ella
      if (ruta) {
        navigate(ruta);
      }
    } catch (error) {
      console.error("Error al marcar notificación como leída:", error);
    }
  };

  const marcarTodasNotificacionesLeidas = async () => {
    try {
      await marcarTodasLeidas();
      setNotificaciones(notificaciones.map(notif => ({ ...notif, leida: true })));
    } catch (error) {
      console.error("Error al marcar todas las notificaciones como leídas:", error);
    }
  };

  return (
    <NotificationContext.Provider value={{
      notificaciones,
      loadingNotificaciones,
      fetchNotificaciones,
      handleNotificacionClick,
      marcarTodasNotificacionesLeidas,
      notificacionesNoLeidas: notificaciones.filter(n => !n.leida).length
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
