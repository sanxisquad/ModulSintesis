import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getReporte, resolveReporte, rejectReporte, 
  processReporte, reopenTicket, updateReporte,
  getComentarios, addComentario, deleteComentario
} from '../../api/zr.api';
import { getUser } from '../../api/user.api'; // Import getUser from user API
import { 
  Clock, RefreshCw, CheckCircle2, XCircle, 
  User, Calendar, MapPin, MessageSquare,
  ArrowLeft, AlertTriangle, Tag, Save,
  Flag
} from 'lucide-react';
import { useConfirm } from '../common/ConfirmDialog';
import { useAuth } from '../../../hooks/useAuth';

export function TiquetView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tiquet, setTiquet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [comentario, setComentario] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [userData, setUserData] = useState(null);
  const [loadingUser, setLoadingUser] = useState(false);
  const [comentarios, setComentarios] = useState([]);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [loadingComentarios, setLoadingComentarios] = useState(false);
  const [sendingComentario, setSendingComentario] = useState(false);
  const { user } = useAuth();
  const confirm = useConfirm();
  
  useEffect(() => {
    const fetchTiquet = async () => {
      try {
        setLoading(true);
        const response = await getReporte(id);
        setTiquet(response.data);
        setSelectedStatus(response.data.estado); // Initialize dropdown with current status
        
        // If there's a user ID but no name, fetch the user data
        if (response.data.usuario && !response.data.usuario_nombre) {
          fetchUserData(response.data.usuario);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error carregant tiquet:", error);
        setLoading(false);
      }
    };
    
    fetchTiquet();
  }, [id]);
  
  useEffect(() => {
    if (id) {
      fetchComentarios(id);
    }
  }, [id]);
  
  // Function to fetch user data - improved with debugging
  const fetchUserData = async (userId) => {
    try {
      setLoadingUser(true);
      console.log(`Attempting to fetch user data for ID: ${userId}`);
      
      // Use the getUser function from the user API
      const response = await getUser(userId);
      console.log('User data received:', response.data);
      setUserData(response.data);
      setLoadingUser(false);
    } catch (error) {
      console.error("Error fetching user data:", error);
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error("Error message:", error.message);
      }
      setLoadingUser(false);
    }
  };
  
  const fetchComentarios = async (reporteId) => {
    try {
      setLoadingComentarios(true);
      const response = await getComentarios(reporteId);
      setComentarios(response.data);
      setLoadingComentarios(false);
    } catch (error) {
      console.error("Error cargando comentarios:", error);
      setLoadingComentarios(false);
    }
  };
  
  const handleSendComment = async () => {
    if (!nuevoComentario.trim()) return;
    
    try {
        setSendingComentario(true);
        // Use an object instead of a plain string
        await addComentario(id, { texto: nuevoComentario.trim() });
        setNuevoComentario('');
        await fetchComentarios(id);
        setSendingComentario(false);
    } catch (error) {
        console.error("Error enviando comentario:", error);
        setSendingComentario(false);
    }
  };
  
  // Helper function to get username - with more fallbacks
  const getUserName = () => {
    // Check directly from ticket data
    if (tiquet.usuario_data.first_name && tiquet.usuario_data.last_name) {
      return `${tiquet.usuario_data.first_name} ${tiquet.usuario_data.last_name}`;
    }
    
    // Check directly from resuelto_por if available
    if (tiquet.resuelto_por && typeof tiquet.resuelto_por === 'string') {
      return tiquet.resuelto_por;
    }
    
    // Check from fetched user data
    if (userData) {
      if (userData.username) return userData.username;
      if (userData.email) return userData.email;
      if (userData.first_name && userData.last_name) {
        return `${userData.first_name} ${userData.last_name}`;
      }
    }
    
    // Default fallback
    return `Usuari #${tiquet.usuario}`;
  };
  
  // Function to get priority color
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'baja': return 'bg-green-100 text-green-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'alta': return 'bg-yellow-100 text-yellow-800';
      case 'urgente': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800'; // Default to normal
    }
  };
  
  // Function to get priority name
  const getPriorityName = (priority) => {
    switch(priority) {
      case 'baja': return 'Baixa';
      case 'normal': return 'Normal';
      case 'alta': return 'Alta'; 
      case 'urgente': return 'Urgent';
      default: return 'Normal';
    }
  };
  
  const getTraduccionTipo = (tipo) => {
    switch(tipo) {
      case 'mal_estado': return 'Contenidor en mal estat';
      case 'lleno': return 'Contenidor ple';
      case 'vandalismo': return 'Vandalisme';
      case 'ubicacion': return 'Problema amb la ubicació';
      case 'olores': return 'Mals olors';
      case 'otro': return 'Altre problema';
      default: return tipo;
    }
  };
  
  const getTraduccionEstado = (estado) => {
    switch(estado) {
      case 'abierto': return 'Obert';
      case 'en_proceso': return 'En procés';
      case 'resuelto': return 'Resolt';
      case 'rechazado': return 'Rebutjat';
      default: return estado;
    }
  };
  
  const getColorEstado = (estado) => {
    switch(estado) {
      case 'abierto': return 'bg-yellow-100 text-yellow-700';
      case 'en_proceso': return 'bg-blue-100 text-blue-700';
      case 'resuelto': return 'bg-green-100 text-green-700';
      case 'rechazado': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };
  
  const getIconoEstado = (estado) => {
    switch(estado) {
      case 'abierto': return <Clock className="h-5 w-5 mr-2" />;
      case 'en_proceso': return <RefreshCw className="h-5 w-5 mr-2" />;
      case 'resuelto': return <CheckCircle2 className="h-5 w-5 mr-2" />;
      case 'rechazado': return <XCircle className="h-5 w-5 mr-2" />;
      default: return null;
    }
  };
  
  const handleUpdateState = async () => {
    try {
      setUpdating(true);
      
      // If the status hasn't changed but there's a new comment, just save the comment
      if (selectedStatus === tiquet.estado && comentario) {
        // Create a new API endpoint for updating just the comment
        await updateReporte(tiquet.id, {
          ...tiquet,
          comentario_cierre: comentario
        });
        
        // Refresh the ticket data
        const response = await getReporte(id);
        setTiquet(response.data);
        setSelectedStatus(response.data.estado);
        setComentario(''); // Clear comment after saving
        setUpdating(false);
        return;
      }
      
      // For "resuelto" and "rechazado", we need a confirmation with comments
      if (selectedStatus === 'resuelto' || selectedStatus === 'rechazado') {
        const confirmTitle = selectedStatus === 'resuelto' ? 'Confirmar resolució' : 'Confirmar rebuig';
        const confirmMessage = selectedStatus === 'resuelto' 
          ? 'Estàs segur que vols marcar aquest tiquet com a resolt?' 
          : 'Estàs segur que vols rebutjar aquest tiquet?';
        
        const confirmResult = await confirm({
          title: confirmTitle,
          message: confirmMessage,
          detail: comentario 
            ? `Comentari: "${comentario}"\n\nAquesta acció enviarà una notificació a l'usuari.`
            : 'No has afegit cap comentari. L\'usuari no sabrà per què s\'ha tancat.',
          confirmText: selectedStatus === 'resuelto' ? 'Marcar com a resolt' : 'Rebutjar tiquet',
          cancelText: 'Cancel·lar'
        });
        
        if (!confirmResult) {
          setUpdating(false);
          return; // User cancelled the action
        }
        
        if (selectedStatus === 'resuelto') {
          await resolveReporte(tiquet.id, comentario);
        } else {
          await rejectReporte(tiquet.id, comentario);
        }
      }
      // For other states, just update without confirmation
      else if (selectedStatus === 'en_proceso') {
        await processReporte(tiquet.id);
      }
      else if (selectedStatus === 'abierto') {
        await reopenTicket(tiquet.id);
      }
      
      // Refresh the ticket data
      const response = await getReporte(id);
      setTiquet(response.data);
      setSelectedStatus(response.data.estado);
      
      setUpdating(false);
    } catch (error) {
      console.error("Error actualitzant l'estat del tiquet:", error);
      setUpdating(false);
      
      // Try to refresh the data
      try {
        const response = await getReporte(id);
        setTiquet(response.data);
        setSelectedStatus(response.data.estado);
      } catch (refreshError) {
        console.error("Error refreshing ticket data:", refreshError);
      }
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('ca-ES', options);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!tiquet) {
    return (
      <div className="max-w-4xl mx-auto mt-8 px-4">
        <button 
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Tornar
        </button>
        <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-2" />
          <h2 className="text-xl font-bold text-red-800">Error carregant el tiquet</h2>
          <p className="text-red-600">No s'ha trobat el tiquet o no tens permisos per veure'l.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto mt-8 px-4 pb-8">
      <button 
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center text-blue-600 hover:text-blue-800"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Tornar a la llista
      </button>
      
      {/* Encabezado with priority indicator */}
      <div className="bg-white p-6 rounded-t-lg shadow-md border border-gray-200 relative">
        {/* Priority color strip at the top */}
        <div className={`absolute top-0 left-0 w-full h-1.5 rounded-t-lg ${
          tiquet.prioridad === 'baja' ? 'bg-green-500' : 
          tiquet.prioridad === 'alta' ? 'bg-yellow-500' : 
          tiquet.prioridad === 'urgente' ? 'bg-red-500' : 
          'bg-blue-500'
        }`}></div>
        
        <div className="flex justify-between items-start mt-1">
          <h1 className="text-2xl font-bold text-gray-800">
            Tiquet #{tiquet.id} - {getTraduccionTipo(tiquet.tipo)}
          </h1>
          
          {/* Status selection dropdown */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className={`appearance-none px-3 py-1 pr-8 rounded-full text-sm font-medium ${getColorEstado(selectedStatus)} border focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="abierto" className="bg-white text-yellow-700">Obert</option>
              <option value="en_proceso" className="bg-white text-blue-700">En procés</option>
              <option value="resuelto" className="bg-white text-green-700">Resolt</option>
              <option value="rechazado" className="bg-white text-red-700">Rebutjat</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path>
              </svg>
            </div>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
          <div className="flex items-center">
            <User className="h-5 w-5 mr-2 text-gray-500" />
            <span><strong>Usuari:</strong> {loadingUser ? 'Carregant...' : getUserName()}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-gray-500" />
            <span><strong>Data:</strong> {formatDate(tiquet.fecha)}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-gray-500" />
            <span>
              <strong>Ubicació:</strong> {
                tiquet.contenedor ? `Contenidor #${tiquet.contenedor}` : 
                tiquet.zona ? `Zona #${tiquet.zona}` : 'No especificat'
              }
            </span>
          </div>
          <div className="flex items-center">
            <Flag className="h-5 w-5 mr-2 text-gray-500" />
            <span className="flex items-center">
              <strong className="mr-2">Prioritat:</strong> 
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(tiquet.prioridad)}`}>
                {getPriorityName(tiquet.prioridad || 'normal')}
              </span>
            </span>
          </div>
        </div>
      </div>
      
      {/* Descripción */}
      <div className="bg-white p-6 border-t border-b border-l border-r border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
          <MessageSquare className="h-5 w-5 mr-2 text-gray-600" />
          Descripció
        </h2>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="whitespace-pre-line">{tiquet.descripcion}</p>
        </div>
      </div>
      
      {/* Imagen */}
      {tiquet.imagen && (
        <div className="bg-white p-6 border-b border-l border-r border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Imatge</h2>
          <div className="mt-2">
            <img 
              src={tiquet.imagen} 
              alt="Imatge del problema" 
              className="max-w-full h-auto max-h-96 rounded-lg"
            />
          </div>
        </div>
      )}
      
      {/* Comentarios de cierre */}
      {(tiquet.estado === 'resuelto' || tiquet.estado === 'rechazado') && tiquet.comentario_cierre && (
        <div className="bg-white p-6 border-b border-l border-r border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Comentari de tancament</h2>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="whitespace-pre-line">{tiquet.comentario_cierre}</p>
          </div>
          {tiquet.resuelto_por && (
            <p className="mt-2 text-sm text-gray-500">
              <span className="font-medium">Tancat per:</span> {tiquet.resuelto_por}
            </p>
          )}
        </div>
      )}
      
      {/* Comment thread section - place this before the comment form */}
      <div className="bg-white p-6 border-b border-l border-r border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <MessageSquare className="h-5 w-5 mr-2 text-gray-600" />
          Comentaris ({comentarios.length})
        </h2>
        
        {loadingComentarios ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : comentarios.length > 0 ? (
          <div className="space-y-4 max-h-96 overflow-y-auto p-2">
            {comentarios.map(comentario => (
              <div key={comentario.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-2">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        {comentario.usuario_nombre || 'Usuario'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(comentario.fecha)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Only allow deleting own comments */}
                  {user && comentario.usuario === user.id && (
                    <button 
                      className="text-gray-400 hover:text-red-500"
                      onClick={async () => {
                        if (confirm('¿Estás seguro de eliminar este comentario?')) {
                          try {
                            await deleteComentario(id, comentario.id);
                            await fetchComentarios(id);
                          } catch (error) {
                            console.error("Error eliminando comentario:", error);
                          }
                        }
                      }}
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <p className="whitespace-pre-line text-gray-600">{comentario.texto}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>No hi ha comentaris encara.</p>
            <p className="text-sm mt-1">Sigues el primer en comentar en aquest tiquet.</p>
          </div>
        )}
      </div>
      
      {/* New comment form */}
      <div className="bg-white p-6 border-b border-l border-r rounded-b-lg border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Afegir comentari</h2>
        <div className="flex">
          <textarea
            value={nuevoComentario}
            onChange={(e) => setNuevoComentario(e.target.value)}
            className="flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows="3"
            placeholder="Escriu un comentari públic..."
          ></textarea>
        </div>
        
        <div className="mt-2 flex justify-end">
          <button
            onClick={handleSendComment}
            disabled={sendingComentario || !nuevoComentario.trim()}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
          >
            {sendingComentario ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Enviant...
              </>
            ) : (
              <>
                <MessageSquare className="h-4 w-4 mr-2" />
                Comentar
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Status Update Button */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={handleUpdateState}
          disabled={updating}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
        >
          {updating ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Actualitzant...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {selectedStatus !== tiquet.estado 
                ? `Canviar estat a ${getTraduccionEstado(selectedStatus)}`
                : "Desar"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

