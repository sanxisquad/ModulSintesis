import { useEffect, useState } from 'react';
import { getAllContenedors, getAllZones } from '../../api/zr.api.js';
import { ContenedorCard } from './ContenedorCard.jsx';
import { Link } from 'react-router-dom';

export function ContenedorList({ filters }) {  // Recibe filters como prop
    const [contenedors, setContenedors] = useState([]);
    const [zones, setZones] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadContenedors() {
            try {
                setIsLoading(true);
                const [resContenedores, resZones] = await Promise.all([
                    getAllContenedors(),
                    getAllZones()
                ]);
                setContenedors(resContenedores.data);
                setZones(resZones.data);
            } catch (error) {
                console.error("Error loading data:", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadContenedors();
    }, []);

    // Filtrar contenedores
    const contenedorsFiltrados = contenedors.filter(contenedor => {
        if (!contenedor) return false;
        
        // Filtro por ciudad
        if (filters?.ciutat && contenedor.ciutat !== filters.ciutat) return false;

        
        // Filtro por zona
        if (filters?.zona && contenedor.zona !== Number(filters.zona)) return false;
        
        // Filtro por estado
        if (filters?.estat && contenedor.estat !== filters.estat) return false;
        
        // Filtro por tipo
        if (filters?.tipus && contenedor.tipus !== filters.tipus) return false;
        
        // Filtro por código (búsqueda parcial)
        if (filters?.codi && !contenedor.cod?.toLowerCase().includes(filters.codi.toLowerCase())) {
            return false;
        }
        
        return true;
    });

    if (isLoading) return <div className="text-center m-10">Carregant...</div>;

    return (
        <div className="container mx-auto">
            
            {/* Contador de resultados */}
            <div className="ml-10 mb-2 text-sm text-gray-600">
                Mostrant {contenedorsFiltrados.length} de {contenedors.length} contenedors
            </div>


            {/* Mostrar lista de contenedores */}
            {contenedorsFiltrados.length > 0 ? (
                <div className="grid grid-cols-3 gap-3 m-10">
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