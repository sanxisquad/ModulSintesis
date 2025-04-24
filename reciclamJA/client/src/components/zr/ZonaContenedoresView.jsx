import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { getZona, getAllContenedors, assignContenedoresToZona } from '../../api/zr.api';

export function ZonaContenedoresView() {
  const { id } = useParams();
  const [contenedores, setContenedores] = useState([]);
  const [selectedContenedores, setSelectedContenedores] = useState([]);
  const [error, setError] = useState(null);
  const [zona, setZona] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const zonaResponse = await getZona(id);
        setZona(zonaResponse.data);

        const contenedorResponse = await getAllContenedors();
        const contenedoresDisponibles = contenedorResponse.data;
        setContenedores(contenedoresDisponibles);

        const contenedoresAsignados = contenedoresDisponibles.filter(c => c.zonaId === id);
        setSelectedContenedores(contenedoresAsignados);
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
    setSelectedContenedores(prevState => {
      if (prevState.some(c => c.id === contenedorId)) {
        return prevState.filter(c => c.id !== contenedorId);
      } else {
        return [...prevState, contenedores.find(c => c.id === contenedorId)];
      }
    });
  };

  const handleSubmit = async () => {
    try {
        setLoading(true);
        const contenedorIds = selectedContenedores.map(c => c.id);
        
        const response = await assignContenedoresToZona(id, contenedorIds);
        
        if (response.data.status === 'Contenedores asignados correctamente') {
            toast.success(response.data.status);
            // Opcional: actualizar el estado local si es necesario
        } else {
            toast.error("Hubo un problema al asignar los contenedores");
        }
    } catch (error) {
        if (error.response?.data?.message) {
            toast.error(error.response.data.message);
        } else {
            toast.error("Error de conexión con el servidor");
        }
    } finally {
        setLoading(false);
    }
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
          <p className="text-gray-600">Cargando información...</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
              Contenedores disponibles
            </h3>
            
            {contenedores.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {contenedores.map(contenedor => (
                  <li 
                    key={contenedor.id} 
                    className={`py-3 px-2 hover:bg-gray-50 ${contenedor.zonaId && contenedor.zonaId !== id ? 'bg-gray-50 opacity-70' : ''}`}
                  >
                    <label className="flex items-center cursor-pointer w-full">
                      <input
                        type="checkbox"
                        checked={selectedContenedores.some(c => c.id === contenedor.id)}
                        onChange={() => handleCheckboxChange(contenedor.id)}
                        disabled={contenedor.zonaId && contenedor.zonaId !== id}
                        className="hidden"
                      />
                      <span className={`w-5 h-5 border-2 rounded mr-3 flex-shrink-0 transition-colors
                        ${selectedContenedores.some(c => c.id === contenedor.id) ? 
                          'bg-blue-500 border-blue-500' : 'border-gray-300'}
                        ${contenedor.zonaId && contenedor.zonaId !== id ? 'bg-gray-200 border-gray-300' : ''}
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
                        
                        {contenedor.zonaId && contenedor.zonaId !== id && (
                          <span className="ml-auto text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                            Asignado a otra zona
                          </span>
                        )}
                      </div>
                    </label>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8 text-gray-500 italic">
                No hay contenedores disponibles para esta zona.
              </div>
            )}
          </div>

          <button 
            onClick={handleSubmit} 
            disabled={loading}
            className={`w-full max-w-xs mx-auto block px-6 py-3 rounded-md font-medium text-white transition-colors
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
              'Asignar contenedores seleccionados'
            )}
          </button>
        </>
      )}
    </div>
  );
}