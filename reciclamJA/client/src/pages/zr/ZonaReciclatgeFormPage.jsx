import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../hooks/useAuth';
import { MapPicker } from '../../components/zr/MapPicker';
import { getZona, createZona, updateZona, deleteZona } from '../../api/zr.api';

export function ZonaFormPage() {
  const { user } = useAuth();
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm();
  const navigate = useNavigate();
  const params = useParams();
  const [zona, setZona] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = handleSubmit(async (data) => {
    if (user) data.empresa = user.empresa_id;

    setIsSubmitting(true);
    try {
      if (params.id) {
        await updateZona(params.id, data);
        toast.success('Zona actualizada correctamente');
      } else {
        await createZona(data);
        toast.success('Zona creada correctamente');
      }
      navigate('/zonas');
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Error al procesar la solicitud');
    } finally {
      setIsSubmitting(false);
    }
  });

  const handleDelete = async () => {
    if (!window.confirm('¿Estás seguro de eliminar esta zona?')) return;

    try {
      await deleteZona(params.id);
      toast.success('Zona eliminada');
      navigate('/zonas');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al eliminar la zona');
    }
  };

  const onLocationSelect = (lat, lng) => {
    setValue('latitud', lat);
    setValue('longitud', lng);
  };

  const onCitySelect = (city) => {
    setValue('ciutat', city);
  };

  useEffect(() => {
    async function loadZona() {
      if (!params.id) return;

      try {
        const { data } = await getZona(params.id);
        setZona(data);

        setValue('nom', data.nom);
        setValue('ciutat', data.ciutat);
        setValue('latitud', data.latitud);
        setValue('longitud', data.longitud);
        setValue('descripcio', data.descripcio || '');
        setValue('empresa', data.empresa);
      } catch (error) {
        toast.error('Error al cargar la zona');
        navigate('/gestor-zones');
      }
    }
    loadZona();
  }, [params.id, setValue, navigate]);

  return (
    <div className="container mx-auto p-5">
      <h1 className="text-3xl font-bold text-center mb-5">
        {params.id ? 'Editar Zona' : 'Crear Zona'}
      </h1>

      <form onSubmit={onSubmit} className="space-y-4 max-w-lg mx-auto">
        {/* Nombre */}
        <div>
          <label htmlFor="nom" className="block text-lg font-medium">Nombre</label>
          <input
            id="nom"
            type="text"
            className={`w-full p-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 ${
              errors.nom ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
            }`}
            {...register('nom', { required: 'El nombre es obligatorio' })}
          />
          {errors.nom && <p className="text-red-500 text-sm">{errors.nom.message}</p>}
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
              className={`w-full p-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 ${
                errors.longitud ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
              }`}
              {...register('longitud', { required: 'La longitud es obligatoria', valueAsNumber: true })}
            />
            {errors.longitud && <p className="text-red-500 text-sm">{errors.longitud.message}</p>}
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label htmlFor="descripcio" className="block text-lg font-medium">Descripción</label>
          <textarea
            id="descripcio"
            className={`w-full p-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 ${
              errors.descripcio ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
            }`}
            {...register('descripcio')}
          />
          {errors.descripcio && <p className="text-red-500 text-sm">{errors.descripcio.message}</p>}
        </div>

        {/* Ciudad y Mapa */}
        <div>
          <label className="block text-lg font-medium">Ciudad</label>
          <MapPicker
            onLocationSelect={onLocationSelect}
            onCitySelect={onCitySelect}
            initialLat={zona?.latitud || 0}
            initialLng={zona?.longitud || 0}
            initialEmpresa={user ? user.empresa : null}
            searchLabel="Ciudad"
          />
          {errors.ciutat && <p className="text-red-500 text-sm">{errors.ciutat.message}</p>}
        </div>

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
