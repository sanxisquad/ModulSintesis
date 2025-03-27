import { useState, useEffect } from 'react';
import { getAllContenedors, getAllZones } from '../../api/zr.api.js';
import { ContenedorCard } from './ContenedorCard.jsx';
import { Link } from 'react-router-dom';

export function ContenedorList() {
    const [contenedors, setContenedors] = useState([]);
    const [ciudades, setCiudades] = useState([]);
    const [ciudadSeleccionada, setCiudadSeleccionada] = useState('');
    const [zones, setZones] = useState([]); // 📌 Añadir estado para zonas
    const [zonaSeleccionada, setZonaSeleccionada] = useState(''); // 📌 Añadir estado para zona seleccionada

    useEffect(() => {
        async function loadContenedors() {
            // Obtener contenedores y zonas
            const resContenedores = await getAllContenedors();
            const resZones = await getAllZones();
            
            setContenedors(resContenedores.data);
            setZones(resZones.data);

            // 📌 Extraer ciudades únicas
            const ciudadesUnicas = [...new Set(resContenedores.data.map(contenedor => contenedor.ciutat))];
            setCiudades(ciudadesUnicas);
        }
        loadContenedors();
    }, []);

    // 📌 Crear un mapa de zonas por ID
    const zonesMap = zones.reduce((acc, zone) => {
        acc[zone.id] = zone.nom; // mapea la zona por su id
        return acc;
    }, {});

    // 📌 Filtrar contenedores por ciudad y zona
    const contenedorsFiltrados = contenedors.filter(contenedor => 
        (ciudadSeleccionada ? contenedor.ciutat === ciudadSeleccionada : true) &&
        (zonaSeleccionada ? zonesMap[contenedor.zona] === zonaSeleccionada : true)
    );

    return (
        <div className="container mx-auto">
            <h1 className="text-3xl font-bold text-center m-10">Contenidors</h1>
                    
            <div className="flex ml-10 mb-5">
                {/* 📌 Filtro por ciudad */}
                <select
                    className="border p-2 rounded mr-10"
                    value={ciudadSeleccionada}
                    onChange={(e) => setCiudadSeleccionada(e.target.value)}
                >
                    <option className="text-black" value="">Totes les ciutats</option> 
                    {ciudades.map((ciudad, index) => (
                        <option key={index} className="text-black" value={ciudad}>{ciudad}</option>
                    ))}
                </select>

                {/* 📌 Filtro por zona */}
                <select
                    className="border p-2 rounded"
                    value={zonaSeleccionada}
                    onChange={(e) => setZonaSeleccionada(e.target.value)}
                >
                    <option className="text-black" value="">Totes les zones</option> 
                    {zones.map((zona) => (
                        <option key={zona.id} className="text-black" value={zona.nom}>{zona.nom}</option> 
                    ))}
                </select>

                {/* 📌 Botón para agregar contenedor */}
                <Link
                    to="/contenedors-create"
                    className="ml-auto mr-10 bg-green-500 text-white p-2 rounded hover:bg-green-600 cursor-pointer"
                >
                    Afegir Contenidor
                </Link>
            </div>

            {/* 📌 Mostrar lista de contenedores */}
            <div className="grid grid-cols-3 gap-3 m-10">
                {contenedorsFiltrados.map((contenedor) => (
                    <ContenedorCard key={contenedor.id} contenedor={contenedor} />
                ))}
            </div>
        </div>
    );
}
