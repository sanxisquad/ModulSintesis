import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { getZona, getAllContenedors, assignContenedoresToZona } from '../../api/zr.api';
import { useConfirm } from "../common/ConfirmDialog";
import { ArrowLeft, Save, Loader2, MapPin, Trash2, AlertTriangle } from "lucide-react";

export function ZonaContenedoresView() {
  const confirm = useConfirm();
  const navigate = useNavigate();
  const { id } = useParams();
  const [contenedores, setContenedores] = useState([]);
  const [selectedContenedores, setSelectedContenedores] = useState([]);
  const [initialSelectedIds, setInitialSelectedIds] = useState([]);
  const [error, setError] = useState(null);
  const [zona, setZona] = useState(null);
  const [loading, setLoading] = useState(true);
  const [todasZonas, setTodasZonas] = useState({});  // Para guardar los nombres de las zonas
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const zonaResponse = await getZona(id);
        setZona(zonaResponse.data);
        
  
        const contenedorResponse = await getAllContenedors();
        const contenedoresDisponibles = contenedorResponse.data;
        
        // Log para ver la estructura del objeto contenedor
        console.log("Muestra de contenedor:", contenedoresDisponibles[0]);
        
        // Extraer información de zonas para mostrar nombres
        const zonasMap = {};
        contenedoresDisponibles.forEach(c => {
          if (c.zona && c.zona_nombre) {
            zonasMap[c.zona] = c.zona_nombre;
          }
        });
        
        // Log para verificar cómo se construye el mapa de zonas
        console.log("Mapa de zonas:", zonasMap);
        
        setTodasZonas(zonasMap);
        
        setContenedores(contenedoresDisponibles);
  
        const contenedoresAsignados = contenedoresDisponibles.filter(c => 
          c.zona && c.zona.toString() === id.toString()
        );
        setSelectedContenedores(contenedoresAsignados);
        
        const initialIds = contenedoresAsignados.map(c => c.id);
        setInitialSelectedIds(initialIds);
      } catch (err) {
        toast.error(err.response?.data?.message || "Error al cargar los datos");
        setError(err.response?.data?.message || "Error al cargar los datos");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleCheckboxChange = (contenedorId) => {
    setSelectedContenedores((prevState) => {
      const isSelected = prevState.some((c) => c.id === contenedorId);
      if (isSelected) {
        return prevState.filter((c) => c.id !== contenedorId);
      } else {
        return [...prevState, contenedores.find((c) => c.id === contenedorId)];
      }
    });
  };
  
  const handleSubmit = async () => {
    const currentlySelectedIds = selectedContenedores.map((c) => c.id);
  
    const added = currentlySelectedIds.filter(
      (id) => !initialSelectedIds.includes(id)
    ).length;
  
    const removed = initialSelectedIds.filter(
      (id) => !currentlySelectedIds.includes(id)
    ).length;
  
    if (added === 0 && removed === 0) {
      toast.info("No se han detectado cambios en los contenedores asignados");
      return;
    }
  
    const confirmation = await confirm({
      title: "Guardar cambis de contenedors",
      message: "S'aplicaran els següents canvis:",
      detail: `✅ Afegir: ${added} contenidores\n❌ Treure: ${removed} contenidors`,
      confirmText: "Guardar canvis",
      cancelText: "Descartar",
    });
  
    if (confirmation) {
      try {
        setIsSubmitting(true);
        const contenedorIds = selectedContenedores.map((c) => c.id);
  
        const response = await assignContenedoresToZona(id, contenedorIds);
  
        if (response.data.status === "Contenedores asignados correctamente") {
          toast.success("Contenidors assignats correctament");
          
          // Obtener datos actualizados del servidor
          const updatedContenedorResponse = await getAllContenedors();
          const updatedZonaResponse = await getZona(id);
          
          const updatedContenedores = updatedContenedorResponse.data;
          
          // Extraer información actualizada de zonas
          const zonasMap = {};
          updatedContenedores.forEach(c => {
            if (c.zona && c.zona_nombre) {
              zonasMap[c.zona] = c.zona_nombre;
            }
          });
          
          setTodasZonas(zonasMap);
          setZona(updatedZonaResponse.data);
          setContenedores(updatedContenedores);
          
          // Actualizar los contenedores seleccionados con los datos del servidor
          const updatedSelectedContenedores = updatedContenedores.filter(c => 
            c.zona && c.zona.toString() === id.toString()
          );
          
          setSelectedContenedores(updatedSelectedContenedores);
          setInitialSelectedIds(updatedSelectedContenedores.map(c => c.id));
        } else {
          toast.error("Hubo un problema al asignar los contenedores");
        }
      } catch (error) {
        console.error("Error al asignar contenedores:", error);
  
        if (error.response) {
          if (error.response.status === 400) {
            toast.error(error.response.data.message || "Datos inválidos");
          } else if (error.response.status === 404) {
            toast.error("Zona no encontrada");
          } else {
            toast.error(error.response.data?.message || "Error del servidor");
          }
        } else if (error.request) {
          toast.error("No se recibió respuesta del servidor");
        } else {
          toast.error("Error al configurar la solicitud");
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Esta función determina si un contenedor pertenece a la zona actual
  const perteneceAZonaActual = (contenedor) => {
    return contenedor.zona && contenedor.zona.toString() === id.toString();
  };

  // Agrupar contenedores por estado
  const getContenedoresByEstado = (estado) => {
    return contenedores.filter(c => c.estat === estado && !c.zona);
  };

  // Obtener contenedores asignados a otras zonas
  const getContenedoresOtrasZonas = () => {
    const contenedoresOtrasZonas = contenedores.filter(c => 
      c.zona && c.zona.toString() !== id.toString()
    );
    
    // Log para ver contenedores de otras zonas
    console.log("Contenedores otras zonas (muestra):", 
      contenedoresOtrasZonas.length > 0 ? contenedoresOtrasZonas[0] : "No hay");
    
    // Agrupar por zona
    const agrupados = {};
    contenedoresOtrasZonas.forEach(c => {
      if (!agrupados[c.zona]) {
        agrupados[c.zona] = [];
      }
      agrupados[c.zona].push(c);
    });
    
    // Log del objeto agrupado
    console.log("Zonas agrupadas:", Object.keys(agrupados));
    console.log("todasZonas:", todasZonas);
    
    return agrupados;
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'ple': return 'bg-red-100 border-red-200 text-red-800';
      case 'mig': return 'bg-yellow-100 border-yellow-200 text-yellow-800';
      case 'buit': return 'bg-green-100 border-green-200 text-green-800';
      default: return 'bg-gray-100 border-gray-200 text-gray-800';
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Carregant dades...</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header con información de la zona */}
      <div className="pb-5 border-b border-gray-200 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-full mr-3">
              <MapPin className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Gestió de Contenidors: {zona?.nom}
              </h1>
              <p className="text-gray-500 text-sm">
                {zona?.ciutat} - {selectedContenedores.length} contenidors assignats
              </p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/gestor-zones')}
            className="flex items-center text-gray-600 hover:text-gray-800 px-3 py-2 rounded-md hover:bg-gray-100"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            <span>Tornar</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 border-l-4 border-red-500">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
            <span>{error}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Contenedores asignados */}
        <div className="md:col-span-2 bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-medium text-gray-800 mb-4">
            Contenidors assignats a aquesta zona ({selectedContenedores.length})
          </h2>
          
          {selectedContenedores.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {selectedContenedores.map(c => (
                <div key={c.id} className="border border-gray-200 rounded-lg p-3 flex items-center hover:bg-gray-50">
                  <div className={`h-8 w-8 rounded-full mr-3 flex items-center justify-center`}>
                    <Trash2 className={`h-4 w-4 ${
                      c.estat === 'ple' ? 'text-red-500' : 
                      c.estat === 'mig' ? 'text-yellow-500' : 'text-green-500'
                    }`} />
                  </div>
                  <div>
                    <p className="font-medium">{c.cod}</p>
                    <div className="flex items-center mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getEstadoColor(c.estat)}`}>
                        {c.estat === 'ple' ? 'Ple' : c.estat === 'mig' ? 'Mig' : 'Buit'}
                      </span>
                      <span className="text-xs text-gray-500 ml-2 capitalize">{c.tipus}</span>
                    </div>
                  </div>
                  <button 
                    className="ml-auto text-red-500 hover:bg-red-50 p-1 rounded"
                    onClick={() => handleCheckboxChange(c.id)}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <Trash2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No hi ha contenidors assignats a aquesta zona</p>
              <p className="text-sm text-gray-400">Selecciona els contenidors disponibles</p>
            </div>
          )}
        </div>
        
        {/* Panel lateral de contenedores disponibles */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-medium text-gray-800 mb-4">
            Contenidors disponibles
          </h2>
          
          <div className="space-y-4">
            {['ple', 'mig', 'buit'].map(estado => {
              const contenedoresEstado = getContenedoresByEstado(estado);
              if (contenedoresEstado.length === 0) return null;
              
              return (
                <div key={estado} className="border-t pt-3">
                  <h3 className={`text-sm font-medium mb-2 ${
                    estado === 'ple' ? 'text-red-700' : 
                    estado === 'mig' ? 'text-yellow-700' : 'text-green-700'
                  }`}>
                    {estado === 'ple' ? 'Contenidors plens' : 
                     estado === 'mig' ? 'Contenidors mig plens' : 'Contenidors buits'}
                    ({contenedoresEstado.length})
                  </h3>
                  
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {contenedoresEstado.map(c => (
                      <div 
                        key={c.id} 
                        className="flex items-center p-2 rounded border border-gray-200 hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleCheckboxChange(c.id)}
                      >
                        <input 
                          type="checkbox" 
                          checked={selectedContenedores.some(s => s.id === c.id)}
                          onChange={() => {}} // El manejo se hace en el onClick del div
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 mr-2"
                        />
                        <div>
                          <p className="font-medium text-sm">{c.cod}</p>
                          <p className="text-xs text-gray-500 capitalize">{c.tipus}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            
            {getContenedoresByEstado('ple').length === 0 && 
             getContenedoresByEstado('mig').length === 0 && 
             getContenedoresByEstado('buit').length === 0 && (
              <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <p className="text-gray-500">No hi ha contenidors disponibles</p>
              </div>
            )}

            {/* Nueva sección: Contenedores asignats a altres zones */}
            <div className="border-t border-gray-200 pt-4 mt-4">
              <h3 className="text-sm font-medium mb-3 text-gray-700">
                Contenidors assignats a altres zones
              </h3>
              
              {Object.entries(getContenedoresOtrasZonas()).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(getContenedoresOtrasZonas()).map(([zonaId, contenedoresZona]) => {
                    // Log para cada zona que estamos renderizando
                    console.log(`Renderizando zona ID: ${zonaId}, Nombre: ${todasZonas[zonaId] || 'No disponible'}`);
                    // Log de muestra de contenedor de esta zona
                    if (contenedoresZona.length > 0) {
                      console.log("Ejemplo contenedor de zona:", contenedoresZona[0]);
                    }
                    
                    return (
                    <div key={zonaId} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                      <h4 className="text-xs font-medium text-gray-600 mb-2 flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {/* Usar el nombre directo del contenedor si está disponible */}
                        {contenedoresZona[0]?.zona_nombre || todasZonas[zonaId] || `Zona ${zonaId}`} 
                        <span className="ml-1 text-gray-400">({contenedoresZona.length})</span>
                      </h4>
                      
                      <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                        {contenedoresZona.map(c => (
                          <div 
                            key={c.id} 
                            className="flex items-center p-2 rounded border border-gray-200 bg-white hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleCheckboxChange(c.id)}
                          >
                            <input 
                              type="checkbox" 
                              checked={selectedContenedores.some(s => s.id === c.id)}
                              onChange={() => {}} // El manejo se hace en el onClick del div
                              className="h-4 w-4 text-blue-600 rounded border-gray-300 mr-2"
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <p className="font-medium text-sm">{c.cod}</p>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${getEstadoColor(c.estat)}`}>
                                  {c.estat === 'ple' ? 'Ple' : c.estat === 'mig' ? 'Mig' : 'Buit'}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 capitalize">{c.tipus}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    ); // Añadido punto y coma después del return
                  })}
                </div>
              ) : (
                <div className="text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <p className="text-gray-500">No hi ha contenidors assignats a altres zones</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end">
        <button
          onClick={() => navigate('/gestor-zones')}
          className="mr-3 px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancel·lar
        </button>
        
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`flex items-center px-6 py-2 rounded-md text-white ${
            isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Guardant...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Guardar canvis
            </>
          )}
        </button>
      </div>
    </div>
  );
}