import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { getZona, getAllContenedors, assignContenedoresToZona } from '../../api/zr.api';
import { useConfirm } from "../common/ConfirmDialog";

export function ZonaContenedoresView() {
  const confirm = useConfirm();

  const { id } = useParams();
  const [contenedores, setContenedores] = useState([]);
  const [selectedContenedores, setSelectedContenedores] = useState([]);
  const [initialSelectedIds, setInitialSelectedIds] = useState([]);
  const [error, setError] = useState(null);
  const [zona, setZona] = useState(null);
  const [loading, setLoading] = useState(true);
  const [todasZonas, setTodasZonas] = useState({});  // Para guardar los nombres de las zonas

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const zonaResponse = await getZona(id);
        setZona(zonaResponse.data);
        
  
        const contenedorResponse = await getAllContenedors();
        const contenedoresDisponibles = contenedorResponse.data;
        console.log("Contenedores disponibles:", contenedoresDisponibles);
        
        // Extraer información de zonas para mostrar nombres
        const zonasMap = {};
        contenedoresDisponibles.forEach(c => {
          if (c.zona && c.zonaNom) {
            zonasMap[c.zona] = c.zonaNom;
          }
        });
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
        setLoading(true);
        const contenedorIds = selectedContenedores.map((c) => c.id);
  
        const response = await assignContenedoresToZona(id, contenedorIds);
  
        if (response.data.status === "Contenedores asignados correctamente") {
          toast.success(response.data.status);
          
          // Obtener datos actualizados del servidor
          const updatedContenedorResponse = await getAllContenedors();
          const updatedZonaResponse = await getZona(id);
          
          const updatedContenedores = updatedContenedorResponse.data;
          
          // Extraer información actualizada de zonas
          const zonasMap = {};
          updatedContenedores.forEach(c => {
            if (c.zona && c.zonaNom) {
              zonasMap[c.zona] = c.zonaNom;
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
          
          toast.success("Contenedores actualizados correctamente");
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
        
        // Recargar datos en caso de error
        try {
          const zonaResponse = await getZona(id);
          const contenedorResponse = await getAllContenedors();
          setContenedores(contenedorResponse.data);
          setZona(zonaResponse.data);
        } catch (reloadError) {
          console.error("Error al recargar datos:", reloadError);
        }
      } finally {
        setLoading(false);
      }
    }
  };

  // Esta función determina si un contenedor pertenece a la zona actual
  const perteneceAZonaActual = (contenedor) => {
    return contenedor.zona && contenedor.zona.toString() === id.toString();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Gestionar Contenedores</h1>
        
        {zona && (
          <div className="bg-gray-50 rounded-lg p-6 shadow-sm border-l-4 border-blue-500 max-w-md mx-auto">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">{zona.nom}</h2>
            <p className="text-gray-600"><span className="font-medium">Código:</span> {zona.cod}</p>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 border-l-4 border-red-500">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Cargant informació...</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
              Contenedors disponibles
            </h3>
            
            {contenedores.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {contenedores.map(contenedor => {
                  const isAssignedToCurrentZone = perteneceAZonaActual(contenedor);
                  const isAssignedToOtherZone = contenedor.zona && !isAssignedToCurrentZone;
                  
                  return (
                    <li 
                      key={contenedor.id} 
                      className={`py-3 px-2 hover:bg-gray-50 ${isAssignedToOtherZone ? 'bg-gray-50 opacity-70' : ''}`}
                    >
                      <label className="flex items-center cursor-pointer w-full">
                        <input
                          type="checkbox"
                          checked={selectedContenedores.some(c => c.id === contenedor.id)}
                          onChange={() => handleCheckboxChange(contenedor.id)}
                          disabled={isAssignedToOtherZone}
                          className="hidden"
                        />
                        <span className={`w-5 h-5 border-2 rounded mr-3 flex-shrink-0 transition-colors
                          ${selectedContenedores.some(c => c.id === contenedor.id) ? 
                            'bg-blue-500 border-blue-500' : 'border-gray-300'}
                          ${isAssignedToOtherZone ? 'bg-gray-200 border-gray-300' : ''}
                        `}>
                          {selectedContenedores.some(c => c.id === contenedor.id) && (
                            <svg className="w-3 h-3 text-white mx-auto mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </span>
                        
                        <div className="flex flex-wrap items-center gap-2 w-full">
                          <span className="font-medium text-gray-800">{contenedor.cod}</span>
                          <span className="text-gray-600">{contenedor.ciutat}</span>
                          
                          {isAssignedToOtherZone && (
                            <span className="ml-auto text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                              Assignat a la zona: {contenedor.zona_nombre || todasZonas[contenedor.zona_nombre] || "Otra"}
                            </span>
                          )}
                          
                          {isAssignedToCurrentZone && (
                            <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                              Assignat a aquesta zona
                            </span>
                          )}
                        </div>
                      </label>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="text-center py-8 text-gray-500 italic">
                No hi ha contenedores disponibles per a aquesta zona.
              </div>
            )}
          </div>

          <div className="flex justify-center gap-4">
            <Link 
              to="/gestor-zones"
              className="px-6 py-3 rounded-md font-medium text-gray-700 border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </Link>

            <button 
              onClick={handleSubmit} 
              disabled={loading}
              className={`px-6 py-3 rounded-md font-medium text-white transition-colors 
                ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
              `}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando...
                </span>
              ) : (
                'Assignar contenidors'
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}