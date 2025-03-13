import { useState, useEffect } from 'react';
import { getAllContenedors } from '../../api/zr.api.js';
import { ContenedorCard } from './ContenedorCard.jsx';
import { Link } from 'react-router-dom';

export function ContenedorList() {
    const [contenedors, setContenedors] = useState([]);
    const [ciudades, setCiudades] = useState([]);
    const [ciudadSeleccionada, setCiudadSeleccionada] = useState('');

    useEffect(() => {
        async function loadContenedors() {
            const res = await getAllContenedors();
            setContenedors(res.data);

            // Extraer ciudades únicas
            const ciudadesUnicas = [...new Set(res.data.map(contenedor => contenedor.ciutat))];
            setCiudades(ciudadesUnicas);
        }
        loadContenedors();
    }, []);

    const contenedorsFiltrados = ciudadSeleccionada 
        ? contenedors.filter(contenedor => contenedor.ciutat === ciudadSeleccionada) 
        : contenedors;

    return (
        <div className="container mx-auto">
            <h1 className="text-3xl font-bold text-center m-10">Contenidors</h1>
                    

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
                to="/contenedors-create"
                className="ml-auto mr-10 bg-green-500 text-white p-2 rounded hover:bg-green-600 cursor-pointer"
            >
                Afegir Contenidor
            </Link>
        </div>

            <div className="grid grid-cols-3 gap-3 m-10">
                {contenedorsFiltrados.map((contenedor) => (
                    <ContenedorCard key={contenedor.id} contenedor={contenedor} />
                ))}
            </div>
        </div>
    );
}
