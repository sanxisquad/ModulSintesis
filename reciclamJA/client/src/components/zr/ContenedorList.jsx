import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {getAllContenedors} from '../../api/zr.api.js';
import { ContenedorCard } from './ContenedorCard.jsx';
export function ContenedorList () {

    const [contenedors, setContenedors] = useState([]);

    useEffect(() => {
        console.log('TasksList rendered');
        async function loadContenedors(){
            const res = await getAllContenedors();
            setContenedors(res.data);
            console.log(res);

        }
        loadContenedors();
    }
    , [])

    return(

        <div className="grid grid-cols-3 gap-3">
            {contenedors.map((contenedor) => (
                <ContenedorCard key={contenedor.id} contenedor={contenedor} />

            ))}
        </div>
    );




}