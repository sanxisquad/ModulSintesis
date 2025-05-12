import { useState, useEffect } from 'react';
import { useMenu } from '../../context/MenuContext';
import { getReportes } from '../../api/zr.api';
import { TiquetsList } from '../../components/tiquets/TiquetsList';
import { 
  MessageSquare, CheckCircle2, Clock, 
  AlertCircle, XCircle, RefreshCw,
  Filter, ArrowUpDown, Flag
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  Tooltip, Legend 
} from 'recharts';

export function GestioTiquets() {
  const { menuOpen } = useMenu();
  const [tiquets, setTiquets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtreEstat, setFiltreEstat] = useState('tots');
  const [filtrePrioritat, setFiltrePrioritat] = useState('totes');
  const [filterMode, setFilterMode] = useState('estat'); // 'estat' or 'prioritat'
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getReportes();
        setTiquets(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error carregant tiquets:", error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Actualitzar dades després de canvis d'estat del tiquet
  const handleTiquetUpdated = async () => {
    try {
      setLoading(true);
      const response = await getReportes();
      setTiquets(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error recarregant tiquets:", error);
      setLoading(false);
    }
  };
  
  // Estadístiques de tiquets per estat
  const statsEstat = {
    total: tiquets.length,
    oberts: tiquets.filter(t => t.estado === 'abierto').length,
    enProces: tiquets.filter(t => t.estado === 'en_proceso').length,
    resolts: tiquets.filter(t => t.estado === 'resuelto').length,
    rebutjats: tiquets.filter(t => t.estado === 'rechazado').length
  };
  
  // Estadístiques de tiquets per prioritat
  const statsPrioritat = {
    total: tiquets.length,
    baixa: tiquets.filter(t => t.prioridad === 'baja').length,
    normal: tiquets.filter(t => t.prioridad === 'normal' || !t.prioridad).length,
    alta: tiquets.filter(t => t.prioridad === 'alta').length,
    urgent: tiquets.filter(t => t.prioridad === 'urgente').length
  };
  
  // Dades per al gràfic d'estat de tiquets
  const tiquetsData = [
    { name: 'Oberts', value: statsEstat.oberts },
    { name: 'En Procés', value: statsEstat.enProces },
    { name: 'Resolts', value: statsEstat.resolts },
    { name: 'Rebutjats', value: statsEstat.rebutjats }
  ];
  
  // Dades per al gràfic de prioritat de tiquets
  const prioritatData = [
    { name: 'Baixa', value: statsPrioritat.baixa },
    { name: 'Normal', value: statsPrioritat.normal },
    { name: 'Alta', value: statsPrioritat.alta },
    { name: 'Urgent', value: statsPrioritat.urgent }
  ];
  
  const COLORS_ESTAT = ['#FFBB28', '#0088FE', '#00C49F', '#FF8042'];
  const COLORS_PRIORITAT = ['#82ca9d', '#8884d8', '#ffc658', '#ff7300'];
  
  // Filtrar tiquets segons l'estat i la prioritat seleccionats
  const tiquetsFiltrats = tiquets.filter(t => {
    const matchEstat = filtreEstat === 'tots' || t.estado === filtreEstat;
    const matchPrioritat = filtrePrioritat === 'totes' || 
                           (filtrePrioritat === 'normal' && (!t.prioridad || t.prioridad === 'normal')) ||
                           t.prioridad === filtrePrioritat;
    return matchEstat && matchPrioritat;
  });
  
  const toggleFilterMode = () => {
    setFilterMode(filterMode === 'estat' ? 'prioritat' : 'estat');
  };
  
  if (loading) return <div className="text-center p-8">Carregant dades...</div>;

  return (
    <div className="bg-gray-50 min-h-screen px-4 sm:px-6 md:px-8 py-6">
      <h1 className="text-3xl font-bold text-center m-10">Gestió de Tiquets</h1>
      
      {/* Panell d'estadístiques de tiquets */}
      <div className="mb-6 px-4">
        {/* Filtres */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-wrap justify-between items-center">
            <div className="flex items-center">
              <h2 className="text-lg font-medium text-gray-800 mr-3">Filtres</h2>
              <button 
                onClick={toggleFilterMode}
                className="flex items-center bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded"
              >
                <Filter className="h-4 w-4 mr-2" />
                {filterMode === 'estat' ? 'Veure per prioritat' : 'Veure per estat'}
              </button>
            </div>
            <div className="flex gap-2 mt-2 sm:mt-0">
              <button 
                className="flex items-center bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                onClick={() => {
                  setLoading(true);
                  getReportes()
                    .then(res => {
                      setTiquets(res.data);
                      setLoading(false);
                    })
                    .catch(err => {
                      console.error("Error actualitzant tiquets:", err);
                      setLoading(false);
                    });
                }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualitzar
              </button>
            </div>
          </div>
          <div className="mt-3 text-sm text-gray-600">
            {filtreEstat !== 'tots' && (
              <span className="inline-flex items-center mr-3 bg-blue-100 text-blue-800 px-2 py-1 rounded">
                Estat: {getTraduccionEstado(filtreEstat)}
                <button 
                  onClick={() => setFiltreEstat('tots')} 
                  className="ml-1 text-blue-700 hover:text-blue-900"
                >
                  ×
                </button>
              </span>
            )}
            {filtrePrioritat !== 'totes' && (
              <span className="inline-flex items-center bg-purple-100 text-purple-800 px-2 py-1 rounded">
                Prioritat: {getTraduccionPrioridad(filtrePrioritat)}
                <button 
                  onClick={() => setFiltrePrioritat('totes')} 
                  className="ml-1 text-purple-700 hover:text-purple-900"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
        
        {/* Targetes d'estadístiques - Estat */}
        {filterMode === 'estat' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div 
              className={`bg-white p-4 rounded-lg shadow cursor-pointer transition-all hover:shadow-md ${filtreEstat === 'tots' ? 'ring-2 ring-purple-500' : ''}`}
              onClick={() => setFiltreEstat('tots')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Tiquets</p>
                  <p className="text-2xl font-bold text-gray-800">{statsEstat.total}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-purple-500 flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            <div 
              className={`bg-white p-4 rounded-lg shadow cursor-pointer transition-all hover:shadow-md ${filtreEstat === 'abierto' ? 'ring-2 ring-yellow-500' : ''}`}
              onClick={() => setFiltreEstat('abierto')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Oberts</p>
                  <p className="text-2xl font-bold text-gray-800">{statsEstat.oberts}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-yellow-500 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            <div 
              className={`bg-white p-4 rounded-lg shadow cursor-pointer transition-all hover:shadow-md ${filtreEstat === 'en_proceso' ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => setFiltreEstat('en_proceso')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">En Procés</p>
                  <p className="text-2xl font-bold text-gray-800">{statsEstat.enProces}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                  <RefreshCw className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            <div 
              className={`bg-white p-4 rounded-lg shadow cursor-pointer transition-all hover:shadow-md ${filtreEstat === 'resuelto' ? 'ring-2 ring-green-500' : ''}`}
              onClick={() => setFiltreEstat('resuelto')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Resolts</p>
                  <p className="text-2xl font-bold text-gray-800">{statsEstat.resolts}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            <div 
              className={`bg-white p-4 rounded-lg shadow cursor-pointer transition-all hover:shadow-md ${filtreEstat === 'rechazado' ? 'ring-2 ring-red-500' : ''}`}
              onClick={() => setFiltreEstat('rechazado')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Rebutjats</p>
                  <p className="text-2xl font-bold text-gray-800">{statsEstat.rebutjats}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-red-500 flex items-center justify-center">
                  <XCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Targetes d'estadístiques - Prioritat */}
        {filterMode === 'prioritat' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div 
              className={`bg-white p-4 rounded-lg shadow cursor-pointer transition-all hover:shadow-md ${filtrePrioritat === 'totes' ? 'ring-2 ring-purple-500' : ''}`}
              onClick={() => setFiltrePrioritat('totes')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Tiquets</p>
                  <p className="text-2xl font-bold text-gray-800">{statsPrioritat.total}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-purple-500 flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            <div 
              className={`bg-white p-4 rounded-lg shadow cursor-pointer transition-all hover:shadow-md ${filtrePrioritat === 'baja' ? 'ring-2 ring-green-500' : ''}`}
              onClick={() => setFiltrePrioritat('baja')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Prioritat Baixa</p>
                  <p className="text-2xl font-bold text-gray-800">{statsPrioritat.baixa}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                  <Flag className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            <div 
              className={`bg-white p-4 rounded-lg shadow cursor-pointer transition-all hover:shadow-md ${filtrePrioritat === 'normal' ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => setFiltrePrioritat('normal')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Prioritat Normal</p>
                  <p className="text-2xl font-bold text-gray-800">{statsPrioritat.normal}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                  <Flag className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            <div 
              className={`bg-white p-4 rounded-lg shadow cursor-pointer transition-all hover:shadow-md ${filtrePrioritat === 'alta' ? 'ring-2 ring-yellow-500' : ''}`}
              onClick={() => setFiltrePrioritat('alta')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Prioritat Alta</p>
                  <p className="text-2xl font-bold text-gray-800">{statsPrioritat.alta}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-yellow-500 flex items-center justify-center">
                  <Flag className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            <div 
              className={`bg-white p-4 rounded-lg shadow cursor-pointer transition-all hover:shadow-md ${filtrePrioritat === 'urgente' ? 'ring-2 ring-red-500' : ''}`}
              onClick={() => setFiltrePrioritat('urgente')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Prioritat Urgent</p>
                  <p className="text-2xl font-bold text-gray-800">{statsPrioritat.urgent}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-red-500 flex items-center justify-center">
                  <Flag className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Gràfic d'estat de tiquets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-medium mb-4 text-gray-800">
              {filterMode === 'estat' ? 'Distribució d\'Estats' : 'Distribució de Prioritats'}
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={filterMode === 'estat' ? tiquetsData : prioritatData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {(filterMode === 'estat' ? tiquetsData : prioritatData).map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={filterMode === 'estat' ? COLORS_ESTAT[index % COLORS_ESTAT.length] : COLORS_PRIORITAT[index % COLORS_PRIORITAT.length]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-medium mb-4 text-gray-800">Resum de Tiquets</h2>
            <div className="overflow-y-auto h-64">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-2 px-4 text-left text-gray-700">Tipus</th>
                    <th className="py-2 px-4 text-left text-gray-700">Total</th>
                    <th className="py-2 px-4 text-left text-gray-700">Pendents</th>
                    <th className="py-2 px-4 text-left text-gray-700">Resolts</th>
                  </tr>
                </thead>
                <tbody>
                  {['mal_estado', 'lleno', 'vandalismo', 'ubicacion', 'olores', 'otro'].map(tipo => {
                    const tipusTiquets = tiquets.filter(t => t.tipo === tipo);
                    const pendents = tipusTiquets.filter(t => t.estado !== 'resuelto' && t.estado !== 'rechazado').length;
                    const resolts = tipusTiquets.filter(t => t.estado === 'resuelto').length;
                    
                    const getTraduccion = (tipo) => {
                      switch(tipo) {
                        case 'mal_estado': return 'Mal estat';
                        case 'lleno': return 'Ple';
                        case 'vandalismo': return 'Vandalisme';
                        case 'ubicacion': return 'Ubicació';
                        case 'olores': return 'Olors';
                        case 'otro': return 'Altres';
                        default: return tipo;
                      }
                    };
                    
                    return (
                      <tr key={tipo} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-4 text-gray-800">{getTraduccion(tipo)}</td>
                        <td className="py-2 px-4 text-gray-800">{tipusTiquets.length}</td>
                        <td className="py-2 px-4 text-gray-800">{pendents}</td>
                        <td className="py-2 px-4 text-gray-800">{resolts}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      {/* Llista de tiquets */}
      <TiquetsList tiquets={tiquetsFiltrats} onTicketStatusChange={handleTiquetUpdated} />
    </div>
  );
}

// Helper functions
function getTraduccionEstado(estado) {
  switch(estado) {
    case 'abierto': return 'Obert';
    case 'en_proceso': return 'En procés';
    case 'resuelto': return 'Resolt';
    case 'rechazado': return 'Rebutjat';
    default: return estado;
  }
}

function getTraduccionPrioridad(prioridad) {
  switch(prioridad) {
    case 'baja': return 'Baixa';
    case 'normal': return 'Normal';
    case 'alta': return 'Alta';
    case 'urgente': return 'Urgent';
    default: return prioridad;
  }
}
