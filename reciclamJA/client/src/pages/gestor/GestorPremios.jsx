import React, { useState, useEffect } from 'react';
import { 
  FaUpload, FaGift, FaCoins, FaTrash, FaEdit, FaSearch, 
  FaList, FaTh, FaPlus, FaExclamationTriangle, FaCheckCircle,
  FaSpinner, FaTimesCircle, FaExchangeAlt, FaUser, FaCalendarAlt
} from 'react-icons/fa';
import { RefreshCw } from 'lucide-react'; // Add this import
import { 
  getAllPrizes, createPrize, updatePrize, deletePrize,
  getCompanyRedemptions, getAllRedemptions, handleApiError
} from '../../api/premio.api';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../hooks/useAuth';
import { usePermissions } from '../../../hooks/usePermissions';
import { useConfirm } from '../../components/common/ConfirmDialog';
import axios from 'axios';
import apiConfig from '../../api/apiClient';

export function GestorPremios() {
  const { user } = useAuth();
  const { isGestor, isAdmin, isSuperAdmin } = usePermissions();
  const confirm = useConfirm();
  
  // Verificar permisos al principio del componente, antes de cualquier otra lógica
  const hasAccess = isGestor || isAdmin || isSuperAdmin;
  
  // Redirigir inmediatamente si no tiene acceso
  if (!hasAccess) {
    // Usar useEffect para evitar errores de renderizado con el hook de navegación
    React.useEffect(() => {
      toast.error('Accés denegat. No tens permisos per gestionar premis.');
      // Redirigir manualmente en lugar de usar Navigate
      window.location.href = '/';
    }, []);
    // Mostrar un mensaje de carga mientras redirige
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-500 font-semibold">Accés denegat</p>
          <p className="mt-2">Redirigint...</p>
        </div>
      </div>
    );
  }

  const [premios, setPremios] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [currentPrize, setCurrentPrize] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    puntos_costo: 0,
    cantidad: 0,
    activo: true,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [redemptions, setRedemptions] = useState([]);
  const [activeTab, setActiveTab] = useState('prizes'); // 'prizes' or 'redemptions'
  const [redemptionFilter, setRedemptionFilter] = useState(''); // Para búsqueda en redenciones
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [currentRedemption, setCurrentRedemption] = useState(null);
  const [statusNote, setStatusNote] = useState('');

  useEffect(() => {
    if (activeTab === 'prizes') {
      fetchPremios();
    } else {
      fetchRedemptions();
    }
  }, [activeTab]);

  const fetchPremios = async () => {
    try {
      setLoading(true);
      const response = await getAllPrizes();
      setPremios(response.data);
      setError(null);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching premios:', error);
      setError("Hi ha hagut un error carregant les dades.");
      setLoading(false);
    }
  };
  
  const fetchRedemptions = async () => {
    try {
      setLoading(true);
      const response = isAdmin || isSuperAdmin
        ? await getAllRedemptions()
        : await getCompanyRedemptions();
      
      setRedemptions(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching redemptions:', error);
      setError("Hi ha hagut un error carregant les redempcions.");
    } finally {
      setLoading(false);
    }
  };

  // Función para actualizar el estado de una redención
  const updateRedemptionStatus = async (redemptionId, newStatus, note) => {
    try {
      const response = await axios.patch(
        `${apiConfig.getBaseUrl()}/api/reciclar/premios-redenciones/${redemptionId}/actualizar-estado/`,
        { 
          estado: newStatus,
          notas: note || ''
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Actualizar la lista de redenciones
      setRedemptions(prevRedemptions => 
        prevRedemptions.map(r => 
          r.id === redemptionId ? {...r, estado: newStatus, notas: note || ''} : r
        )
      );
      
      return response.data;
    } catch (error) {
      console.error('Error updating redemption status:', error);
      throw error;
    }
  };

  const handleStatusChange = async (redemption, newStatus) => {
    setCurrentRedemption(redemption);
    
    if (newStatus === 'cancelado') {
      // Para cancelaciones, pedir confirmación
      if (await confirm({
        title: "Confirmar cancel·lació",
        message: `Estàs segur que vols cancel·lar la redempció del premi "${redemption.premio_nombre}"?`,
        confirmText: "Sí, cancel·lar",
        cancelText: "No, mantenir"
      })) {
        setShowStatusModal(true);
      }
    } else {
      // Para otros estados, mostrar modal para añadir nota
      setShowStatusModal(true);
    }
  };

  const submitStatusChange = async () => {
    try {
      await updateRedemptionStatus(
        currentRedemption.id, 
        currentRedemption.estado === 'pendiente' ? 'procesando' : 
        currentRedemption.estado === 'procesando' ? 'entregado' : 'cancelado',
        statusNote
      );
      
      toast.success('Estat de la redempció actualitzat correctament');
      setShowStatusModal(false);
      setStatusNote('');
      fetchRedemptions();
    } catch (error) {
      toast.error('Hi ha hagut un problema actualitzant l\'estat');
    }
  };

  // Filter prizes based on search input
  const filteredPremios = premios.filter(premio => 
    premio.nombre.toLowerCase().includes(filter.toLowerCase()) ||
    premio.descripcion.toLowerCase().includes(filter.toLowerCase())
  );

  // Filtrar redenciones según búsqueda
  const filteredRedemptions = redemptions.filter(redemption => 
    redemption.usuario_nombre.toLowerCase().includes(redemptionFilter.toLowerCase()) ||
    redemption.premio_nombre.toLowerCase().includes(redemptionFilter.toLowerCase()) ||
    redemption.codigo_confirmacion.toLowerCase().includes(redemptionFilter.toLowerCase())
  );

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pendiente':
        return <FaExclamationTriangle className="text-yellow-500" />;
      case 'procesando':
        return <FaSpinner className="text-blue-500" />;
      case 'entregado':
        return <FaCheckCircle className="text-green-500" />;
      case 'cancelado':
        return <FaTimesCircle className="text-red-500" />;
      default:
        return null;
    }
  };
  
  const getStatusText = (status) => {
    switch (status) {
      case 'pendiente':
        return 'Pendent de lliurament';
      case 'procesando':
        return 'En procés';
      case 'entregado':
        return 'Lliurat';
      case 'cancelado':
        return 'Cancel·lat';
      default:
        return status;
    }
  };

  const getNextStatusText = (currentStatus) => {
    switch (currentStatus) {
      case 'pendiente':
        return 'Marcar com "En procés"';
      case 'procesando':
        return 'Marcar com "Lliurat"';
      default:
        return 'Canviar estat';
    }
  };
  
  const handleOpenModal = (mode, premio = null) => {
    setModalMode(mode);
    setCurrentPrize(premio);
    
    if (mode === 'edit' && premio) {
      setFormData({
        nombre: premio.nombre,
        descripcion: premio.descripcion,
        puntos_costo: premio.puntos_costo,
        cantidad: premio.cantidad,
        activo: premio.activo,
      });
      setImagePreview(premio.imagen);
    } else if (mode === 'create') {
      // For new prizes, set empresa automatically if user has a company
      setFormData({
        nombre: '',
        descripcion: '',
        puntos_costo: 0,
        cantidad: 0,
        activo: true,
        // Company will be automatically assigned by the backend based on the user
      });
      setImagePreview(null);
      setImageFile(null);
    } else if (mode === 'delete') {
      // Just keeping the current prize for deletion
    }
    
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formDataToSend = new FormData();
    formDataToSend.append('nombre', formData.nombre);
    formDataToSend.append('descripcion', formData.descripcion);
    formDataToSend.append('puntos_costo', formData.puntos_costo);
    formDataToSend.append('cantidad', formData.cantidad);
    formDataToSend.append('activo', formData.activo);
    
    if (imageFile) {
      formDataToSend.append('imagen', imageFile);
    }

    try {
      let response;
      if (modalMode === 'create') {
        response = await createPrize(formDataToSend);
        toast.success('Premi creat correctament');
      } else {
        response = await updatePrize(currentPrize.id, formDataToSend);
        toast.success('Premi actualitzat correctament');
      }
      
      setShowModal(false);
      fetchPremios();
    } catch (error) {
      console.error('Error saving premio:', error);
      toast.error('Hi ha hagut un problema desant el premi');
    }
  };

  const handleDelete = async () => {
    try {
      await deletePrize(currentPrize.id);
      toast.success('Premi eliminat correctament');
      setShowModal(false);
      fetchPremios();
    } catch (error) {
      console.error('Error deleting premio:', error);
      toast.error('Hi ha hagut un problema eliminant el premi');
    }
  };

  if (loading) {
    return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col items-center">
        <RefreshCw className="animate-spin h-12 w-12 text-blue-500" />
        <p className="mt-4 text-lg text-gray-800">Carregant dades...</p>
      </div>
    </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen px-4 sm:px-6 md:px-8 py-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="pb-5 border-b border-gray-200 mb-6">
          <div className="flex items-center">
            <div className="bg-purple-100 p-2 rounded-full mr-3">
              <FaGift className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Gestió de Premis</h1>
              <p className="text-gray-500 text-sm">Administració de premis i seguiment de redempcions</p>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex">
            <button
              className={`mr-8 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'prizes'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('prizes')}
            >
              <FaGift className="inline mr-2" />
              Premis
            </button>
            <button
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'redemptions'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('redemptions')}
            >
              <FaExchangeAlt className="inline mr-2" />
              Redempcions
            </button>
          </nav>
        </div>
        
        {activeTab === 'prizes' ? (
          <>
            {/* Action Bar for Prizes */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
              <div className="w-full sm:w-auto flex gap-2">
                <div className="relative flex-1 sm:flex-none">
                  <input
                    type="text"
                    placeholder="Cerca premis..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  />
                  <div className="absolute left-3 top-2.5 text-gray-400">
                    <FaSearch />
                  </div>
                </div>
                <button
                  className="p-2 border border-gray-300 rounded-md bg-white text-gray-700 flex items-center"
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                >
                  {viewMode === 'grid' ? <FaList /> : <FaTh />}
                </button>
              </div>
              
              <button
                onClick={() => handleOpenModal('create')}
                className="w-full sm:w-auto px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center justify-center"
              >
                <FaPlus className="mr-2" /> Afegir Nou Premi
              </button>
            </div>
            
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                <div className="flex items-center">
                  <FaExclamationTriangle className="text-red-500 mr-2" />
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            )}
            
            {/* Display prizes in grid or list view */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPremios.map((premio) => (
                  <div key={premio.id} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
                    <div className="h-48 bg-gray-200">
                      {premio.imagen ? (
                        <img 
                          src={premio.imagen} 
                          alt={premio.nombre} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <FaGift className="h-16 w-16 text-gray-300" />
                        </div>
                      )}
                      {!premio.activo && (
                        <div className="absolute inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center">
                          <span className="text-white font-medium">Inactiu</span>
                        </div>
                      )}
                      {premio.cantidad === 0 && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                          Sense estoc
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-medium text-gray-900">{premio.nombre}</h3>
                        <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full flex items-center">
                          <FaCoins className="mr-1" /> {premio.puntos_costo}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-500 line-clamp-2">{premio.descripcion}</p>
                      <div className="mt-3 flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                          {premio.cantidad} {premio.cantidad === 1 ? 'unitat' : 'unitats'}
                        </span>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleOpenModal('edit', premio)}
                            className="p-1 text-blue-600 hover:text-blue-800"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleOpenModal('delete', premio)}
                            className="p-1 text-red-600 hover:text-red-800"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Premi
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Punts
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unitats
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estat
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Accions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPremios.map(premio => (
                      <tr key={premio.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              {premio.imagen ? (
                                <img 
                                  src={premio.imagen} 
                                  alt={premio.nombre} 
                                  className="h-10 w-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                  <FaGift className="text-purple-600" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{premio.nombre}</div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">{premio.descripcion}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{premio.puntos_costo}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{premio.cantidad}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            premio.activo 
                              ? premio.cantidad > 0 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {premio.activo 
                              ? premio.cantidad > 0 
                                ? 'Actiu' 
                                : 'Sense estoc'
                              : 'Inactiu'
                            }
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleOpenModal('edit', premio)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleOpenModal('delete', premio)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Action Bar for Redemptions */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
              <div className="w-full sm:w-auto flex gap-2">
                <div className="relative flex-1 sm:flex-none">
                  <input
                    type="text"
                    placeholder="Cerca redempcions..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full"
                    value={redemptionFilter}
                    onChange={(e) => setRedemptionFilter(e.target.value)}
                  />
                  <div className="absolute left-3 top-2.5 text-gray-400">
                    <FaSearch />
                  </div>
                </div>
              </div>
              
              <button
                onClick={fetchRedemptions}
                className="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 flex items-center justify-center"
              >
                <FaSpinner className="mr-2" /> Actualitzar
              </button>
            </div>
            
            {/* Redemptions Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuari
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Premi
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Codi
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estat
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Accions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRedemptions.map(redemption => (
                    <tr key={redemption.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <FaUser className="text-gray-500" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{redemption.usuario_nombre}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{redemption.premio_nombre}</div>
                        <div className="text-sm text-gray-500">{redemption.puntos_gastados} punts</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(redemption.fecha_redencion).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(redemption.fecha_redencion).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                          {redemption.codigo_confirmacion}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(redemption.estado)}
                          <span className="ml-2 text-sm font-medium text-gray-900">
                            {getStatusText(redemption.estado)}
                          </span>
                        </div>
                        {redemption.notas && (
                          <div className="text-xs text-gray-500 mt-1">
                            Nota: {redemption.notas}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {redemption.estado !== 'entregado' && redemption.estado !== 'cancelado' && (
                          <button
                            onClick={() => handleStatusChange(redemption)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            {getNextStatusText(redemption.estado)}
                          </button>
                        )}
                        {redemption.estado !== 'cancelado' && (
                          <button
                            onClick={() => handleStatusChange(redemption, 'cancelado')}
                            className="ml-2 inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            Cancel·lar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredRedemptions.length === 0 && (
                <div className="p-6 text-center">
                  <FaGift className="mx-auto h-12 w-12 text-gray-300" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No hi ha redempcions</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {redemptionFilter 
                      ? 'No s\'han trobat redempcions amb aquesta cerca.' 
                      : 'Encara no hi ha cap usuari que hagi bescanviat premis.'}
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      
      {/* The modal part remains mostly unchanged */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full">
            <div className="p-4 sm:p-6">
              {modalMode === 'delete' ? (
                <>
                  <div className="flex items-start mb-4">
                    <div className="flex-shrink-0 bg-red-100 rounded-full p-3">
                      <FaTrash className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Eliminar premi
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Estàs segur que vols eliminar el premi "{currentPrize?.nombre}"? Aquesta acció no es pot desfer.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={handleDelete}
                    >
                      Eliminar
                    </button>
                    <button
                      type="button"
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={() => setShowModal(false)}
                    >
                      Cancel·lar
                    </button>
                  </div>
                </>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                    <div className="mb-4">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        {modalMode === 'create' ? 'Afegir nou premi' : 'Editar premi'}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Omple els detalls del premi que els usuaris podran bescanviar
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                          Nom del premi
                        </label>
                        <input
                          type="text"
                          name="nombre"
                          id="nombre"
                          value={formData.nombre}
                          onChange={handleInputChange}
                          className="mt-1 focus:ring-purple-500 focus:border-purple-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">
                          Descripció
                        </label>
                        <textarea
                          name="descripcion"
                          id="descripcion"
                          rows="3"
                          value={formData.descripcion}
                          onChange={handleInputChange}
                          className="mt-1 focus:ring-purple-500 focus:border-purple-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          required
                        ></textarea>
                      </div>
                      
                      <div>
                        <label htmlFor="puntos_costo" className="block text-sm font-medium text-gray-700">
                          Cost en punts
                        </label>
                        <input
                          type="number"
                          name="puntos_costo"
                          id="puntos_costo"
                          min="0"
                          value={formData.puntos_costo}
                          onChange={handleInputChange}
                          className="mt-1 focus:ring-purple-500 focus:border-purple-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="cantidad" className="block text-sm font-medium text-gray-700">
                          Unitats disponibles
                        </label>
                        <input
                          type="number"
                          name="cantidad"
                          id="cantidad"
                          min="0"
                          value={formData.cantidad}
                          onChange={handleInputChange}
                          className="mt-1 focus:ring-purple-500 focus:border-purple-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Imatge
                        </label>
                        <div className="mt-1 flex items-center">
                          {imagePreview ? (
                            <div className="relative">
                              <img 
                                src={imagePreview} 
                                alt="Preview" 
                                className="h-32 w-32 object-cover rounded-md"
                              />
                              <button
                                type="button"
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                                onClick={() => {
                                  setImagePreview(null);
                                  setImageFile(null);
                                }}
                              >
                                ×
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-32 w-32 rounded-md border-2 border-dashed border-gray-300 bg-gray-50">
                              <div className="space-y-1 text-center">
                                <FaUpload className="mx-auto h-6 w-6 text-gray-400" />
                                <div className="text-sm text-gray-600">
                                  <label
                                    htmlFor="image-upload"
                                    className="relative cursor-pointer rounded-md font-medium text-purple-600 hover:text-purple-500"
                                  >
                                    <span>Pujar imatge</span>
                                    <input
                                      id="image-upload"
                                      name="image-upload"
                                      type="file"
                                      className="sr-only"
                                      accept="image/*"
                                      onChange={handleImageChange}
                                    />
                                  </label>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          id="activo"
                          name="activo"
                          type="checkbox"
                          checked={formData.activo}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <label htmlFor="activo" className="ml-2 block text-sm text-gray-900">
                          Actiu (disponible per bescanviar)
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      {modalMode === 'create' ? 'Crear' : 'Guardar'}
                    </button>
                    <button
                      type="button"
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={() => setShowModal(false)}
                    >
                      Cancel·lar
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Status Change Modal */}
      {showStatusModal && currentRedemption && (
        <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {currentRedemption.estado === 'pendiente' 
                  ? 'Canviar a "En procés"' 
                  : currentRedemption.estado === 'procesando' 
                    ? 'Marcar com "Lliurat"' 
                    : 'Cancelar redempció'}
              </h3>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="flex items-center mb-3">
                  <FaGift className="text-purple-500 mr-2" />
                  <span className="font-medium">{currentRedemption.premio_nombre}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Usuari:</span>
                    <span className="ml-2">{currentRedemption.usuario_nombre}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Codi:</span>
                    <span className="ml-2 font-mono">{currentRedemption.codigo_confirmacion}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Data:</span>
                    <span className="ml-2">
                      {new Date(currentRedemption.fecha_redencion).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Punts:</span>
                    <span className="ml-2">{currentRedemption.puntos_gastados}</span>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="status-note" className="block text-sm font-medium text-gray-700 mb-1">
                  Afegir nota (opcional)
                </label>
                <textarea
                  id="status-note"
                  rows="3"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                  placeholder="Afegeix una nota o instruccions per a l'usuari..."
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                ></textarea>
              </div>
              
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 ${
                    currentRedemption.estado === 'pendiente' || currentRedemption.estado === 'procesando'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm`}
                  onClick={submitStatusChange}
                >
                  {currentRedemption.estado === 'pendiente' 
                    ? 'Iniciar procés' 
                    : currentRedemption.estado === 'procesando' 
                      ? 'Confirmar lliurament' 
                      : 'Confirmar cancel·lació'}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => {
                    setShowStatusModal(false);
                    setStatusNote('');
                  }}
                >
                  Cancel·lar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}