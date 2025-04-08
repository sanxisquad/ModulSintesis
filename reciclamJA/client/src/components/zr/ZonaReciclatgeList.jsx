import { useState, useEffect } from 'react';
import { getAllZones } from '../../api/zr.api.js';
import { ZonesReciclatgeCard } from './ZonaReciclatgeCard.jsx';
import { Link } from 'react-router-dom';
import { FilterPanel } from '../common/FilterPanel.jsx';

export function ZonaReciclatgeList() {
    const [zones, setZones] = useState([]);
    const [filters, setFilters] = useState({
        ciutat: '',
        nom: ''
    });
    const [ciudades, setCiudades] = useState([]);

    useEffect(() => {
        async function loadZones() {
            const res = await getAllZones();
            setZones(res.data);

            // Extraer ciudades únicas
            const ciudadesUnicas = [...new Set(res.data.map(zone => zone.ciutat))];
            setCiudades(ciudadesUnicas);
        }
        loadZones();
    }, []);

    const zonesFiltrades = zones.filter(zone => {
        // Filtro por ciudad
        if (filters.ciutat && zone.ciutat !== filters.ciutat) return false;
        
        // Filtro por nombre (búsqueda parcial)
        if (filters.nom && !zone.nom?.toLowerCase().includes(filters.nom.toLowerCase())) {
            return false;
        }
        
        return true;
    });

    return (
        <div className="container mx-auto">
            <h1 className="text-3xl font-bold text-center m-10">Zones de reciclatge</h1>
            <div className="ml-10 mb-2 text-sm text-gray-600">
                Mostrant {zonesFiltrades.length} de {zones.length} zones
            </div>            
            
            {/* Usamos el FilterPanel */}
            <FilterPanel
                filters={filters}
                setFilters={setFilters}
                ciudades={ciudades}
                mode="zones"
            />
            
            <div className="flex ml-10 mb-5">
                <Link
                    to="/zones-create"
                    className="ml-auto mr-10 bg-green-500 text-white p-2 rounded hover:bg-green-600 cursor-pointer"
                >
                    Afegir Zona de Reciclatge
                </Link>
            </div>

            <div className="grid grid-cols-3 gap-3 m-10">
                {zonesFiltrades.map((zone) => (
                    <ZonesReciclatgeCard key={zone.id} zones={zone} />
                ))}
            </div>
        </div>
    );
}