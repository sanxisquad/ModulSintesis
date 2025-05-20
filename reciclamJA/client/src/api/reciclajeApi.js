import axios from 'axios';
import apiConfig from './apiClient';

// Crear instancia de axios con la URL base correcta que incluya el prefijo de la API
const reciclajeApi = axios.create({
    // Cambiar esto para que sea similar a zr.api.js
    baseURL: `${apiConfig.getBaseUrl()}/api/reciclar`,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Interceptor para añadir el token JWT
reciclajeApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            console.warn("⚠️ No se encontró el token para la solicitud de reciclaje");
        }
        
        return config;
    },
    (error) => Promise.reject(error)
);

// Funciones API para el sistema de reciclaje
export const escanearCodigo = async (codigo) => {
    let codigoStr = '';
    
    try {
        // Validar y formatear el código
        if (!codigo) {
            throw new Error('El código de barras no puede estar vacío');
        }
        
        codigoStr = String(codigo).trim();
        console.log("Enviando código para reciclar:", codigoStr);
        
        // IMPORTANTE: Ahora solo necesitas la ruta específica sin /api/reciclar
        const response = await reciclajeApi.post('/escanejar/', { 
            codigo: codigoStr
        });
        
        console.log("Respuesta exitosa:", response.data);
        return response.data;
    } catch (error) {
        console.error('Error escaneando código:', error);
        
        // Si es error 500 o el error específico de APPEND_SLASH, intentar con la URI correcta
        if (error.response?.status === 500 || error.message?.includes('APPEND_SLASH')) {
            try {
                console.log("Error de URL sin slash, intentando con versión correcta...");
                const response = await axios.post(`${apiConfig.getBaseUrl()}/api/reciclar/escanejar/`, { 
                    codigo: codigoStr 
                }, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                console.log("Respuesta exitosa con URL corregida:", response.data);
                return response.data;
            } catch (retryError) {
                console.error("Error en el reintento:", retryError);
                // Seguir con el manejo normal de errores
            }
        }
        
        // Manejo normal de errores
        if (error.response) {
            console.error('Respuesta del servidor:', error.response.status, error.response.data);
            
            // Si es un error 400 específico sobre material no determinado
            if (error.response.status === 400 && 
                error.response.data.error === "No s'ha pogut determinar el material") {
                
                // Sugerir usar uno de los códigos de ejemplo
                const mensaje = `No hem pogut identificar el material d'aquest producte. 
                                 Prova un dels nostres codis d'exemple: 
                                 8480000160164 (Plàstic), 
                                 8414533043847 (Paper), 
                                 8410057320202 (Vidre), 
                                 8410188012096 (Metall)`;
                
                return {
                    error: true,
                    tipo: "material_no_determinado",
                    titulo: "Material no identificat",
                    mensaje: mensaje,
                    codigo: codigoStr,
                    codigos_ejemplo: [
                        { codigo: '8480000160164', descripcion: 'Aigua Font Vella (Plàstic)' },
                        { codigo: '8414533043847', descripcion: 'Diari El País (Paper)' },
                        { codigo: '8410057320202', descripcion: 'Cervesa Estrella (Vidre)' },
                        { codigo: '8410188012096', descripcion: 'Llauna Coca-Cola (Metall)' }
                    ]
                };
            }
            
            // Para otros errores 400, también crear un formato amigable
            if (error.response.status === 400) {
                return {
                    error: true,
                    tipo: "producto_error",
                    titulo: "Error de producte",
                    mensaje: error.response.data.error || error.response.data.message || "Error al processar el codi",
                    codigo: codigoStr
                };
            }
        }
        
        // Error genérico
        return {
            error: true,
            tipo: "error_general",
            titulo: "Error general",
            mensaje: error.message || "Error desconegut",
            codigo: codigoStr
        };
    }
};

export const obtenerHistorial = async () => {
    try {
        // Aquí también actualizar la ruta
        const response = await reciclajeApi.get('/historial/');
        return response.data;
    } catch (error) {
        console.error('Error obteniendo historial:', error);
        throw error;
    }
};

// Funciones para gestión de bolsas virtuales
export const obtenerBolsas = async () => {
  try {
    const response = await reciclajeApi.get('/bolsas/');
    return response.data;
  } catch (error) {
    console.error('Error obteniendo bolsas:', error);
    throw error;
  }
};

export const crearBolsa = async (tipoBolsa) => {
  try {
    const response = await reciclajeApi.post('/bolsas/crear/', {
      tipo_material_id: tipoBolsa,
      nombre: `Bolsa de ${new Date().toLocaleString()}`
    });
    return response.data;
  } catch (error) {
    console.error('Error creando bolsa:', error);
    throw error;
  }
};

export const obtenerDetalleBolsa = async (bolsaId) => {
  try {
    const response = await reciclajeApi.get(`/bolsas/${bolsaId}/`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo detalle de bolsa:', error);
    throw error;
  }
};

export const agregarProductoABolsa = async (productoId, bolsaId) => {
  try {
    const response = await reciclajeApi.post(`/productos/${productoId}/agregar-a-bolsa/`, {
      bolsa_id: bolsaId
    });
    return response.data;
  } catch (error) {
    console.error('Error agregando producto a bolsa:', error);
    throw error;
  }
};

export const reciclarBolsa = async (bolsaId, contenedorId) => {
  try {
    const response = await reciclajeApi.post(`/bolsas/${bolsaId}/reciclar/`, {
      contenedor_id: contenedorId
    });
    return response.data;
  } catch (error) {
    console.error('Error reciclando bolsa:', error);
    throw error;
  }
};

export default {
  escanearCodigo,
  obtenerHistorial,
  obtenerBolsas,
  crearBolsa,
  obtenerDetalleBolsa,
  agregarProductoABolsa,
  reciclarBolsa
};
