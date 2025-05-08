import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid
} from 'recharts';
import { 
  CircleAlert, Trash2, Database, MapPin, 
  RefreshCw, Filter, DownloadCloud, Settings,
  MessageSquare, CheckCircle2, XCircle, Clock,
  RecycleIcon, FileText // Añadimos nuevos iconos
} from 'lucide-react';
import { getAllContenedors, getAllZones, getReportes } from '../../api/zr.api';
import { useMenu } from '../../context/MenuContext';

export function DashBoard() {
  const { menuOpen } = useMenu();
  const [contenidors, setContenidors] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedZone, setSelectedZone] = useState('all');
  const [timeRange, setTimeRange] = useState('month');
  const [reports, setReports] = useState([]);
  const [reportFilter, setReportFilter] = useState('all');
  const [activeSection, setActiveSection] = useState('reciclaje');
  const [selectedEstat, setSelectedEstat] = useState(null); 
  const [alertaFilter, setAlertaFilter] = useState(false); // New state for alert filtering
  const [reportStatusFilter, setReportStatusFilter] = useState(null); // New state for report status filtering

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

  // Filtra contenidors per zona seleccionada, estat seleccionat i alertes
  const filteredContenidors = contenidors.filter(c => {
    // Filter by zone
    if (selectedZone !== 'all' && c.zona !== parseInt(selectedZone)) return false;
    
    // Filter by selected estat if any
    if (selectedEstat && c.estat !== selectedEstat) return false;
    
    // Filter by alert status if enabled
    if (alertaFilter && !c.alerta) return false;
    
    return true;
  });

  // Filtra reports segons el filtre seleccionat i l'estat seleccionat del card
  const filteredReports = reports.filter(r => {
    // Filter by status dropdown if selected
    if (reportFilter !== 'all' && r.estado !== reportFilter) return false;
    
    // Filter by card selection if any
    if (reportStatusFilter && r.estado !== reportStatusFilter) return false;
    
    return true;
  });

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

  // Handler for clicking a stat card
  const handleEstatCardClick = (estat) => {
    // Clear any alert filter first
    setAlertaFilter(false);
    // Toggle selected state - if already selected, clear the filter
    setSelectedEstat(prevEstat => prevEstat === estat ? null : estat);
  };

  // Handler for clicking alert card
  const handleAlertCardClick = () => {
    // Clear any estat filter first
    setSelectedEstat(null);
    // Toggle alert filter
    setAlertaFilter(prev => !prev);
  };

  // Handler for clicking report status card
  const handleReportStatusCardClick = (status) => {
    // Toggle status filter - if already selected, clear the filter
    setReportStatusFilter(prevStatus => prevStatus === status ? null : status);
  };

  return (
    <div className={`transition-all duration-300 ease-in-out bg-gray-50 min-h-screen ${menuOpen ? 'ml-64' : 'ml-0'} px-4 sm:px-6 md:px-8 py-6`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="pb-5 border-b border-gray-200 mb-6">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-full mr-3">
              <Database className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Dashboard d'Administració</h1>
              <p className="text-gray-500 text-sm">Estadístiques i control del sistema</p>
            </div>
          </div>
        </div>

        {/* Botones grandes de sección */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <button 
            className={`flex items-center justify-center p-8 rounded-lg shadow-md transition-all ${
              activeSection === 'reciclaje' 
                ? 'bg-green-600 text-white scale-105' 
                : 'bg-white text-gray-800 hover:bg-green-50'
            }`}
            onClick={() => setActiveSection('reciclaje')}
          >
            <Trash2 className={`h-10 w-10 ${activeSection === 'reciclaje' ? 'text-white' : 'text-green-600'} mr-4`} />
            <div className="text-left">
              <h2 className="text-xl font-bold">Contenidors i Zones</h2>
              <p className={`${activeSection === 'reciclaje' ? 'text-green-100' : 'text-gray-600'}`}>
                Gestió i estadístiques del sistema de reciclatge
              </p>
            </div>
          </button>
          
          <button 
            className={`flex items-center justify-center p-8 rounded-lg shadow-md transition-all ${
              activeSection === 'reportes' 
                ? 'bg-purple-600 text-white scale-105' 
                : 'bg-white text-gray-800 hover:bg-purple-50'
            }`}
            onClick={() => setActiveSection('reportes')}
          >
            <MessageSquare className={`h-10 w-10 ${activeSection === 'reportes' ? 'text-white' : 'text-purple-600'} mr-4`} />
            <div className="text-left">
              <h2 className="text-xl font-bold">Reportes i Incidències</h2>
              <p className={`${activeSection === 'reportes' ? 'text-purple-100' : 'text-gray-600'}`}>
                Queixes i reportes d'usuaris
              </p>
            </div>
          </button>
        </div>

        {/* Targetes d'estadístiques dinàmiques segons l'active section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          {activeSection === 'reciclaje' ? (
            // Contenidors stats
            <>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Contenidors</p>
                    <p className="text-2xl font-bold text-gray-800">{contenidors.length}</p>
                  </div>
                  <Database className="h-10 w-10 text-blue-500" />
                </div>
              </div>
              
              <div 
                className={`bg-white p-4 rounded-lg shadow cursor-pointer transition-all hover:shadow-md ${
                  selectedEstat === 'ple' ? 'ring-2 ring-red-500' : ''
                }`}
                onClick={() => handleEstatCardClick('ple')}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Contenidors Plens</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {contenidors.filter(c => c.estat === 'ple').length}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {Math.round(contenidors.filter(c => c.estat === 'ple').length / contenidors.length * 100) || 0}% del total
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-red-500 flex items-center justify-center">
                    <Trash2 className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
              
              <div 
                className={`bg-white p-4 rounded-lg shadow cursor-pointer transition-all hover:shadow-md ${
                  selectedEstat === 'mig' ? 'ring-2 ring-yellow-500' : ''
                }`}
                onClick={() => handleEstatCardClick('mig')}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Mig Plens</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {contenidors.filter(c => c.estat === 'mig').length}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {Math.round(contenidors.filter(c => c.estat === 'mig').length / contenidors.length * 100) || 0}% del total
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-yellow-500 flex items-center justify-center">
                    <Trash2 className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
              
              <div 
                className={`bg-white p-4 rounded-lg shadow cursor-pointer transition-all hover:shadow-md ${
                  selectedEstat === 'buit' ? 'ring-2 ring-green-500' : ''
                }`}
                onClick={() => handleEstatCardClick('buit')}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Buits</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {contenidors.filter(c => c.estat === 'buit').length}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {Math.round(contenidors.filter(c => c.estat === 'buit').length / contenidors.length * 100) || 0}% del total
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                    <Trash2 className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
              
              <div 
                className={`bg-white p-4 rounded-lg shadow cursor-pointer transition-all hover:shadow-md ${
                  alertaFilter ? 'ring-2 ring-red-500' : ''
                }`}
                onClick={handleAlertCardClick}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Alertes</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {contenidors.filter(c => c.alerta).length}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {Math.round(contenidors.filter(c => c.alerta).length / contenidors.length * 100) || 0}% del total
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                    <CircleAlert className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </div>
            </>
          ) : (
            // Reports stats - when in reportes section
            <>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Reportes</p>
                    <p className="text-2xl font-bold text-gray-800">{reports.length}</p>
                  </div>
                  <MessageSquare className="h-10 w-10 text-purple-500" />
                </div>
              </div>
              
              <div 
                className={`bg-white p-4 rounded-lg shadow cursor-pointer transition-all hover:shadow-md ${
                  reportStatusFilter === 'abierto' ? 'ring-2 ring-yellow-500' : ''
                }`}
                onClick={() => handleReportStatusCardClick('abierto')}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pendents</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {reports.filter(r => r.estado === 'abierto').length}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {Math.round(reports.filter(r => r.estado === 'abierto').length / reports.length * 100) || 0}% del total
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </div>
              
              <div 
                className={`bg-white p-4 rounded-lg shadow cursor-pointer transition-all hover:shadow-md ${
                  reportStatusFilter === 'en_proceso' ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => handleReportStatusCardClick('en_proceso')}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">En Procés</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {reports.filter(r => r.estado === 'en_proceso').length}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {Math.round(reports.filter(r => r.estado === 'en_proceso').length / reports.length * 100) || 0}% del total
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <RefreshCw className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>
              
              <div 
                className={`bg-white p-4 rounded-lg shadow cursor-pointer transition-all hover:shadow-md ${
                  reportStatusFilter === 'resuelto' ? 'ring-2 ring-green-500' : ''
                }`}
                onClick={() => handleReportStatusCardClick('resuelto')}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Resolts</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {reports.filter(r => r.estado === 'resuelto').length}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {Math.round(reports.filter(r => r.estado === 'resuelto').length / reports.length * 100) || 0}% del total
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>
              
              <div 
                className={`bg-white p-4 rounded-lg shadow cursor-pointer transition-all hover:shadow-md ${
                  reportStatusFilter === 'rechazado' ? 'ring-2 ring-red-500' : ''
                }`}
                onClick={() => handleReportStatusCardClick('rechazado')}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Rebutjats</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {reports.filter(r => r.estado === 'rechazado').length}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {Math.round(reports.filter(r => r.estado === 'rechazado').length / reports.length * 100) || 0}% del total
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                    <XCircle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Filtres - update to show active filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-wrap items-center justify-between">
            <div className="flex items-center mb-2 md:mb-0">
              <Filter className="h-5 w-5 text-gray-500 mr-2" />
              <span className="font-medium text-gray-800">Filtres:</span>
              
              {activeSection === 'reciclaje' && (
                <>
                  {selectedEstat && (
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      Estat: {estadosLabels[selectedEstat]}
                      <button
                        className="ml-1 text-blue-500 hover:text-blue-700"
                        onClick={() => setSelectedEstat(null)}
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {alertaFilter && (
                    <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                      Amb alertes
                      <button
                        className="ml-1 text-red-500 hover:text-red-700"
                        onClick={() => setAlertaFilter(false)}
                      >
                        ×
                      </button>
                    </span>
                  )}
                </>
              )}
              
              {activeSection === 'reportes' && reportStatusFilter && (
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  Estat: {reportStatusLabels[reportStatusFilter]}
                  <button
                    className="ml-1 text-blue-500 hover:text-blue-700"
                    onClick={() => setReportStatusFilter(null)}
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-4">
              {activeSection === 'reciclaje' && (
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
              )}
              {activeSection === 'reportes' && (
                <div>
                  <label htmlFor="report-filter" className="block text-sm text-gray-600 mb-1">Estat:</label>
                  <select 
                    id="report-filter" 
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
                </div>
              )}
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

        {/* Contenido específico de la sección "Reciclaje" */}
        {activeSection === 'reciclaje' && (
          <>
            {/* Gràfics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Gràfic d'estat dels contenidors */}
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
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
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
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
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
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
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
              <h2 className="text-lg font-medium mb-4 text-gray-800">
                Llistat de Contenidors 
                {selectedZone !== 'all' ? ` - ${zones.find(z => z.id == selectedZone)?.nom || ''}` : ''}
                {selectedEstat ? ` - ${estadosLabels[selectedEstat] || selectedEstat}` : ''}
                {alertaFilter ? ' - Amb alertes' : ''}
                {(selectedEstat || alertaFilter) && <span className="text-sm text-gray-500 ml-2">({filteredContenidors.length} contenidors)</span>}
              </h2>
              
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-2 px-4 text-left text-gray-700">Codi</th>
                      <th className="py-2 px-4 text-left text-gray-700">Zona</th>
                      <th className="py-2 px-4 text-left text-gray-700">Estat</th>
                      <th className="py-2 px-4 text-left text-gray-700">Ubicació</th>
                      <th className="py-2 px-4 text-left text-gray-700">Alerta</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContenidors.slice(0, 5).map(contenidor => {
                      const zonaName = zones.find(z => z.id === contenidor.zona)?.nom || 'No pertany a a cap zona';
                      
                      let estatColor;
                      switch(contenidor.estat) {
                        case 'ple': estatColor = 'bg-red-100 text-red-700'; break;
                        case 'mig': estatColor = 'bg-yellow-100 text-yellow-700'; break;
                        case 'buit': estatColor = 'bg-green-100 text-green-700'; break;
                        default: estatColor = 'bg-gray-100 text-gray-700';
                      }

                      return (
                        <tr key={contenidor.id} className="border-b hover:bg-gray-50">
                          <td className="py-2 px-4 text-gray-800">
                            <Link 
                              to={`/contenedor/${contenidor.id}`} 
                              className="text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              {contenidor.cod}
                            </Link>
                          </td>
                          <td className="py-2 px-4 text-gray-800">{zonaName}</td>
                          <td className="py-2 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${estatColor}`}>
                              {estadosLabels[contenidor.estat] || contenidor.estat}
                            </span>
                          </td>
                          <td className="py-2 px-4 text-gray-800">
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 text-gray-500 mr-1" />
                              {contenidor.ciutat || 'No especificada'}
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
                  <Link 
                    to="/gestor-contenedors" 
                    className="text-blue-500 hover:text-blue-700 hover:underline inline-block"
                  >
                    Veure tots els {filteredContenidors.length} contenidors
                  </Link>
                </div>
              )}
            </div>
          </>
        )}

        {/* Contenido específico de la sección "Reportes" */}
        {activeSection === 'reportes' && (
          <>
            {/* Estadístiques de reportes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Gráfico de estados de reportes */}
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-lg font-medium mb-4 text-gray-800">Estat dels Reportes</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Oberts', value: reports.filter(r => r.estado === 'abierto').length },
                          { name: 'En procés', value: reports.filter(r => r.estado === 'en_proceso').length },
                          { name: 'Resolts', value: reports.filter(r => r.estado === 'resuelto').length },
                          { name: 'Rebutjats', value: reports.filter(r => r.estado === 'rechazado').length }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill="#FFBB28" /> {/* Oberts - Amarillo */}
                        <Cell fill="#0088FE" /> {/* En procés - Azul */}
                        <Cell fill="#00C49F" /> {/* Resolts - Verde */}
                        <Cell fill="#FF8042" /> {/* Rebutjats - Naranja */}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Gráfico de tipos de reportes */}
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-lg font-medium mb-4 text-gray-800">Tipus de Reportes</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: 'Mal estat', value: reports.filter(r => r.tipo === 'mal_estado').length },
                        { name: 'Ple', value: reports.filter(r => r.tipo === 'lleno').length },
                        { name: 'Vandalisme', value: reports.filter(r => r.tipo === 'vandalismo').length },
                        { name: 'Ubicació', value: reports.filter(r => r.tipo === 'ubicacion').length },
                        { name: 'Olors', value: reports.filter(r => r.tipo === 'olores').length },
                        { name: 'Altres', value: reports.filter(r => r.tipo === 'otro').length }
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" name="Quantitat" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Secció de Queixes i Reportes */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-800">
                  Queixes i Reportes dels Usuaris
                  {reportStatusFilter ? ` - ${reportStatusLabels[reportStatusFilter]}` : ''}
                  {reportStatusFilter && <span className="text-sm text-gray-500 ml-2">({filteredReports.length} reportes)</span>}
                </h2>
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
              
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead className="bg-gray-100">
                    <tr>
                      {/* ID column removed */}
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
                          {/* ID cell removed */}
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
                              <Link 
                                to={`/gestor/tiquets/${report.id}`}
                                className="text-blue-500 hover:text-blue-700" 
                                title="Veure detalls"
                              >
                                Detalls
                              </Link>
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
                        <td colSpan="6" className="py-4 text-center text-gray-500">
                          No s'han trobat queixes amb els filtres seleccionats
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {filteredReports.length > 5 && (
                <div className="mt-4 text-center">
                  <Link 
                    to="/gestor-tiquets"
                    className="text-blue-500 hover:text-blue-700 hover:underline"
                  >
                    Veure totes les {filteredReports.length} queixes
                  </Link>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}