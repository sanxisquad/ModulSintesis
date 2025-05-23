import { 
  Clock, RefreshCw, CheckCircle2, XCircle, 
  User, Calendar, MapPin, MessageSquare,
  Flag, Building
} from 'lucide-react';
import { useState } from 'react';
import { resolveReporte, rejectReporte, processReporte } from '../../api/zr.api';
import { useNavigate } from 'react-router-dom';
import { useConfirm } from '../common/ConfirmDialog';
import { usePermissions } from '../../../hooks/usePermissions';

export function TiquetCard({ tiquet, onUpdateTiquet }) {
  const [loading, setLoading] = useState(false);
  const confirm = useConfirm();
  const navigate = useNavigate();
  const { isSuperAdmin } = usePermissions();
  
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
      case 'abierto': return <Clock className="h-4 w-4 mr-1" />;
      case 'en_proceso': return <RefreshCw className="h-4 w-4 mr-1" />;
      case 'resuelto': return <CheckCircle2 className="h-4 w-4 mr-1" />;
      case 'rechazado': return <XCircle className="h-4 w-4 mr-1" />;
      default: return null;
    }
  };
  
  const handleUpdateState = async (newState, e) => {
    // Prevent navigation when clicking buttons
    if (e) e.stopPropagation();
    
    try {
      // Check if the ticket is already in a terminal state
      if (tiquet.estado === 'resuelto' || tiquet.estado === 'rechazado') {
        return; // Don't allow changes to tickets already in terminal states
      }
      
      // For "en_proceso" state, immediately change without confirmation
      if (newState === 'en_proceso') {
        setLoading(true);
        // Use the dedicated endpoint for processing tickets
        await processReporte(tiquet.id);
        if (onUpdateTiquet) {
          onUpdateTiquet({ ...tiquet, estado: 'en_proceso' });
        }
        setLoading(false);
        return;
      }
      
      // For "resuelto" and "rechazado", show confirmation dialog
      let confirmResult;
      
      if (newState === 'resuelto') {
        confirmResult = await confirm({
          title: 'Confirmar resolució',
          message: 'Estàs segur que vols marcar aquest tiquet com a resolt?',
          detail: 'Aquesta acció enviarà una notificació a l\'usuari i li donarà 100 punts.',
          confirmText: 'Marcar com a resolt',
          cancelText: 'Cancel·lar'
        });
      } else if (newState === 'rechazado') {
        confirmResult = await confirm({
          title: 'Confirmar rebuig',
          message: 'Estàs segur que vols rebutjar aquest tiquet?',
          detail: 'Aquesta acció enviarà una notificació a l\'usuari informant que el seu tiquet ha estat rebutjat.',
          confirmText: 'Rebutjar tiquet',
          cancelText: 'Cancel·lar'
        });
      }
      
      if (!confirmResult) {
        return; // User cancelled the action
      }
      
      setLoading(true);
      
      if (newState === 'resuelto') {
        await resolveReporte(tiquet.id, '');
      } else if (newState === 'rechazado') {
        await rejectReporte(tiquet.id, '');
      }
      
      if (onUpdateTiquet) {
        onUpdateTiquet({ ...tiquet, estado: newState });
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error actualitzant l'estat del tiquet:", error);
      setLoading(false);
    }
  };
  
  // Funciones para prioridad
  const getPrioridadColor = (prioridad) => {
    switch(prioridad) {
      case 'baja': return 'bg-green-500';
      case 'normal': 
      case null:
      case undefined: return 'bg-blue-500';
      case 'alta': return 'bg-yellow-500';
      case 'urgente': return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  };
  
  const getTraduccionPrioridad = (prioridad) => {
    switch(prioridad) {
      case 'baja': return 'Baixa';
      case 'normal': return 'Normal';
      case 'alta': return 'Alta';
      case 'urgente': return 'Urgent';
      default: return 'Normal';
    }
  };
  
  // Prevent actions on tickets that are already in terminal states
  const isTerminalState = tiquet.estado === 'resuelto' || tiquet.estado === 'rechazado';
  
  const handleCardClick = () => {
    navigate(`/gestor/tiquets/${tiquet.id}`);
  };
  
  return (
    <div 
      className="bg-white p-4 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200 cursor-pointer relative"
      onClick={handleCardClick}
    >
      {/* Priority indicator strip at the top */}
      <div 
        className={`absolute top-0 left-0 w-full h-1.5 rounded-t-lg ${getPrioridadColor(tiquet.prioridad)}`}
      ></div>
      
      <div className="flex justify-between items-start mb-3 mt-1">
        <h2 className="text-lg font-bold text-gray-800">
          Tiquet #{tiquet.id} - {getTraduccionTipo(tiquet.tipo)}
        </h2>
        <div className="flex items-center space-x-2">
          {/* Priority badge */}
          <span className="flex items-center text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
            <Flag className="h-3 w-3 mr-1" />
            {getTraduccionPrioridad(tiquet.prioridad)}
          </span>
          
          {/* Status badge */}
          <span 
            className={`${getColorEstado(tiquet.estado)} flex items-center text-xs font-medium px-2 py-1 rounded-full`}
          >
            {getIconoEstado(tiquet.estado)}
            {getTraduccionEstado(tiquet.estado)}
          </span>
        </div>
      </div>
      
      <div className="mb-3 text-gray-600">
        <p className="mb-2 line-clamp-2" title={tiquet.descripcion}>
          <MessageSquare className="inline h-4 w-4 mr-1" /> 
          {tiquet.descripcion}
        </p>
        
        <div className="grid grid-cols-2 gap-2 text-sm mt-2">
          <div className="flex items-center">
            <User className="h-4 w-4 mr-1 text-gray-500" />
            <span>{tiquet.usuario_data.first_name +" "+ tiquet.usuario_data.last_name || 'Usuari #' + tiquet.usuario}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1 text-gray-500" />
            <span>{new Date(tiquet.fecha).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center col-span-2">
            <MapPin className="h-4 w-4 mr-1 text-gray-500" />
            <span>
              {tiquet.contenedor ? `Contenidor #${tiquet.contenedor}` : 
               tiquet.zona ? `Zona #${tiquet.zona}` : 'No especificat'}
            </span>
          </div>
          {/* Mostrar empresa del usuario si está disponible */}
          {tiquet.usuario_data?.empresa?.nom && (
            <div className="flex items-center col-span-2">
              <Building className="h-4 w-4 mr-1 text-gray-500" />
              <span className="text-gray-600">{tiquet.usuario_data.empresa.nom}</span>
            </div>
          )}
        </div>
      </div>
      
      {tiquet.imagen && (
        <div className="mb-3">
          <img 
            src={tiquet.imagen} 
            alt="Imatge del problema" 
            className="w-full h-32 object-cover rounded"
          />
        </div>
      )}
      
      <div className="flex justify-end items-center mt-4">
        {!isTerminalState && (
          <div className="flex space-x-2">
            {tiquet.estado === 'abierto' && (
              <button
                disabled={loading}
                onClick={(e) => handleUpdateState('en_proceso', e)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm flex items-center"
              >
                <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
                Iniciar
              </button>
            )}
            <button
              disabled={loading}
              onClick={(e) => handleUpdateState('resuelto', e)}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm flex items-center"
            >
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Resoldre
            </button>
            <button
              disabled={loading}
              onClick={(e) => handleUpdateState('rechazado', e)}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm flex items-center"
            >
              <XCircle className="h-3 w-3 mr-1" />
              Rebutjar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
