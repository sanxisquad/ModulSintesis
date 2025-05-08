import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid
} from 'recharts';
import { 
  CircleAlert, Trash2, Database, MapPin, 
  RefreshCw, Filter, DownloadCloud, Settings,
  MessageSquare, CheckCircle2, XCircle, Clock
} from 'lucide-react';
import { getAllContenedors, getAllZones, getReportes } from '../../api/zr.api';

export function DashBoard() {
  const [contenidors, setContenidors] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedZone, setSelectedZone] = useState('all');
  const [timeRange, setTimeRange] = useState('month');
  const [reports, setReports] = useState([]);
  const [reportFilter, setReportFilter] = useState('all');

  // Colors per al gràfic
  const COLORS = ['#00C49F', '#FFBB28', '#FF8042'];
  const estadosLabels = {
    'ple': 'Ple',
    'mig': 'Mig Ple',
    'buit': 'Buit'
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [contenidorsResponse, zonesResponse, reportesResponse] = await Promise.all([
          getAllContenedors(),
          getAllZones(),
          getReportes()
        ]);
        
        setContenidors(contenidorsResponse.data);
        setZones(zonesResponse.data);
        setReports(reportesResponse.data);
        setLoading(false);
      } catch (err) {
        console.error("Error carregant dades:", err);
        setError("Hi ha hagut un problema carregant les dades");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtra contenidors per zona seleccionada
  const filteredContenidors = selectedZone === 'all' 
    ? contenidors 
    : contenidors.filter(c => c.zona === parseInt(selectedZone));

  // Filtra reports segons el filtre seleccionat
  const filteredReports = reportFilter === 'all'
    ? reports
    : reports.filter(r => r.estado === reportFilter);

  // Estadístiques generals
  const stats = {
    total: filteredContenidors.length,
    ple: filteredContenidors.filter(c => c.estat === 'ple').length,
    mig_ple: filteredContenidors.filter(c => c.estat === 'mig').length,
    buit: filteredContenidors.filter(c => c.estat === 'buit').length,
    alertes: filteredContenidors.filter(c => c.alerta).length,
    queixes: reports.length,
    queixes_pendents: reports.filter(r => r.estado === 'abierto').length
  };

  // Dades per al gràfic d'estat
  const estatData = [
    { name: 'Ple', value: stats.ple },
    { name: 'Mig Ple', value: stats.mig_ple },
    { name: 'Buit', value: stats.buit }
  ];

  // Dades per al gràfic de zones
  const zonesData = zones.map(zone => ({
    name: zone.nom,
    total: contenidors.filter(c => c.zona === zone.id).length,
    plens: contenidors.filter(c => c.zona === zone.id && c.estat === 'ple').length,
    mig_plens: contenidors.filter(c => c.zona === zone.id && c.estat === 'mig').length,
    buits: contenidors.filter(c => c.zona === zone.id && c.estat === 'buit').length
  }));

  // Dades de tendència (històric de contenidors)
  const getHistoricData = () => {
    const months = ['Gen', 'Feb', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Des'];
    const currentMonth = new Date().getMonth();
    
    return Array(6).fill().map((_, i) => {
      const monthIndex = (currentMonth - 5 + i) % 12;
      return {
        name: months[monthIndex >= 0 ? monthIndex : monthIndex + 12],
        plens: Math.floor(Math.random() * 40) + 20,
        mig_plens: Math.floor(Math.random() * 30) + 15,
        buits: Math.floor(Math.random() * 30) + 10,
      };
    });
  };

  const historicData = getHistoricData();

  // Traductor de tipus de queixa (basats en el model de ReporteContenedor)
  const reportTypesLabels = {
    'mal_estado': 'Contenidor en mal estat',
    'lleno': 'Contenidor ple',
    'vandalismo': 'Vandalisme',
    'ubicacion': 'Problema amb la ubicació',
    'olores': 'Mals olors',
    'otro': 'Altre problema'
  };

  // Traductor d'estats de queixa (basats en el model de ReporteContenedor)
  const reportStatusLabels = {
    'abierto': 'Obert',
    'en_proceso': 'En procés',
    'resuelto': 'Resolt',
    'rechazado': 'Rebutjat'
  };

  // Configuració de colors per estat de queixa
  const reportStatusColors = {
    'abierto': 'bg-yellow-100 text-yellow-700',
    'en_proceso': 'bg-blue-100 text-blue-700',
    'resuelto': 'bg-green-100 text-green-700',
    'rechazado': 'bg-red-100 text-red-700'
  };

  // Icones per estat de queixa
  const reportStatusIcons = {
    'abierto': <Clock className="h-4 w-4 mr-1" />,
    'en_proceso': <RefreshCw className="h-4 w-4 mr-1" />,
    'resuelto': <CheckCircle2 className="h-4 w-4 mr-1" />,
    'rechazado': <XCircle className="h-4 w-4 mr-1" />
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col items-center">
        <RefreshCw className="animate-spin h-12 w-12 text-blue-500" />
        <p className="mt-4 text-lg text-gray-800">Carregant dades...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col items-center">
        <CircleAlert className="h-12 w-12 text-red-500" />
        <p className="mt-4 text-lg text-red-600">{error}</p>
        <button 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => window.location.reload()}
        >
          Tornar a intentar
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Dashboard d'Administració</h1>
            <div className="flex space-x-4">
              <button className="p-2 hover:bg-blue-700 rounded text-white">
                <Settings className="h-5 w-5" />
              </button>
              <button className="flex items-center bg-blue-500 hover:bg-blue-700 px-3 py-1 rounded text-white">
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualitzar
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Filtres */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-wrap items-center justify-between">
            <div className="flex items-center mb-2 md:mb-0">
              <Filter className="h-5 w-5 text-gray-500 mr-2" />
              <span className="font-medium text-gray-800">Filtres:</span>
            </div>
            <div className="flex flex-wrap gap-4">
              <div>
                <label htmlFor="zone-filter" className="block text-sm text-gray-600 mb-1">Zona:</label>
                <select 
                  id="zone-filter" 
                  className="border rounded px-3 py-1 text-gray-800"
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value)}
                >
                  <option value="all">Totes les zones</option>
                  {zones.map(zone => (
                    <option key={zone.id} value={zone.id} className="text-gray-800">
                      {zone.nom}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="time-range" className="block text-sm text-gray-600 mb-1">Període:</label>
                <select 
                  id="time-range" 
                  className="border rounded px-3 py-1 text-gray-800"
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                >
                  <option value="week">Setmana</option>
                  <option value="month">Mes</option>
                  <option value="quarter">Trimestre</option>
                  <option value="year">Any</option>
                </select>
              </div>
              <div className="flex items-end">
                <button className="flex items-center bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded">
                  <DownloadCloud className="h-4 w-4 mr-2" />
                  Exportar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Targetes d'estadístiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Contenidors</p>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <Database className="h-10 w-10 text-blue-500" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Contenidors Plens</p>
                <p className="text-2xl font-bold text-gray-800">{stats.ple}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-red-500 flex items-center justify-center">
                <Trash2 className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Mig Plens</p>
                <p className="text-2xl font-bold text-gray-800">{stats.mig_ple}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-yellow-500 flex items-center justify-center">
                <Trash2 className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Buits</p>
                <p className="text-2xl font-bold text-gray-800">{stats.buit}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                <Trash2 className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Alertes</p>
                <p className="text-2xl font-bold text-gray-800">{stats.alertes}</p>
              </div>
              <CircleAlert className="h-10 w-10 text-red-500" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Queixes</p>
                <p className="text-2xl font-bold text-gray-800">{stats.queixes_pendents}/{stats.queixes}</p>
              </div>
              <MessageSquare className="h-10 w-10 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Gràfics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Gràfic d'estat dels contenidors */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-medium mb-4 text-gray-800">Distribució d'Estat</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={estatData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {estatData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gràfic de tendències */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-medium mb-4 text-gray-800">Tendència (últims 6 mesos)</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historicData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="plens" stroke="#FF8042" name="Plens" />
                  <Line type="monotone" dataKey="mig_plens" stroke="#FFBB28" name="Mig Plens" />
                  <Line type="monotone" dataKey="buits" stroke="#00C49F" name="Buits" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Gràfic per zones */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h2 className="text-lg font-medium mb-4 text-gray-800">Estat per Zones</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={zonesData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="plens" name="Plens" fill="#FF8042" />
                <Bar dataKey="mig_plens" name="Mig Plens" fill="#FFBB28" />
                <Bar dataKey="buits" name="Buits" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Llistat de Contenidors */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h2 className="text-lg font-medium mb-4 text-gray-800">
            Llistat de Contenidors {selectedZone !== 'all' ? `- ${zones.find(z => z.id == selectedZone)?.nom || ''}` : ''}
          </h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 text-left text-gray-700">ID</th>
                  <th className="py-2 px-4 text-left text-gray-700">Zona</th>
                  <th className="py-2 px-4 text-left text-gray-700">Estat</th>
                  <th className="py-2 px-4 text-left text-gray-700">Ubicació</th>
                  <th className="py-2 px-4 text-left text-gray-700">Alerta</th>
                </tr>
              </thead>
              <tbody>
                {filteredContenidors.slice(0, 5).map(contenidor => {
                  const zonaName = zones.find(z => z.id === contenidor.zona)?.nom || 'Desconeguda';
                  
                  let estatColor;
                  switch(contenidor.estat) {
                    case 'ple': estatColor = 'bg-red-100 text-red-700'; break;
                    case 'mig': estatColor = 'bg-yellow-100 text-yellow-700'; break;
                    case 'buit': estatColor = 'bg-green-100 text-green-700'; break;
                    default: estatColor = 'bg-gray-100 text-gray-700';
                  }

                  return (
                    <tr key={contenidor.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4 text-gray-800">{contenidor.id}</td>
                      <td className="py-2 px-4 text-gray-800">{zonaName}</td>
                      <td className="py-2 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${estatColor}`}>
                          {estadosLabels[contenidor.estat] || contenidor.estat}
                        </span>
                      </td>
                      <td className="py-2 px-4 text-gray-800">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-gray-500 mr-1" />
                          {contenidor.ubicacio || 'No especificada'}
                        </div>
                      </td>
                      <td className="py-2 px-4">
                        {contenidor.alerta ? (
                          <span className="text-red-500 flex items-center">
                            <CircleAlert className="h-4 w-4 mr-1" />
                            Sí
                          </span>
                        ) : (
                          <span className="text-green-500">No</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filteredContenidors.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-4 text-center text-gray-500">
                      No s'han trobat contenidors amb els filtres seleccionats
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {filteredContenidors.length > 5 && (
            <div className="mt-4 text-center">
              <button className="text-blue-500 hover:text-blue-700">
                Veure tots els {filteredContenidors.length} contenidors
              </button>
            </div>
          )}
        </div>

        {/* Secció de Queixes i Reportes */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-800">
              Queixes i Reportes dels Usuaris
            </h2>
            <div className="flex gap-2">
              <select 
                className="border rounded px-3 py-1 text-gray-800"
                value={reportFilter}
                onChange={(e) => setReportFilter(e.target.value)}
              >
                <option value="all">Tots els estats</option>
                <option value="abierto">Oberts</option>
                <option value="en_proceso">En procés</option>
                <option value="resuelto">Resolts</option>
                <option value="rechazado">Rebutjats</option>
              </select>
              <button 
                className="flex items-center bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded"
                onClick={() => {
                  setLoading(true);
                  getReportes()
                    .then(res => {
                      setReports(res.data);
                      setLoading(false);
                    })
                    .catch(err => {
                      console.error("Error actualitzant reportes:", err);
                      setLoading(false);
                    });
                }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualitzar
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 text-left text-gray-700">ID</th>
                  <th className="py-2 px-4 text-left text-gray-700">Data</th>
                  <th className="py-2 px-4 text-left text-gray-700">Tipus</th>
                  <th className="py-2 px-4 text-left text-gray-700">Descripció</th>
                  <th className="py-2 px-4 text-left text-gray-700">Contenidor/Zona</th>
                  <th className="py-2 px-4 text-left text-gray-700">Estat</th>
                  <th className="py-2 px-4 text-left text-gray-700">Accions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.slice(0, 5).map(report => {
                  const contenedorInfo = report.contenedor ? 
                    `Contenidor #${report.contenedor}` : 
                    report.zona ? `Zona #${report.zona}` : 'No especificat';
                
                  const zonaName = report.contenedor && contenidors.find(c => c.id === report.contenedor)?.zona_nombre;
                  
                  return (
                    <tr key={report.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4 text-gray-800">{report.id}</td>
                      <td className="py-2 px-4 text-gray-800">{new Date(report.fecha).toLocaleDateString()}</td>
                      <td className="py-2 px-4 text-gray-800">
                        {reportTypesLabels[report.tipo] || report.tipo}
                      </td>
                      <td className="py-2 px-4 text-gray-800 truncate max-w-xs" title={report.descripcion}>
                        {report.descripcion.length > 40 ? `${report.descripcion.substring(0, 40)}...` : report.descripcion}
                      </td>
                      <td className="py-2 px-4 text-gray-800">
                        {contenedorInfo} {zonaName ? `(${zonaName})` : ''}
                      </td>
                      <td className="py-2 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${reportStatusColors[report.estado]}`}>
                          {reportStatusIcons[report.estado]}
                          {reportStatusLabels[report.estado] || report.estado}
                        </span>
                      </td>
                      <td className="py-2 px-4">
                        <div className="flex space-x-2">
                          <button className="text-blue-500 hover:text-blue-700" title="Veure detalls">
                            Detalls
                          </button>
                          {report.estado === 'abierto' && (
                            <button className="text-green-500 hover:text-green-700" title="Processar">
                              Processar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredReports.length === 0 && (
                  <tr>
                    <td colSpan="7" className="py-4 text-center text-gray-500">
                      No s'han trobat queixes amb els filtres seleccionats
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {filteredReports.length > 5 && (
            <div className="mt-4 text-center">
              <button className="text-blue-500 hover:text-blue-700">
                Veure totes les {filteredReports.length} queixes
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-4 mt-6">
        <div className="container mx-auto px-4 text-center">
          <p>© 2025 Sistema de Gestió de Contenidors</p>
        </div>
      </footer>
    </div>
  );
}