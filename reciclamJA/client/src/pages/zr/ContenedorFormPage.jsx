import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../hooks/useAuth';
import { MapPicker } from '../../components/zr/MapPicker';
import { getContenedor, createContenedor, updateContenedor, deleteContenedor, getAllZones } from '../../api/zr.api';
import { ArrowLeft, Trash2, MapPin, Save, CheckCircle2, Loader2, AlertTriangle, Search, ChevronDown, ChevronUp, BarChart } from 'lucide-react';

export function ContenedorFormPage() {
    const { user } = useAuth();
    const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm();
    const navigate = useNavigate();
    const params = useParams();
    const [zonas, setZonas] = useState([]);
    const [contenedor, setContenedor] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showStats, setShowStats] = useState(false);

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
                toast.success('Contenidor actualitzat correctament');
            } else {
                await createContenedor(data);
                toast.success('Contenidor creat correctament');
            }
            navigate('/gestor-contenedors');
        } catch (error) {
            console.error("Error:", error);
            toast.error(error.response?.data?.message || 'Error al processar la sol·licitud');
        } finally {
            setIsSubmitting(false);
        }
    });

    const handleDelete = async () => {
        try {
            const accepted = window.confirm("Estàs segur que vols eliminar aquest contenidor?");
            if (accepted) {
                await deleteContenedor(params.id);
                toast.success('Contenidor eliminat correctament');
                navigate('/gestor-contenedors');
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error('Error eliminant el contenidor');
        }
    };

    const onCitySelect = (city) => {
        setValue('ciutat', city);
    };

    const onLocationSelect = (lat, lng) => {
        setValue('latitud', lat);
        setValue('longitud', lng);
    };

    // Nueva función para buscar ciudad en el mapa
    const handleCitySearch = () => {
        const city = watch('ciutat');
        if (city) {
            // Simular un evento que sería capturado por el MapPicker
            // El MapPicker debería tener una función para buscar esta ciudad
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
        async function loadContenedor() {
            try {
                setLoading(true);
                if (params.id) {
                    const { data } = await getContenedor(params.id);
                    setContenedor(data);
                    
                    setValue('cod', data.cod);
                    setValue('zona', data.zona?.id || data.zona || "");
                    setValue('tipus', data.tipus);
                    setValue('estat', data.estat || '');
                    setValue('latitud', data.latitud);
                    setValue('longitud', data.longitud);
                    setValue('ciutat', data.ciutat);
                    setValue('empresa', data.empresa);
                }
                setLoading(false);
            } catch (error) {
                console.error(error);
                toast.error('Error carregant el contenidor');
                setLoading(false);
                navigate('/gestor-contenedors');
            }
        }
        loadContenedor();
    }, [params.id, setValue, navigate]);

    useEffect(() => {
        async function loadZonas() {
            try {
                const { data } = await getAllZones();
                setZonas(data);
            } catch (error) {
                console.error(error);
                toast.error('Error carregant les zones');
            }
        }
        loadZonas();
    }, []);

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
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        {params.id ? 'Editar Contenidor' : 'Crear Nou Contenidor'}
                    </h1>
                    <p className="text-gray-500 text-sm">
                        {params.id 
                            ? 'Actualitza la informació del contenidor existent' 
                            : 'Completa el formulari per crear un nou contenidor'}
                    </p>
                </div>
                <button 
                    onClick={() => navigate('/gestor-contenedors')}
                    className="flex items-center text-gray-600 hover:text-gray-800"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    <span>Tornar</span>
                </button>
            </div>
            
            {/* Sección de estadísticas colapsable (solo visible si estamos editando) */}
            {params.id && (
                <div className="mb-6">
                    <button 
                        onClick={() => setShowStats(!showStats)}
                        className="w-full flex items-center justify-between p-3 bg-blue-50 rounded-lg transition-colors hover:bg-blue-100"
                    >
                        <div className="flex items-center">
                            <BarChart className="w-5 h-5 text-blue-600 mr-2" />
                            <span className="font-medium text-blue-700">Estadístiques del Contenidor</span>
                        </div>
                        {showStats ? (
                            <ChevronUp className="w-5 h-5 text-blue-600" />
                        ) : (
                            <ChevronDown className="w-5 h-5 text-blue-600" />
                        )}
                    </button>
                    
                    {showStats && (
                        <div className="p-4 bg-white border border-blue-100 rounded-lg mt-2 transition-all duration-300 ease-in-out">
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Última actualització</p>
                                        <p className="font-medium">
                                            {contenedor?.updatedAt 
                                                ? new Date(contenedor.updatedAt).toLocaleString() 
                                                : 'No disponible'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Estat actual</p>
                                        <div className="flex items-center">
                                            <div className={`w-3 h-3 rounded-full mr-2 ${
                                                contenedor?.estat === 'ple' ? 'bg-red-500' :
                                                contenedor?.estat === 'mig' ? 'bg-yellow-500' :
                                                'bg-green-500'
                                            }`}></div>
                                            <p className="font-medium capitalize">
                                                {contenedor?.estat || 'No disponible'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Historial d'ompliment (simulat)</p>
                                    <div className="h-10 bg-gray-100 rounded-full overflow-hidden flex">
                                        <div className="bg-green-500 h-full" style={{width: '40%'}}></div>
                                        <div className="bg-yellow-500 h-full" style={{width: '35%'}}></div>
                                        <div className="bg-red-500 h-full" style={{width: '25%'}}></div>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                                        <span>Buit (40%)</span>
                                        <span>Mig (35%)</span>
                                        <span>Ple (25%)</span>
                                    </div>
                                </div>
                                
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Freqüència de recollida</p>
                                    <p className="font-medium">
                                        {contenedor?.frecuencia || 'Setmanal'} (simulat)
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
            
            <form onSubmit={onSubmit} className="space-y-5">
                {/* Código */}
                <div className="mb-4">
                    <label htmlFor="cod" className="block text-sm font-medium text-gray-700 mb-1">
                        Codi del Contenidor
                    </label>
                    <input
                        id="cod"
                        type="text"
                        placeholder="Introdueix el codi del contenidor"
                        {...register('cod', { required: 'El codi és obligatori' })}
                        className={`w-full rounded-lg border ${errors.cod ? 'border-red-500' : 'border-gray-300'} px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    {errors.cod && <p className="mt-1 text-sm text-red-600">{errors.cod.message}</p>}
                </div>

                {/* Zona - Select */}
                <div className="mb-4">
                    <label htmlFor="zona" className="block text-sm font-medium text-gray-700 mb-1">
                        Zona de Reciclatge
                    </label>
                    <select
                        id="zona"
                        {...register('zona')}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                        <option value="">Cap zona assignada</option>
                        {zonas.map((zona) => (
                            <option key={zona.id} value={zona.id}>
                                {zona.nom}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Tipo y Estado en una fila */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="mb-4">
                        <label htmlFor="tipus" className="block text-sm font-medium text-gray-700 mb-1">
                            Tipus de Residus
                        </label>
                        <select
                            id="tipus"
                            {...register('tipus', { required: 'El tipus és obligatori' })}
                            className={`w-full rounded-lg border ${errors.tipus ? 'border-red-500' : 'border-gray-300'} px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white`}
                        >
                            <option value="">Selecciona un tipus</option>
                            {tipos.map((tipo) => (
                                <option key={tipo.id} value={tipo.id}>
                                    {tipo.nombre}
                                </option>
                            ))}
                        </select>
                        {errors.tipus && <p className="mt-1 text-sm text-red-600">{errors.tipus.message}</p>}
                    </div>

                    <div className="mb-4">
                        <label htmlFor="estat" className="block text-sm font-medium text-gray-700 mb-1">
                            Estat del Contenidor
                        </label>
                        <select
                            id="estat"
                            {...register('estat', { required: 'L\'estat és obligatori' })}
                            className={`w-full rounded-lg border ${errors.estat ? 'border-red-500' : 'border-gray-300'} px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white`}
                        >
                            <option value="">Selecciona un estat</option>
                            {estados.map((estado) => (
                                <option key={estado.id} value={estado.id}>
                                    {estado.nombre}
                                </option>
                            ))}
                        </select>
                        {errors.estat && <p className="mt-1 text-sm text-red-600">{errors.estat.message}</p>}
                    </div>
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
                        <p className="text-xs text-gray-500">Fes clic al mapa per seleccionar la ubicació del contenidor</p>
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

                {/* Botones de acción */}
                <div className="flex justify-between mt-8">
                    {params.id && (
                        <button 
                            type="button" 
                            onClick={handleDelete}
                            className="flex items-center px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Eliminar Contenidor
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
                                {params.id ? 'Actualitzar' : 'Crear Contenidor'}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}