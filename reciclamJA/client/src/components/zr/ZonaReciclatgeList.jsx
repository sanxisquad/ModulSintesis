import { useState, useEffect } from 'react';
import { getAllZones } from '../../api/zr.api.js';
import { ZonesReciclatgeCard } from './ZonaReciclatgeCard.jsx';
import { Link } from 'react-router-dom';

export function ZonaReciclatgeList() {
    const [zones, setZones] = useState([]);
    const [ciudades, setCiudades] = useState([]);
    const [ciudadSeleccionada, setCiudadSeleccionada] = useState('');

    useEffect(() => {
        async function loadZones() {
            const res = await getAllZones();
            setZones(res.data);

            // Extraer ciudades únicas
            const ciudadesUnicas = [...new Set(res.data.map(zones => zones.ciutat))];
            setCiudades(ciudadesUnicas);
        }
        loadZones();
    }, []);

    const contenedorsFiltrados = ciudadSeleccionada 
        ? zones.filter(zones => zones.ciutat === ciudadSeleccionada) 
        : zones;

    return (
        <div className="container mx-auto">
            <h1 className="text-3xl font-bold text-center m-10">Zones de reciclatge</h1>
                    

            <div className="flex ml-10 mb-5">
            <select
                className="border p-2 rounded"
                value={ciudadSeleccionada}
                onChange={(e) => setCiudadSeleccionada(e.target.value)}
            >
                <option value="">Totes les ciutats</option>
                {ciudades.map((ciudad, index) => (
                    <option key={index} value={ciudad}>{ciudad}</option>
                ))}
            </select>
                    <Link
                to="/zones-create"
                className="ml-auto mr-10 bg-green-500 text-white p-2 rounded hover:bg-green-600 cursor-pointer"
            >
                Afegir Zona de Reciclatge
            </Link>
        </div>

            <div className="grid grid-cols-3 gap-3 m-10">
                {contenedorsFiltrados.map((zones) => (
                    <ZonesReciclatgeCard key={zones.id} zones={zones} />
                ))}
            </div>
        </div>
    );
}
