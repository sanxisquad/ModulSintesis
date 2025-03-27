import React, { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../hooks/useAuth';
import { MapPicker } from '../../components/zr/MapPicker';
import { getContenedor, createContenedor, updateContenedor, deleteContenedor, getAllZones } from '../../api/zr.api';

export function ContenedorFormPage() {
    const { user } = useAuth();
    const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm();
    const navigate = useNavigate();
    const params = useParams();
    const [zonas, setZonas] = useState([]);
    const [contenedor, setContenedor] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const estados = [
        { id: 'buit', nombre: 'Buit' },
        { id: 'ple', nombre: 'Ple' },
        { id: 'mig', nombre: 'Mig ple' }
    ];

    const tipos = [
        { id: 'paper', nombre: 'Paper' },
        { id: 'plàstic', nombre: 'Plàstic' },
        { id: 'vidre', nombre: 'Vidre' },
        { id: 'orgànic', nombre: 'Orgànic' },
        { id: 'rebuig', nombre: 'Rebuig' },
    ];

    const onSubmit = handleSubmit(async (data) => {
        if (user) data.empresa = user.empresa_id;
        if (data.zona === "") data.zona = null;
        
        setIsSubmitting(true);
        try {
            if (params.id) {
                await updateContenedor(params.id, data);
                toast.success('Contenedor actualizado correctamente');
            } else {
                await createContenedor(data);
                toast.success('Contenedor creado correctamente');
            }
            navigate('/contenedors');
        } catch (error) {
            console.error("Error:", error);
            toast.error(error.response?.data?.message || 'Error al procesar la solicitud');
        } finally {
            setIsSubmitting(false);
        }
    });

    const handleDelete = async () => {
        if (!window.confirm("¿Estás seguro de eliminar este contenedor?")) return;
        
        try {
            await deleteContenedor(params.id);
            toast.success('Contenedor eliminado');
            navigate('/contenedors');
        } catch (error) {
            console.error("Error:", error);
            toast.error('Error al eliminar el contenedor');
        }
    };
    const onCitySelect = (city) => {
        if (!watch('ciutat')) {  // Solo actualiza si no hay una ciudad previamente establecida
            setValue('ciutat', city);
        }
    };

    useEffect(() => {
        async function loadContenedor() {
            if (!params.id) return;
    
            try {
                const { data } = await getContenedor(params.id);
                setContenedor(data);
                
                // Verifica la estructura de data.zona en la consola
                console.log('Datos de zona recibidos:', data.empresa);
                
                setValue('cod', data.cod);
                setValue('zona', data.zona?.id || data.zona || "");
                setValue('tipus', data.tipus);
                setValue('estat', data.estat || '');
                setValue('latitud', data.latitud);
                setValue('longitud', data.longitud);
                setValue('ciutat', data.ciutat);
                setValue('empresa', data.empresa);

            } catch (error) {
                toast.error('Error al cargar el contenedor');
                navigate('/contenedors');
            }
        }
        loadContenedor();
    }, [params.id, setValue, navigate]);

    useEffect(() => {
        async function loadZonas() {
            try {
                const { data } = await getAllZones();
                setZonas(data);
                console.log('Zonas cargadas:', data); // Para depuración
            } catch (error) {
                toast.error('Error al cargar las zonas');
            }
        }
        loadZonas();
    }, []);

    const onLocationSelect = (lat, lng) => {
        setValue('latitud', lat);
        setValue('longitud', lng);
    };


    

    return (
        <div className="container mx-auto p-5">
            <h1 className="text-3xl font-bold text-center mb-5">
                {params.id ? 'Editar Contenedor' : 'Crear Contenedor'}
            </h1>
            
            <form onSubmit={onSubmit} className="space-y-4 max-w-lg mx-auto">
                {/* Código */}
                <div>
                    <label htmlFor="cod" className="block text-lg font-medium">Código</label>
                    <input
                        id="cod"
                        type="text"
                        className={`w-full p-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 ${
                            errors.cod ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                        }`}
                        {...register('cod', { required: 'El código es obligatorio' })}
                    />
                    {errors.cod && <p className="text-red-500 text-sm">{errors.cod.message}</p>}
                </div>

                {/* Zona - Select completamente corregido */}
                <div>
                    <label htmlFor="zona" className="block text-lg font-medium">Zona</label>
                    <select
                        id="zona"
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        {...register('zona')}
                        value={watch('zona') || ""}
                    >
                        <option value="">Ninguna</option>
                        {zonas.map((zona) => (
                            <option key={zona.id} value={zona.id}>
                                {zona.nom}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Tipo y Estado */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="tipus" className="block text-lg font-medium">Tipo</label>
                        <select
                            id="tipus"
                            className={`w-full p-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 ${
                                errors.tipus ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                            }`}
                            {...register('tipus', { required: 'El tipo es obligatorio' })}
                        >
                            {tipos.map((tipo) => (
                                <option key={tipo.id} value={tipo.id}>
                                    {tipo.nombre}
                                </option>
                            ))}
                        </select>
                        {errors.tipus && <p className="text-red-500 text-sm">{errors.tipus.message}</p>}
                    </div>

                    <div>
                        <label htmlFor="estat" className="block text-lg font-medium">Estado</label>
                        <select
                            id="estat"
                            className={`w-full p-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 ${
                                errors.estat ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                            }`}
                            {...register('estat', { required: 'El estado es obligatorio' })}
                        >
                            {estados.map((estado) => (
                                <option key={estado.id} value={estado.id}>
                                    {estado.nombre}
                                </option>
                            ))}
                        </select>
                        {errors.estat && <p className="text-red-500 text-sm">{errors.estat.message}</p>}
                    </div>
                </div>

                {/* Coordenadas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="latitud" className="block text-lg font-medium">Latitud</label>
                        <input
                            id="latitud"
                            type="number"
                            step="any"
                            className={`w-full p-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 ${
                                errors.latitud ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                            }`}
                            {...register('latitud', { 
                                required: 'La latitud es obligatoria',
                                valueAsNumber: true 
                            })}
                        />
                        {errors.latitud && <p className="text-red-500 text-sm">{errors.latitud.message}</p>}
                    </div>

                    <div>
                        <label htmlFor="longitud" className="block text-lg font-medium">Longitud</label>
                        <input
                            id="longitud"
                            type="number"
                            step="any"
                            className={`w-full p-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 ${
                                errors.longitud ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                            }`}
                            {...register('longitud', { 
                                required: 'La longitud es obligatoria',
                                valueAsNumber: true 
                            })}
                        />
                        {errors.longitud && <p className="text-red-500 text-sm">{errors.longitud.message}</p>}
                    </div>
                </div>

                {/* Ciudad */}
                <div>
                    <label htmlFor="ciutat" className="block text-lg font-medium">Ciudad</label>
                    <input
                        id="ciutat"
                        type="text"
                        className={`w-full p-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 ${
                            errors.ciutat ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                        }`}
                        {...register('ciutat', { required: 'La ciudad es obligatoria' })}
                    />
                    {errors.ciutat && <p className="text-red-500 text-sm">{errors.ciutat.message}</p>}
                </div>

                {/* Mapa */}
                <MapPicker
                    onLocationSelect={onLocationSelect}
                    onCitySelect={onCitySelect}
                    initialLat={contenedor?.latitud || 0}
                    initialLng={contenedor?.longitud || 0}
                    initialEmpresa={user ? user.empresa : null}  // Asignar empresa del usuario
                />

                {/* Botones */}
                <div className="flex justify-between items-center pt-4">
                    <button 
                        type="submit"
                        disabled={isSubmitting}
                        className={`px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                        }`}
                    >
                        {isSubmitting ? 'Guardando...' : 'Guardar'}
                    </button>
                    
                    {params.id && (
                        <button 
                            type="button" 
                            onClick={handleDelete} 
                            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                            Eliminar
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}