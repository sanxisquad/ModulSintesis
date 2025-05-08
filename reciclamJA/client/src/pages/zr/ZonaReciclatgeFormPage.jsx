import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../hooks/useAuth';
import { MapPicker } from '../../components/zr/MapPicker';
import { getZona, createZona, updateZona, deleteZona } from '../../api/zr.api';
import { ArrowLeft, Trash2, MapPin, Save, CheckCircle2, Loader2, AlertTriangle, Search } from 'lucide-react';

export function ZonaFormPage() {
  const { user } = useAuth();
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm();
  const navigate = useNavigate();
  const params = useParams();
  const [zona, setZona] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(params.id ? true : false);

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
  
  // Nueva función para buscar ciudad en el mapa
  const handleCitySearch = () => {
    const city = watch('ciutat');
    if (city) {
      if (window.geocoder) {
        window.geocoder.geocode({ 'address': city }, function(results, status) {
          if (status === 'OK' && results[0]) {
            const lat = results[0].geometry.location.lat();
            const lng = results[0].geometry.location.lng();
            setValue('latitud', lat);
            setValue('longitud', lng);
          } else {
            toast.error('No es pot trobar la ubicació de la ciutat');
          }
        });
      } else {
        toast.error('El servei de geocodificació no està disponible');
      }
    }
  };

  useEffect(() => {
    async function loadZona() {
      if (!params.id) return;

      try {
        setLoading(true);
        const { data } = await getZona(params.id);
        setZona(data);

        setValue('nom', data.nom);
        setValue('ciutat', data.ciutat);
        setValue('latitud', data.latitud);
        setValue('longitud', data.longitud);
        setValue('descripcio', data.descripcio || '');
        setValue('empresa', data.empresa);
        setLoading(false);
      } catch (error) {
        toast.error('Error al cargar la zona');
        setLoading(false);
        navigate('/zonas');
      }
    }
    loadZona();
  }, [params.id, setValue, navigate]);

  // Componente para mostrar información de carga
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      {/* Header section */}
      <div className="pb-5 border-b border-gray-200 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-full mr-3">
              <MapPin className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {params.id ? 'Editar Zona de Reciclatge' : 'Crear Nova Zona de Reciclatge'}
              </h1>
              <p className="text-gray-500 text-sm">
                {params.id 
                  ? 'Actualitza la informació de la zona existent' 
                  : 'Completa el formulari per crear una nova zona de reciclatge'}
              </p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/gestor-zones')}
            className="flex items-center text-gray-600 hover:text-gray-800 px-3 py-2 rounded-md hover:bg-gray-100"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            <span>Tornar</span>
          </button>
        </div>
      </div>
      
      <form onSubmit={onSubmit} className="space-y-5">
        {/* Nombre */}
        <div className="mb-4">
          <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
          <input
            id="nom"
            type="text"
            placeholder="Introdueix el nom de la zona"
            className={`w-full rounded-lg border ${
              errors.nom ? 'border-red-500' : 'border-gray-300'
            } px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500`}
            {...register('nom', { required: 'El nom és obligatori' })}
          />
          {errors.nom && <p className="mt-1 text-sm text-red-600">{errors.nom.message}</p>}
        </div>

        {/* Ciudad con botón de búsqueda */}
        <div className="mb-4">
          <label htmlFor="ciutat" className="block text-sm font-medium text-gray-700 mb-1">
            Ciutat
          </label>
          <div className="relative flex">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="ciutat"
              type="text"
              placeholder="Introdueix la ciutat"
              {...register('ciutat', { required: 'La ciutat és obligatòria' })}
              className={`pl-10 flex-grow rounded-l-lg border ${errors.ciutat ? 'border-red-500' : 'border-gray-300'} px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleCitySearch();
                }
              }}
            />
            <button
              type="button"
              onClick={handleCitySearch}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 rounded-r-lg flex items-center justify-center"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
          {errors.ciutat && <p className="mt-1 text-sm text-red-600">{errors.ciutat.message}</p>}
          <p className="mt-1 text-xs text-gray-500">
            Cerca la ciutat per actualitzar el mapa automàticament
          </p>
        </div>

        {/* Coordenadas en una fila */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-4">
            <label htmlFor="latitud" className="block text-sm font-medium text-gray-700 mb-1">
              Latitud
            </label>
            <input
              id="latitud"
              type="number"
              step="any"
              placeholder="Latitud (p.ex. 41.3851)"
              {...register('latitud', { 
                required: 'La latitud és obligatòria',
                valueAsNumber: true 
              })}
              className={`w-full rounded-lg border ${errors.latitud ? 'border-red-500' : 'border-gray-300'} px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.latitud && <p className="mt-1 text-sm text-red-600">{errors.latitud.message}</p>}
          </div>

          <div className="mb-4">
            <label htmlFor="longitud" className="block text-sm font-medium text-gray-700 mb-1">
              Longitud
            </label>
            <input
              id="longitud"
              type="number"
              step="any"
              placeholder="Longitud (p.ex. 2.1734)"
              {...register('longitud', { 
                required: 'La longitud és obligatòria',
                valueAsNumber: true 
              })}
              className={`w-full rounded-lg border ${errors.longitud ? 'border-red-500' : 'border-gray-300'} px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.longitud && <p className="mt-1 text-sm text-red-600">{errors.longitud.message}</p>}
          </div>
        </div>

        {/* Mapa */}
        <div className="mb-4 border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-700">Ubicació en el mapa</h3>
            <p className="text-xs text-gray-500">Fes clic al mapa per seleccionar la ubicació de la zona</p>
          </div>
          <MapPicker
            onLocationSelect={onLocationSelect}
            onCitySelect={onCitySelect}
            initialLat={watch('latitud') || 41.3851}
            initialLng={watch('longitud') || 2.1734}
            initialEmpresa={user ? user.empresa : null}
          />
        </div>

        {/* Coordenadas actuales - Informativo */}
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex items-start mb-4">
          <CheckCircle2 className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-700">Coordenades seleccionades</p>
            <p className="text-xs text-blue-600">
              Lat: {watch('latitud') || '---'}, Lng: {watch('longitud') || '---'}
            </p>
          </div>
        </div>

        {/* Descripción */}
        <div className="mb-4">
          <label htmlFor="descripcio" className="block text-sm font-medium text-gray-700 mb-1">Descripció</label>
          <textarea
            id="descripcio"
            rows="4"
            placeholder="Descripció de la zona de reciclatge (opcional)"
            className={`w-full rounded-lg border ${
              errors.descripcio ? 'border-red-500' : 'border-gray-300'
            } px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500`}
            {...register('descripcio')}
          />
          {errors.descripcio && <p className="mt-1 text-sm text-red-600">{errors.descripcio.message}</p>}
        </div>

        {/* Botones de acción */}
        <div className="flex justify-between mt-8">
          {params.id && (
            <button 
              type="button" 
              onClick={handleDelete}
              className="flex items-center px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar Zona
            </button>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`ml-auto flex items-center px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Guardant...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {params.id ? 'Actualitzar' : 'Crear Zona'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
