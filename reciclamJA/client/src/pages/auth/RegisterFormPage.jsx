import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser, checkEmailExists } from '../../api/auth.api';
import { toast } from 'react-hot-toast';
import { FaUser, FaEnvelope, FaLock, FaUserPlus, FaCalendarAlt, FaMapMarkerAlt, FaCity, FaAddressCard, FaEye, FaEyeSlash } from 'react-icons/fa';

export function RegisterFormPage() {
    const { 
        register, 
        handleSubmit, 
        watch, 
        setError,
        formState: { errors, isValid } 
    } = useForm({ mode: 'onChange' });
    
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();
    const password = watch("password", "");

    const onSubmit = async (data) => {
        setLoading(true);
        
        // Verificar si el correu electrònic ja existeix
        try {
            const emailExists = await checkEmailExists(data.email);
            if (emailExists) {
                // Aquí es marca el camp email com a invàlid
                setError('email', {
                    type: 'manual',
                    message: 'Aquest correu electrònic ja està registrat'
                });
                
                // Mostrar el missatge amb toast
                toast.error("Aquest correu electrònic ja està registrat!");

                setLoading(false);
                return;
            }
        } catch (error) {
            // Si ocorre un error en la verificació del correu
            toast.error("Error al verificar el correu electrònic!");
            setLoading(false);
            return;
        }

        // Si el correu no existeix, s'envia el registre
        const userData = {
            username: data.username,
            email: data.email,
            password: data.password,
            first_name: data.first_name,
            last_name: data.last_name,
            age: data.age,
            location: data.location,
            CP: data.postal_code,
            role_id: 4,  // Rol fix per a usuaris normals
            empresa_id: null // Empresa sempre null
        };

        try {
            await registerUser(userData);
            toast.success("Registre completat amb èxit!");
            navigate('/login');
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Error en el registre";
            toast.error(errorMsg);
            console.error("Error de registre:", error.response?.data);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-900 to-gray-900 px-4 py-12">
            <div className="w-full max-w-md overflow-hidden rounded-xl bg-gray-800 shadow-2xl">
                {/* Header */}
                <div className="bg-green-600 p-6 text-center">
                    <h1 className="text-3xl font-bold text-white">ReciclamJA</h1>
                    <p className="mt-2 text-gray-100">Crea el teu compte</p>
                </div>
                
                {/* Form */}
                <div className="p-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {/* Nom d'usuari */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Nom d'usuari*</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <FaUser className="text-gray-500" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Introdueix el teu nom d'usuari"
                                    {...register('username', { 
                                        required: "El nom d'usuari és obligatori",
                                        minLength: {
                                            value: 3,
                                            message: "Mínim 3 caràcters"
                                        }
                                    })}
                                    className={`w-full pl-10 pr-4 py-3 bg-gray-700 text-white rounded-lg border focus:ring-2 focus:outline-none transition-all ${
                                        errors.username 
                                            ? 'border-red-500 focus:ring-red-500/50' 
                                            : 'border-gray-600 focus:border-green-500 focus:ring-green-500/50'
                                    }`}
                                    disabled={loading}
                                />
                            </div>
                            {errors.username && <p className="mt-2 text-sm text-red-400">{errors.username.message}</p>}
                        </div>

                        {/* Correu electrònic */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Correu electrònic*</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <FaEnvelope className="text-gray-500" />
                                </div>
                                <input
                                    type="email"
                                    placeholder="Introdueix el teu correu electrònic"
                                    {...register('email', { 
                                        required: "El correu electrònic és obligatori",
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: "Correu electrònic invàlid"
                                        }
                                    })}
                                    className={`w-full pl-10 pr-4 py-3 bg-gray-700 text-white rounded-lg border focus:ring-2 focus:outline-none transition-all ${
                                        errors.email 
                                            ? 'border-red-500 focus:ring-red-500/50' 
                                            : 'border-gray-600 focus:border-green-500 focus:ring-green-500/50'
                                    }`}
                                    disabled={loading}
                                />
                            </div>
                            {errors.email && <p className="mt-2 text-sm text-red-400">{errors.email.message}</p>}
                        </div>

                        {/* Contrasenya */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Contrasenya*</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <FaLock className="text-gray-500" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Crea una contrasenya segura"
                                    {...register('password', { 
                                        required: "La contrasenya és obligatòria",
                                        minLength: {
                                            value: 8,
                                            message: "Mínim 8 caràcters"
                                        },
                                        validate: (value) => 
                                            !/^\d+$/.test(value) || "La contrasenya no pot ser només numèrica"
                                    })}
                                    className={`w-full pl-10 pr-12 py-3 bg-gray-700 text-white rounded-lg border focus:ring-2 focus:outline-none transition-all ${
                                        errors.password 
                                            ? 'border-red-500 focus:ring-red-500/50' 
                                            : 'border-gray-600 focus:border-green-500 focus:ring-green-500/50'
                                    }`}
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex="-1"
                                    aria-label={showPassword ? "Amagar contrasenya" : "Mostrar contrasenya"}
                                >
                                    {showPassword ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.password && <p className="mt-2 text-sm text-red-400">{errors.password.message}</p>}
                            <p className="text-xs text-gray-400 mt-1">
                                La contrasenya ha de tenir com a mínim 8 caràcters i no pot ser només numèrica.
                            </p>
                        </div>

                        {/* Confirmar contrasenya */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Repeteix la contrasenya*</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <FaLock className="text-gray-500" />
                                </div>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Repeteix la contrasenya"
                                    {...register('confirmPassword', { 
                                        required: "Has de confirmar la contrasenya",
                                        validate: value => 
                                            value === password || "Les contrasenyes no coincideixen"
                                    })}
                                    className={`w-full pl-10 pr-12 py-3 bg-gray-700 text-white rounded-lg border focus:ring-2 focus:outline-none transition-all ${
                                        errors.confirmPassword 
                                            ? 'border-red-500 focus:ring-red-500/50' 
                                            : 'border-gray-600 focus:border-green-500 focus:ring-green-500/50'
                                    }`}
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    tabIndex="-1"
                                    aria-label={showConfirmPassword ? "Amagar contrasenya" : "Mostrar contrasenya"}
                                >
                                    {showConfirmPassword ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.confirmPassword && <p className="mt-2 text-sm text-red-400">{errors.confirmPassword.message}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Nom */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Nom*</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <FaUser className="text-gray-500" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="El teu nom"
                                        {...register('first_name', { 
                                            required: "El nom és obligatori"
                                        })}
                                        className={`w-full pl-10 pr-4 py-3 bg-gray-700 text-white rounded-lg border focus:ring-2 focus:outline-none transition-all ${
                                            errors.first_name 
                                                ? 'border-red-500 focus:ring-red-500/50' 
                                                : 'border-gray-600 focus:border-green-500 focus:ring-green-500/50'
                                        }`}
                                        disabled={loading}
                                    />
                                </div>
                                {errors.first_name && <p className="mt-2 text-sm text-red-400">{errors.first_name.message}</p>}
                            </div>

                            {/* Cognom */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Cognom*</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <FaUser className="text-gray-500" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="El teu cognom"
                                        {...register('last_name', { 
                                            required: "El cognom és obligatori"
                                        })}
                                        className={`w-full pl-10 pr-4 py-3 bg-gray-700 text-white rounded-lg border focus:ring-2 focus:outline-none transition-all ${
                                            errors.last_name 
                                                ? 'border-red-500 focus:ring-red-500/50' 
                                                : 'border-gray-600 focus:border-green-500 focus:ring-green-500/50'
                                        }`}
                                        disabled={loading}
                                    />
                                </div>
                                {errors.last_name && <p className="mt-2 text-sm text-red-400">{errors.last_name.message}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Edat */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Edat*</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <FaCalendarAlt className="text-gray-500" />
                                    </div>
                                    <input
                                        type="number"
                                        placeholder="La teva edat"
                                        min="18"
                                        max="120"
                                        {...register('age', { 
                                            required: "L'edat és obligatòria",
                                            min: {
                                                value: 18,
                                                message: "Has de tenir com a mínim 18 anys"
                                            },
                                            max: {
                                                value: 120,
                                                message: "Edat no vàlida"
                                            }
                                        })}
                                        className={`w-full pl-10 pr-4 py-3 bg-gray-700 text-white rounded-lg border focus:ring-2 focus:outline-none transition-all ${
                                            errors.age 
                                                ? 'border-red-500 focus:ring-red-500/50' 
                                                : 'border-gray-600 focus:border-green-500 focus:ring-green-500/50'
                                        }`}
                                        disabled={loading}
                                    />
                                </div>
                                {errors.age && <p className="mt-2 text-sm text-red-400">{errors.age.message}</p>}
                            </div>

                            {/* Codi Postal */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Codi Postal*</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <FaAddressCard className="text-gray-500" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Ex: 08001"
                                        {...register('postal_code', { 
                                            required: "El codi postal és obligatori",
                                            pattern: {
                                                value: /^\d{5}$/,
                                                message: "Codi postal invàlid (5 dígits)"
                                            }
                                        })}
                                        className={`w-full pl-10 pr-4 py-3 bg-gray-700 text-white rounded-lg border focus:ring-2 focus:outline-none transition-all ${
                                            errors.postal_code 
                                                ? 'border-red-500 focus:ring-red-500/50' 
                                                : 'border-gray-600 focus:border-green-500 focus:ring-green-500/50'
                                        }`}
                                        disabled={loading}
                                    />
                                </div>
                                {errors.postal_code && <p className="mt-2 text-sm text-red-400">{errors.postal_code.message}</p>}
                            </div>
                        </div>

                        {/* Ciutat */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Ciutat*</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <FaCity className="text-gray-500" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="La teva ciutat"
                                    {...register('location', { 
                                        required: "La ciutat és obligatòria"
                                    })}
                                    className={`w-full pl-10 pr-4 py-3 bg-gray-700 text-white rounded-lg border focus:ring-2 focus:outline-none transition-all ${
                                        errors.location 
                                            ? 'border-red-500 focus:ring-red-500/50' 
                                            : 'border-gray-600 focus:border-green-500 focus:ring-green-500/50'
                                    }`}
                                    disabled={loading}
                                />
                            </div>
                            {errors.location && <p className="mt-2 text-sm text-red-400">{errors.location.message}</p>}
                        </div>

                        {/* Botó de registre */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3 px-4 mt-6 rounded-lg font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center justify-center gap-2 ${
                                loading 
                                    ? 'bg-green-700 cursor-not-allowed opacity-75' 
                                    : 'bg-green-600 hover:bg-green-500 shadow-lg hover:shadow-green-500/20'
                            }`}
                        >
                            {loading ? (
                                <span>Registrant...</span>
                            ) : (
                                <>
                                    <FaUserPlus />
                                    <span>Registra't</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-400">
                            Ja tens un compte?{' '}
                            <Link 
                                to="/login" 
                                className="text-green-400 hover:text-green-300 font-medium transition-colors"
                            >
                                Inicia sessió
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
