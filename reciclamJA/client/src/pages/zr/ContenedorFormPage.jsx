import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast'; 
import { useAuth } from '../../context/AuthContext';

import { getContenedor, createContenedor, updateContenedor, deleteContenedor, getAllZones } from '../../api/zr.api';

export function ContenedorFormPage() {
    const { user } = useAuth();
    const { register, handleSubmit, formState: { errors }, setValue } = useForm();
    const navigate = useNavigate();
    const params = useParams();
    const [zonas, setZonas] = useState([]);
    const [contenedor, setContenedor] = useState(null);

    // Opciones predefinidas para el campo "estado" (ahora "estat")
    const estados = [
        { id: 'buit', nombre: 'Buit' },
        { id: 'ple', nombre: 'Ple' },
        { id: 'mig', nombre: 'Mig ple' }
    ];

    // Opciones predefinidas para el campo "tipo" (ahora "tipus")
    const tipos = [
        { id: 'paper', nombre: 'Paper' },
        { id: 'plàstic', nombre: 'Plàstic' },
        { id: 'vidre', nombre: 'Vidre' },
        { id: 'orgànic', nombre: 'Orgànic' },
        { id: 'rebuig', nombre: 'Rebuig' },
    ];

    // Enviar el formulario
    const onSubmit = handleSubmit(async (data) => {
        if (user) {
            console.log("User:", user);  // Afegeix aquest console.log per veure el valor de 'user'
            data.empresa = user.empresa_id;
        } else {
            console.log("No user found");  // Això ajudarà a detectar si user és null
        }
        if(data.zona === "Ninguna") {
            data.zona = null;
        }
        console.log(data);
        try {
            if (params.id) {

                await updateContenedor(params.id, data);
                toast.success('Contenedor actualizado');
            } else {
                await createContenedor(data);
                toast.success('Contenedor creado');
            }
            navigate('/contenedors');
        } catch (error) {
            console.error("Error al guardar el contenedor:", error);
            toast.error('Error al guardar el contenedor');
        }
    });

    // Manejar la eliminación del contenedor
    const handleDelete = async () => {
        const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar este contenedor?");
        if (confirmDelete) {
            try {
                await deleteContenedor(params.id);
                toast.success('Contenedor eliminado');
                navigate('/contenedors');
            } catch (error) {
                console.error("Error al eliminar el contenedor:", error);
                toast.error('Error al eliminar el contenedor');
            }
        }
    };

    // Cargar los datos del contenedor si estamos en el modo de edición
    useEffect(() => {
        async function loadContenedor() {
            if (params.id) {
                try {
                    const res = await getContenedor(params.id);
                    if (res.data) {
                        setContenedor(res.data);
                        setValue('cod', res.data.cod);  // Cambié de 'codigo' a 'cod'
                        setValue('zona', res.data.zona ? res.data.zona.id : null);  // Si hay zona, asignarla
                        setValue('tipus', res.data.tipus);  // Cambié de 'tipo' a 'tipus'
                        setValue('estat', res.data.estat || '');  // Cambié de 'estado' a 'estat'
                        setValue('latitud', res.data.latitud);
                        setValue('longitud', res.data.longitud);
                        setValue('ciutat', res.data.ciutat);
                    } else {
                        console.error("No data found for contenedor");
                        toast.error('No se encontraron datos para el contenedor');
                    }
                } catch (error) {
                    console.error("Error al cargar el contenedor:", error);
                    toast.error('Error al cargar el contenedor');
                }
            }
        }
        loadContenedor();
    }, [params.id, setValue]);

    // Cargar las zonas de reciclaje
    useEffect(() => {
        async function loadZonas() {
            try {
                const res = await getAllZones();
                setZonas(res.data);
            } catch (error) {
                console.error("Error al cargar las zonas:", error);
                toast.error('Error al cargar las zonas');
            }
        }
        loadZonas();
    }, []);

    return (
        <div>
            <form onSubmit={onSubmit}>
                <div>
                    <label htmlFor="cod">Codi</label>
                    <input
                        id="cod"
                        type="text"
                        {...register('cod', { required: 'El código es obligatorio' })}
                    />
                    {errors.cod && <p>{errors.cod.message}</p>}
                </div>
                <div>
                    <label htmlFor="zona">Zona</label>
                    <select id="zona" {...register('zona')}>
                        <option value={null}>Ninguna</option>
                        {zonas.map((zona) => (
                            <option key={zona.id} value={zona.id}>
                                {zona.nom}
                            </option>
                        ))}
                    </select>
                    {errors.zona && <p>{errors.zona.message}</p>}
                </div>

                <div>
                    <label htmlFor="tipus">Tipo</label> {/* Cambié 'tipo' a 'tipus' */}
                    <select id="tipus" {...register('tipus', { required: 'El tipo es obligatorio' })}> {/* Cambié 'tipo' a 'tipus' */}
                        {tipos.map((tipo) => (
                            <option key={tipo.id} value={tipo.id}>
                                {tipo.nombre}
                            </option>
                        ))}
                    </select>
                    {errors.tipus && <p>{errors.tipus.message}</p>} {/* Cambié 'tipo' a 'tipus' */}
                </div>

                <div>
                    <label htmlFor="estat">Estat</label> {/* Cambié 'estado' a 'estat' */}
                    <select id="estat" {...register('estat', { required: 'El estado es obligatorio' })}>
                        {estados.map((estado) => (
                            <option key={estado.id} value={estado.id}>
                                {estado.nombre}
                            </option>
                        ))}
                    </select>
                    {errors.estat && <p>{errors.estat.message}</p>} {/* Cambié 'estado' a 'estat' */}
                </div>

                <div>
                    <label htmlFor="latitud">Latitud</label>
                    <input
                        id="latitud"
                        type="number"
                        step="any"
                        {...register('latitud', { required: 'La latitud es obligatoria', valueAsNumber: true })}
                    />
                    {errors.latitud && <p>{errors.latitud.message}</p>}
                </div>

                <div>
                    <label htmlFor="longitud">Longitud</label>
                    <input
                        id="longitud"
                        type="number"
                        step="any"
                        {...register('longitud', { required: 'La longitud es obligatoria', valueAsNumber: true })}
                    />
                    {errors.longitud && <p>{errors.longitud.message}</p>}
                </div>

                <div>
                    <label htmlFor="ciutat">Ciutat</label>
                    <input
                        id="ciutat"
                        type="text"
                        {...register('ciutat', { required: 'La ciudad es obligatoria' })}
                    />
                    {errors.ciutat && <p>{errors.ciutat.message}</p>}
                </div>

                <div>
                    <button type="submit">Guardar Contenedor</button>
                    {params.id && (
                        <button type="button" onClick={handleDelete} style={{ marginLeft: '10px', backgroundColor: 'red', color: 'white' }}>
                            Eliminar Contenedor
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}