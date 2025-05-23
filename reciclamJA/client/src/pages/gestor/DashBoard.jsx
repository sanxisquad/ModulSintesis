import React, { useState, useEffect } from 'react';
import { useMenu } from '../../context/MenuContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import apiConfig from '../../api/apiClient';
import { getAllContenedors, getAllZones, getReportes, getHistorialStats } from '../../api/zr.api';
import { 
  CircleAlert, Trash2, Database, MapPin, 
  RefreshCw, Filter, DownloadCloud, Settings,
  MessageSquare, CheckCircle2, XCircle, Clock,
  RecycleIcon, FileText, Flag 
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, LineChart, Line
} from 'recharts';

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
  const [alertaFilter, setAlertaFilter] = useState(false);
  const [reportStatusFilter, setReportStatusFilter] = useState(null);
  const [reportPriorityFilter, setReportPriorityFilter] = useState(null); 
  const [reportFilterMode, setReportFilterMode] = useState('estat'); 
  const [historicData, setHistoricData] = useState([]);
  
  const COLORS = ['#00C49F', '#FFBB28', '#FF8042'];
  
  
  const COLORS_ESTAT = {
    abierto: '#FFBB28',    
    en_proceso: '#0088FE',  
    resuelto: '#00C49F',   
    rechazado: '#FF8042'   
  };
  
  const COLORS_PRIORITAT = {
    baja: '#00C49F',     
    normal: '#0088FE',   
    alta: '#FFBB28',     
    urgente: '#FF8042'   
  };
  
  // Colors for report types chart
  const COLORS_TIPO = {
    'mal_estado': '#8884d8', // Purple
    'lleno': '#82ca9d',      // Light green
    'vandalismo': '#ffc658', // Yellow
    'ubicacion': '#ff7300',  // Orange
    'olores': '#0088FE',     // Blue
    'otro': '#FF8042'        // Dark orange
  };
  
  const estadosLabels = {
    'ple': 'Ple',
    'mig': 'Mig Ple',
    'buit': 'Buit'
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Cargar contenedores y zonas
        const [contenedorsResponse, zonesResponse, reportsResponse] = await Promise.all([
          getAllContenedors(),
          getAllZones(),
          getReportes()
        ]);
        
        setContenidors(contenedorsResponse.data);
        setZones(zonesResponse.data);
        setReports(reportsResponse.data);
        setError(null);
      } catch (error) {
        console.error("Error carregant dades:", error);
        setError("Hi ha hagut un problema carregant les dades");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Añadir un useEffect separat per carregar dades històriques
  useEffect(() => {
    const fetchHistoricData = async () => {
      try {
        console.log("Fetching historic data with timeRange:", timeRange, "and zone:", selectedZone);
        setLoading(true);
        
        // Usar la funció actualizada amb el parámetro de zona
        const response = await getHistorialStats(timeRange, selectedZone);
        
        console.log("Historic data response:", response.data);
        setHistoricData(response.data);
      } catch (error) {
        console.error("Error fetching historic data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistoricData();
  }, [timeRange, selectedZone]); // Añadir selectedZone como dependencia

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

  // Filtrar solo por zona para los gráficos (sin filtrar por estado o alertas)
  const zoneFilteredContenidors = contenidors.filter(c => 
    selectedZone === 'all' || c.zona === parseInt(selectedZone)
  );

  // Filtra reports segons el filtre seleccionat i l'estat/prioritat
  const filteredReports = reports.filter(r => {
    // Filter by status dropdown if selected
    if (reportFilter !== 'all' && r.estado !== reportFilter) return false;
    
    // Filter by status card if any
    if (reportStatusFilter && r.estado !== reportStatusFilter) return false;
    
    // Filter by priority card if any
    if (reportPriorityFilter) {
      const reportPriority = r.prioridad || 'normal';
      if (reportPriority !== reportPriorityFilter) return false;
    }
    
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

  // Dades per al gràfic d'estat - ara usando contenedores filtrados por zona
  const estatData = [
    { name: 'Ple', value: zoneFilteredContenidors.filter(c => c.estat === 'ple').length },
    { name: 'Mig Ple', value: zoneFilteredContenidors.filter(c => c.estat === 'mig').length },
    { name: 'Buit', value: zoneFilteredContenidors.filter(c => c.estat === 'buit').length }
  ];

  // Dades per al gràfic de zones - filtrar solo la zona seleccionada si hay alguna
  const zonesData = selectedZone === 'all' 
    ? zones.map(zone => ({
        name: zone.nom,
        total: contenidors.filter(c => c.zona === zone.id).length,
        plens: contenidors.filter(c => c.zona === zone.id && c.estat === 'ple').length,
        mig_plens: contenidors.filter(c => c.zona === zone.id && c.estat === 'mig').length,
        buits: contenidors.filter(c => c.zona === zone.id && c.estat === 'buit').length
      }))
    : zones
        .filter(zone => zone.id === parseInt(selectedZone))
        .map(zone => ({
          name: zone.nom,
          total: contenidors.filter(c => c.zona === zone.id).length,
          plens: contenidors.filter(c => c.zona === zone.id && c.estat === 'ple').length,
          mig_plens: contenidors.filter(c => c.zona === zone.id && c.estat === 'mig').length,
          buits: contenidors.filter(c => c.zona === zone.id && c.estat === 'buit').length
        }));

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

  // Traductor de prioritats
  const priorityLabels = {
    'baja': 'Baixa',
    'normal': 'Normal',
    'alta': 'Alta',
    'urgente': 'Urgent'
  };

  // Configuració de colors per estat de queixa
  const reportStatusColors = {
    'abierto': 'bg-yellow-100 text-yellow-700',
    'en_proceso': 'bg-blue-100 text-blue-700',
    'resuelto': 'bg-green-100 text-green-700',
    'rechazado': 'bg-red-100 text-red-700'
  };

  // Configuració de colors per prioritat
  const priorityColors = {
    'baja': 'bg-green-100 text-green-700',
    'normal': 'bg-blue-100 text-blue-700',
    'alta': 'bg-yellow-100 text-yellow-700',
    'urgente': 'bg-red-100 text-red-700'
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

  const handleEstatCardClick = (estat) => {
    setAlertaFilter(false);
    setSelectedEstat(prevEstat => prevEstat === estat ? null : estat);
  };

  const handleAlertCardClick = () => {
    setSelectedEstat(null);
    setAlertaFilter(prev => !prev);
  };

  const handleReportStatusCardClick = (status) => {
    setReportStatusFilter(prevStatus => prevStatus === status ? null : status);
  };

  const handleReportPriorityCardClick = (priority) => {
    setReportPriorityFilter(prevPriority => prevPriority === priority ? null : priority);
  };

  const toggleReportFilterMode = () => {
    setReportFilterMode(prevMode => prevMode === 'estat' ? 'prioritat' : 'estat');
  };

  // Método para manejar cambios en el rango de tiempo
  const handleTimeRangeChange = (e) => {
    setTimeRange(e.target.value);
  };

  // Improved chart section with loading spinner
  const renderHistoricChartSection = (historicData, loading, timeRange, handleTimeRangeChange, COLORS) => {
    return (
      <div className="bg-white shadow rounded-lg p-4 mb-6">
       <div className="w-full h-64">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="flex flex-col items-center">
                <RefreshCw className="animate-spin h-8 w-8 text-green-500 mb-2" />
                <p className="text-sm text-gray-500">Carregant dades...</p>
              </div>
            </div>
          ) : historicData && historicData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={historicData}
                margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="plens" name="Plens" fill={COLORS[0]} />
                <Bar dataKey="mig_plens" name="Mig plens" fill={COLORS[1]} />
                <Bar dataKey="buits" name="Buits" fill={COLORS[2]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">No hi ha dades disponibles</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Renderizar el componente - Modificamos solo el contenedor exterior
  return (
    <div className="bg-gray-50 min-h-screen px-4 sm:px-6 md:px-8 py-6">
      <div className="max-w-7xl mx-auto">
        {/* Header con título */}

        {/* Contenido existente del dashboard */}
        <div className={`transition-all duration-300 ${menuOpen ? 'ml-64' : 'ml-0'}`}>
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

          {/* Botones grans de secció */}
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
                
                {reportFilterMode === 'estat' ? (
                  // Status cards
                  <>
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
                ) : (
                  // Priority cards
                  <>
                    <div 
                      className={`bg-white p-4 rounded-lg shadow cursor-pointer transition-all hover:shadow-md ${
                        reportPriorityFilter === 'baja' ? 'ring-2 ring-green-500' : ''
                      }`}
                      onClick={() => handleReportPriorityCardClick('baja')}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Baixa</p>
                          <p className="text-2xl font-bold text-gray-800">
                            {reports.filter(r => r.prioridad === 'baja').length}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {Math.round(reports.filter(r => r.prioridad === 'baja').length / reports.length * 100) || 0}% del total
                          </p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                          <Flag className="h-6 w-6 text-green-600" />
                        </div>
                      </div>
                    </div>
                    
                    <div 
                      className={`bg-white p-4 rounded-lg shadow cursor-pointer transition-all hover:shadow-md ${
                        reportPriorityFilter === 'normal' ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => handleReportPriorityCardClick('normal')}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Normal</p>
                          <p className="text-2xl font-bold text-gray-800">
                            {reports.filter(r => !r.prioridad || r.prioridad === 'normal').length}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {Math.round(reports.filter(r => !r.prioridad || r.prioridad === 'normal').length / reports.length * 100) || 0}% del total
                          </p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Flag className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                    </div>
                    
                    <div 
                      className={`bg-white p-4 rounded-lg shadow cursor-pointer transition-all hover:shadow-md ${
                        reportPriorityFilter === 'alta' ? 'ring-2 ring-yellow-500' : ''
                      }`}
                      onClick={() => handleReportPriorityCardClick('alta')}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Alta</p>
                          <p className="text-2xl font-bold text-gray-800">
                            {reports.filter(r => r.prioridad === 'alta').length}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {Math.round(reports.filter(r => r.prioridad === 'alta').length / reports.length * 100) || 0}% del total
                          </p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                          <Flag className="h-6 w-6 text-yellow-600" />
                        </div>
                      </div>
                    </div>
                    
                    <div 
                      className={`bg-white p-4 rounded-lg shadow cursor-pointer transition-all hover:shadow-md ${
                        reportPriorityFilter === 'urgente' ? 'ring-2 ring-red-500' : ''
                      }`}
                      onClick={() => handleReportPriorityCardClick('urgente')}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Urgent</p>
                          <p className="text-2xl font-bold text-gray-800">
                            {reports.filter(r => r.prioridad === 'urgente').length}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {Math.round(reports.filter(r => r.prioridad === 'urgente').length / reports.length * 100) || 0}% del total
                          </p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                          <Flag className="h-6 w-6 text-red-600" />
                        </div>
                      </div>
                    </div>
                  </>
                )}
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
                
                {activeSection === 'reportes' && (
                  <>
                    {reportStatusFilter && (
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
                    {reportPriorityFilter && (
                      <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                        Prioritat: {priorityLabels[reportPriorityFilter]}
                        <button
                          className="ml-1 text-purple-500 hover:text-purple-700"
                          onClick={() => setReportPriorityFilter(null)}
                        >
                          ×
                        </button>
                      </span>
                    )}
                  </>
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
                  <>
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
                    <div>
                      <button 
                        className="flex items-center mt-5 bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded"
                        onClick={toggleReportFilterMode}
                      >
                        <Filter className="h-4 w-4 mr-2" />
                        {reportFilterMode === 'estat' ? 'Veure per prioritat' : 'Veure per estat'}
                      </button>
                    </div>
                  </>
                )}
                <div>
                  <label htmlFor="time-range" className="block text-sm text-gray-600 mb-1">Període:</label>
                  <select 
                    id="time-range" 
                    className="border rounded px-3 py-1 text-gray-800"
                    value={timeRange}
                    onChange={handleTimeRangeChange}
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
                  <h2 className="text-lg font-medium mb-4 text-gray-800">
                    Distribució d'Estat
                    {selectedZone !== 'all' && (
                      <span className="text-sm font-normal text-gray-500 ml-2">
                        ({zones.find(z => z.id === parseInt(selectedZone))?.nom || 'Zona seleccionada'})
                      </span>
                    )}
                    {(selectedEstat || alertaFilter) && (
                      <span className="text-sm font-normal text-gray-500 ml-2">
                        (filtrat per zona)
                      </span>
                    )}
                  </h2>
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
                        <Tooltip formatter={(value) => [`${value} contenidors`, '']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Gràfic de tendències */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <h2 className="text-lg font-medium mb-4 text-gray-800">
                    Evolució d'estat dels contenidors
                    {selectedZone !== 'all' && (
                      <span className="text-sm font-normal text-gray-500 ml-2">
                        ({zones.find(z => z.id === parseInt(selectedZone))?.nom || 'Zona seleccionada'})
                      </span>
                    )}
                  </h2>
                  {renderHistoricChartSection(historicData, loading, timeRange, handleTimeRangeChange, COLORS)}
                </div>
              </div>

              {/* Gràfic per zones - actualizar también el título segons la zona */}
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
                <h2 className="text-lg font-medium mb-4 text-gray-800">
                  {selectedZone === 'all' 
                    ? "Estat per Zones" 
                    : `Estat de la Zona: ${zones.find(z => z.id === parseInt(selectedZone))?.nom || 'Seleccionada'}`}
                </h2>
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
                {/* Gráfico de estados de reportes/prioridades */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <h2 className="text-lg font-medium mb-4 text-gray-800">
                    {reportFilterMode === 'estat' ? 'Estat dels Reportes' : 'Prioritat dels Reportes'}
                  </h2>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={reportFilterMode === 'estat' ? [
                            { name: 'Oberts', value: reports.filter(r => r.estado === 'abierto').length, estado: 'abierto' },
                            { name: 'En procés', value: reports.filter(r => r.estado === 'en_proceso').length, estado: 'en_proceso' },
                            { name: 'Resolts', value: reports.filter(r => r.estado === 'resuelto').length, estado: 'resuelto' },
                            { name: 'Rebutjats', value: reports.filter(r => r.estado === 'rechazado').length, estado: 'rechazado' }
                          ] : [
                            { name: 'Baixa', value: reports.filter(r => r.prioridad === 'baja').length, prioridad: 'baja' },
                            { name: 'Normal', value: reports.filter(r => !r.prioridad || r.prioridad === 'normal').length, prioridad: 'normal' },
                            { name: 'Alta', value: reports.filter(r => r.prioridad === 'alta').length, prioridad: 'alta' },
                            { name: 'Urgent', value: reports.filter(r => r.prioridad === 'urgente').length, prioridad: 'urgente' }
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {reportFilterMode === 'estat' ? (
                            // Map each slice directly to its corresponding color from COLORS_ESTAT
                            [
                              { name: 'Oberts', value: reports.filter(r => r.estado === 'abierto').length, estado: 'abierto' },
                              { name: 'En procés', value: reports.filter(r => r.estado === 'en_proceso').length, estado: 'en_proceso' },
                              { name: 'Resolts', value: reports.filter(r => r.estado === 'resuelto').length, estado: 'resuelto' },
                              { name: 'Rebutjats', value: reports.filter(r => r.estado === 'rechazado').length, estado: 'rechazado' }
                            ].map((entry, index) => (
                              <Cell key={`cell-estat-${index}`} fill={COLORS_ESTAT[entry.estado]} />
                            ))
                          ) : (
                            // Map each slice directly to its corresponding color from COLORS_PRIORITAT
                            [
                              { name: 'Baixa', value: reports.filter(r => r.prioridad === 'baja').length, prioridad: 'baja' },
                              { name: 'Normal', value: reports.filter(r => !r.prioridad || r.prioridad === 'normal').length, prioridad: 'normal' },
                              { name: 'Alta', value: reports.filter(r => r.prioridad === 'alta').length, prioridad: 'alta' },
                              { name: 'Urgent', value: reports.filter(r => r.prioridad === 'urgente').length, prioridad: 'urgente' }
                            ].map((entry, index) => (
                              <Cell key={`cell-prio-${index}`} fill={COLORS_PRIORITAT[entry.prioridad]} />
                            ))
                          )}
                        </Pie>
                        <Tooltip formatter={(value, name) => [`${value} reportes`, name]} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Gráfico de tipos de reportes - FIXED */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <h2 className="text-lg font-medium mb-4 text-gray-800">Tipus de Reportes</h2>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { name: 'Mal estat', value: reports.filter(r => r.tipo === 'mal_estado').length, tipo: 'mal_estado' },
                          { name: 'Ple', value: reports.filter(r => r.tipo === 'lleno').length, tipo: 'lleno' },
                          { name: 'Vandalisme', value: reports.filter(r => r.tipo === 'vandalismo').length, tipo: 'vandalismo' },
                          { name: 'Ubicació', value: reports.filter(r => r.tipo === 'ubicacion').length, tipo: 'ubicacion' },
                          { name: 'Olors', value: reports.filter(r => r.tipo === 'olores').length, tipo: 'olores' },
                          { name: 'Altres', value: reports.filter(r => r.tipo === 'otro').length, tipo: 'otro' }
                        ]}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value) => `${value} reportes`}
                        />
                        <Legend />
                        <Bar dataKey="value" name="Quantitat">
                          {/* Correctly map each bar to its color */}
                          <Cell key="cell-mal_estado" fill={COLORS_TIPO['mal_estado']} />
                          <Cell key="cell-lleno" fill={COLORS_TIPO['lleno']} />
                          <Cell key="cell-vandalismo" fill={COLORS_TIPO['vandalismo']} />
                          <Cell key="cell-ubicacion" fill={COLORS_TIPO['ubicacion']} />
                          <Cell key="cell-olores" fill={COLORS_TIPO['olores']} />
                          <Cell key="cell-otro" fill={COLORS_TIPO['otro']} />
                        </Bar>
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
                    {reportPriorityFilter ? ` - Prioritat: ${priorityLabels[reportPriorityFilter]}` : ''}
                    {(reportStatusFilter || reportPriorityFilter) && <span className="text-sm text-gray-500 ml-2">({filteredReports.length} reportes)</span>}
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
                        <th className="py-2 px-4 text-left text-gray-700">Data</th>
                        <th className="py-2 px-4 text-left text-gray-700">Tipus</th>
                        <th className="py-2 px-4 text-left text-gray-700">Descripció</th>
                        <th className="py-2 px-4 text-left text-gray-700">Contenidor/Zona</th>
                        <th className="py-2 px-4 text-left text-gray-700">Estat</th>
                        <th className="py-2 px-4 text-left text-gray-700">Prioritat</th>
                        <th className="py-2 px-4 text-left text-gray-700">Accions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredReports.slice(0, 5).map(report => {
                        const contenedorInfo = report.contenedor ? 
                          `Contenidor #${report.contenedor}` : 
                          report.zona ? `Zona #${report.zona}` : 'No especificat';
                    
                        const zonaName = report.contenedor && contenidors.find(c => c.id === report.contenedor)?.zona_nombre;
                        
                        // Priority display
                        const priority = report.prioridad || 'normal';
                        const priorityStyle = priorityColors[priority];
                        
                        return (
                          <tr key={report.id} className="border-b hover:bg-gray-50">
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
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityStyle}`}>
                                {priorityLabels[priority]}
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
    </div>
  );
}