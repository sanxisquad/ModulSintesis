import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast'; 
import { getContenedor, createContenedor, updateContenedor, getAllZones } from '../../api/zr.api';  // Asegúrate de tener estos métodos

export function ContenedorFormPage() {
    const { register, handleSubmit, formState: { errors }, setValue } = useForm();
    const navigate = useNavigate();
    const params = useParams();
    const [zonas, setZonas] = useState([]);
    const [tipos, setTipos] = useState([]);
    const [contenedor, setContenedor] = useState(null);

    // Opciones predefinidas para el campo "estado"
    const estados = [
        { id: 'buit', nombre: 'Buit' },
        { id: 'ple', nombre: 'Ple' },
        { id: 'mig', nombre: 'Mig ple' }
    ];

    // Enviar el formulario
    const onSubmit = handleSubmit(async (data) => {
        if (params.id) {
            await updateContenedor(params.id, data);
            toast.success('Contenedor actualizado');
        } else {
            await createContenedor(data);
            toast.success('Contenedor creado');
        }
        navigate('/contenedores');
    });

    // Cargar los datos del contenedor si estamos en el modo de edición
    useEffect(() => {
        async function loadContenedor() {
            if (params.id) {
                const res = await getContenedor(params.id);
                setContenedor(res.data);
                setValue('codigo', res.data.codigo);
                setValue('zona', res.data.zona ? res.data.zona.id : null);  // Si hay zona, asignarla
                setValue('tipo', res.data.tipo.id);
                setValue('estado', res.data.estado || '');  // Si hay estado, asignarlo, si no, vacío
            }
        }
        loadContenedor();
    }, [params.id, setValue]);

    // Cargar las zonas de reciclaje
    useEffect(() => {
        async function loadZonas() {
            const res = await getAllZonas();
            setZonas(res.data);
        }
        loadZonas();
    }, []);

    // Cargar los tipos de reciclaje
    useEffect(() => {
        async function loadTipos() {
            const res = await getAllTipos();
            setTipos(res.data);
        }
        loadTipos();
    }, []);

    return (
        <div>
            <form onSubmit={onSubmit}>
                <div>
                    <label htmlFor="codigo">Código</label>
                    <input
                        id="codigo"
                        type="text"
                        {...register('codigo', { required: 'El código es obligatorio' })}
                    />
                    {errors.codigo && <p>{errors.codigo.message}</p>}
                </div>

                <div>
                    <label htmlFor="zona">Zona</label>
                    <select id="zona" {...register('zona')}>
                        <option value={null}>Ninguna</option>
                        {zonas.map((zona) => (
                            <option key={zona.id} value={zona.id}>
                                {zona.nombre}
                            </option>
                        ))}
                    </select>
                    {errors.zona && <p>{errors.zona.message}</p>}
                </div>

                <div>
                    <label htmlFor="tipo">Tipo</label>
                    <select id="tipo" {...register('tipo', { required: 'El tipo es obligatorio' })}>
                        {tipos.map((tipo) => (
                            <option key={tipo.id} value={tipo.id}>
                                {tipo.nombre}
                            </option>
                        ))}
                    </select>
                    {errors.tipo && <p>{errors.tipo.message}</p>}
                </div>

                <div>
                    <label htmlFor="estado">Estado</label>
                    <select id="estado" {...register('estado', { required: 'El estado es obligatorio' })}>
                        {estados.map((estado) => (
                            <option key={estado.id} value={estado.id}>
                                {estado.nombre}
                            </option>
                        ))}
                    </select>
                    {errors.estado && <p>{errors.estado.message}</p>}
                </div>

                <div>
                    <label htmlFor="latitud">Latitud</label>
                    <input
                        id="latitud"
                        type="number"
                        {...register('latitud', { required: 'La latitud es obligatoria' })}
                    />
                    {errors.latitud && <p>{errors.latitud.message}</p>}
                </div>

                <div>
                    <label htmlFor="longitud">Longitud</label>
                    <input
                        id="longitud"
                        type="number"
                        {...register('longitud', { required: 'La longitud es obligatoria' })}
                    />
                    {errors.longitud && <p>{errors.longitud.message}</p>}
                </div>

                <div>
                    <label htmlFor="ciutat">Ciudad</label>
                    <input
                        id="ciutat"
                        type="text"
                        {...register('ciutat', { required: 'La ciudad es obligatoria' })}
                    />
                    {errors.ciutat && <p>{errors.ciutat.message}</p>}
                </div>

                <div>
                    <button type="submit">Guardar Contenedor</button>
                </div>
            </form>
        </div>
    );
}
