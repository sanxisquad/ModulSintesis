import { useState, useEffect } from 'react';
import { getAllContenedors, getAllZones } from '../../api/zr.api.js';
import { ContenedorCard } from './ContenedorCard.jsx';
import { Link } from 'react-router-dom';
import { FilterPanel } from '../../components/common/FilterPanel'; // Importamos el FilterPanel

export function ContenedorList() {
    const [contenedors, setContenedors] = useState([]);
    const [zones, setZones] = useState([]);
    const [filters, setFilters] = useState({
        ciutat: '',
        zona: '',
        estat: '',
        tipus: '',
        codi: ''
    });

    useEffect(() => {
        async function loadContenedors() {
            const [resContenedores, resZones] = await Promise.all([
                getAllContenedors(),
                getAllZones()
            ]);
            setContenedors(resContenedores.data);
            setZones(resZones.data);
        }
        loadContenedors();
    }, []);

    // Extraer opciones únicas para los filtros
    const ciudades = [...new Set(contenedors.map(c => c.ciutat).filter(Boolean))];
    const estatOptions = [...new Set(contenedors.map(c => c.estat).filter(Boolean))];
    const tipusOptions = [...new Set(contenedors.map(c => c.tipus).filter(Boolean))];
    const zonasOptions = zones.map(zona => ({ id: zona.id, nom: zona.nom }));

    // Filtrar contenedores
    const contenedorsFiltrados = contenedors.filter(contenedor => {
        // Filtro por ciudad
        if (filters.ciutat && contenedor.ciutat !== filters.ciutat) return false;
        
        // Filtro por zona
        if (filters.zona && contenedor.zona !== Number(filters.zona)) return false;

        
        // Filtro por estado
        if (filters.estat && contenedor.estat !== filters.estat) return false;
        
        // Filtro por tipo
        if (filters.tipus && contenedor.tipus !== filters.tipus) return false;
        
        // Filtro por código (búsqueda parcial)
        if (filters.codi && !contenedor.cod?.toLowerCase().includes(filters.codi.toLowerCase())) {
            return false;
        }
        
        return true;
    });

    return (
        <div className="container mx-auto">
            <h1 className="text-3xl font-bold text-center m-10">Contenidors</h1>
            
            {/* Contador de resultados */}
            <div className="ml-10 mb-2 text-sm text-gray-600">
                Mostrant {contenedorsFiltrados.length} de {contenedors.length} contenedors
            </div>

            {/* Usamos el FilterPanel */}
            <FilterPanel
            filters={filters}
            setFilters={setFilters}
            ciudades={ciudades}
            zonas={zones}
            estatOptions={estatOptions}
            tipusOptions={tipusOptions}
            mode="contenedors"
            />
            
            <div className="flex justify-end mb-5 mr-10">
                {/* Botón para agregar contenedor */}
                <Link
                    to="/contenedors-create"
                    className="bg-green-500 text-white p-2 rounded hover:bg-green-600 cursor-pointer"
                >
                    Afegir Contenidor
                </Link>
            </div>

            {/* Mostrar lista de contenedores */}
            {contenedorsFiltrados.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 m-10">
                    {contenedorsFiltrados.map((contenedor) => (
                        <ContenedorCard key={contenedor.id} contenedor={contenedor} />
                    ))}
                </div>
            ) : (
                <div className="text-center m-10 text-gray-500">
                    No s'han trobat contenedors amb els filtres seleccionats
                </div>
            )}
        </div>
    );
}