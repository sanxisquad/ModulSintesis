import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast'; 
import { useAuth } from '../../context/AuthContext';  // Usamos el contexto de autenticación

import { getZona, createZona, updateZona, deleteZona } from '../../api/zr.api';  // Importa las funciones para interactuar con la API

export function ZonaFormPage() {
    const { user } = useAuth();  // Obtener el usuario autenticado
    const { register, handleSubmit, formState: { errors }, setValue } = useForm();  // Usamos react-hook-form
    const navigate = useNavigate();
    const params = useParams();
    
    const [zona, setZona] = useState(null);

    // Enviar el formulario
    const onSubmit = handleSubmit(async (data) => {
        if (user) {
            data.empresa = user.empresa_id;  // Asignar el ID de la empresa al enviar el formulario
        }

        try {
            if (params.id) {
                // Si tenemos un ID, actualizamos la zona
                await updateZona(params.id, data);
                toast.success('Zona de reciclaje actualizada');
            } else {
                // Si no hay ID, creamos una nueva zona
                await createZona(data);
                toast.success('Zona de reciclaje creada');
            }
            navigate('/zonas');  // Redirigimos a la lista de zonas
        } catch (error) {
            console.error("Error al guardar la zona:", error);
            toast.error('Error al guardar la zona');
        }
    });

    // Manejar la eliminación de una zona
    const handleDelete = async () => {
        const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar esta zona?");
        if (confirmDelete) {
            try {
                await deleteZona(params.id);  // Llamamos a la API para eliminar la zona
                toast.success('Zona eliminada');
                navigate('/zonas');  // Redirigimos a la lista de zonas
            } catch (error) {
                console.error("Error al eliminar la zona:", error);
                toast.error('Error al eliminar la zona');
            }
        }
    };

    // Cargar los datos de la zona si estamos en modo edición
    useEffect(() => {
        async function loadZona() {
            if (params.id) {
                try {
                    const res = await getZona(params.id);  // Llamamos a la API para obtener los datos de la zona
                    if (res.data) {
                        setZona(res.data);
                        setValue('nom', res.data.nom);
                        setValue('ciutat', res.data.ciutat);
                        setValue('latitud', res.data.latitud);
                        setValue('longitud', res.data.longitud);
                        setValue('descripcio', res.data.descripcio || '');  // Si no hay descripción, asignamos un valor vacío
                    } else {
                        toast.error('No se encontraron datos para esta zona');
                    }
                } catch (error) {
                    toast.error('Error al cargar los datos de la zona');
                }
            }
        }
        loadZona();
    }, [params.id, setValue]);

    return (
        <div className="container mx-auto p-5">
            <h1 className="text-3xl font-bold text-center mb-5">{params.id ? 'Editar Zona' : 'Crear Zona'}</h1>
            <form onSubmit={onSubmit} className="space-y-4 max-w-lg mx-auto">
                <div>
                    <label htmlFor="nom" className="block text-lg font-medium">Nombre</label>
                    <input
                        id="nom"
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        {...register('nom', { required: 'El nombre es obligatorio' })}
                    />
                    {errors.nom && <p className="text-red-500 text-sm">{errors.nom.message}</p>}
                </div>

                <div>
                    <label htmlFor="ciutat" className="block text-lg font-medium">Ciudad</label>
                    <input
                        id="ciutat"
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        {...register('ciutat', { required: 'La ciudad es obligatoria' })}
                    />
                    {errors.ciutat && <p className="text-red-500 text-sm">{errors.ciutat.message}</p>}
                </div>

                <div>
                    <label htmlFor="latitud" className="block text-lg font-medium">Latitud</label>
                    <input
                        id="latitud"
                        type="number"
                        step="any"
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        {...register('latitud', { required: 'La latitud es obligatoria', valueAsNumber: true })}
                    />
                    {errors.latitud && <p className="text-red-500 text-sm">{errors.latitud.message}</p>}
                </div>

                <div>
                    <label htmlFor="longitud" className="block text-lg font-medium">Longitud</label>
                    <input
                        id="longitud"
                        type="number"
                        step="any"
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        {...register('longitud', { required: 'La longitud es obligatoria', valueAsNumber: true })}
                    />
                    {errors.longitud && <p className="text-red-500 text-sm">{errors.longitud.message}</p>}
                </div>

                <div>
                    <label htmlFor="descripcio" className="block text-lg font-medium">Descripción</label>
                    <textarea
                        id="descripcio"
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        {...register('descripcio')}
                    />
                    {errors.descripcio && <p className="text-red-500 text-sm">{errors.descripcio.message}</p>}
                </div>

                <div className="flex justify-between items-center">
                    <button 
                        type="submit"
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Guardar Zona
                    </button>
                    {params.id && (
                        <button 
                            type="button" 
                            onClick={handleDelete} 
                            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                            Eliminar Zona
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
