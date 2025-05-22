import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { toast } from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import { Spinner } from '../../components/common/Spinner';
import { FaUser, FaLock, FaSignInAlt, FaUserPlus, FaEye, FaEyeSlash } from 'react-icons/fa';

export function LoginFormPage() {
    const { 
        register, 
        handleSubmit, 
        formState: { errors, isValid } 
    } = useForm({ mode: 'onChange' });
    
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const loggedInUser = await login({
                username: data.username,
                password: data.password,
                rememberMe: rememberMe,
            });

            toast.success(`Benvingut/da ${loggedInUser.name || loggedInUser.username}!`, {
                icon: '👋',
                duration: 4000,
            });

            // Redirecció basada en rols
            switch(true) {
                case loggedInUser?.is_superadmin:
                case loggedInUser?.is_admin:
                case loggedInUser?.is_gestor:
                    navigate('/gestor-dashboard');
                    break;
                default:
                    navigate('/');
            }

        } catch (error) {
            handleLoginError(error);
        } finally {
            setLoading(false);
        }
    };

    const handleLoginError = (error) => {
        let errorMessage = 'Error en iniciar sessió';
        
        if (!error.response) {
            errorMessage = 'Problema de connexió. Verifica la teva xarxa.';
        } else {
            const status = error.response.status;
            const data = error.response.data;
            
            switch(status) {
                case 400:
                    errorMessage = data.message || 'Dades del formulari incorrectes';
                    break;
                case 401:
                    errorMessage = data.message || 'Credencials incorrectes';
                    break;
                case 403:
                    errorMessage = data.message || 'Compte inactiu o sense permisos';
                    break;
                case 429:
                    errorMessage = 'Massa intents. Torna-ho a provar més tard.';
                    break;
                case 500:
                    errorMessage = 'Error del servidor. Contacta amb el suport.';
                    break;
                default:
                    errorMessage = data.message || `Error ${status}`;
            }
        }

        toast.error(errorMessage, {
            duration: 5000,
            position: 'top-center',
        });
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-900 to-gray-900 px-4 py-12">
            <div className="w-full max-w-md overflow-hidden rounded-xl bg-gray-800 shadow-2xl">
                {/* Header */}
                <div className="bg-green-600 p-6 text-center">
                    <h1 className="text-3xl font-bold text-white">ReciclamJA</h1>
                    <p className="mt-2 text-gray-100">Accedeix al teu compte</p>
                </div>
                
                {/* Form */}
                <div className="p-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                                Nom d'usuari
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <FaUser className="text-gray-500" />
                                </div>
                                <input
                                    id="username"
                                    type="text"
                                    placeholder="Introdueix el teu nom d'usuari"
                                    autoComplete="username"
                                    {...register('username', { 
                                        required: "El nom d'usuari és obligatori",
                                        minLength: {
                                            value: 3,
                                            message: 'Mínim 3 caràcters'
                                        },
                                        maxLength: {
                                            value: 50,
                                            message: 'Màxim 50 caràcters'
                                        }
                                    })}
                                    className={`w-full pl-10 pr-4 py-3 bg-gray-700 text-white rounded-lg border focus:ring-2 focus:outline-none transition-all ${
                                        errors.username 
                                            ? 'border-red-500 focus:ring-red-500/50' 
                                            : 'border-gray-600 focus:border-green-500 focus:ring-green-500/50'
                                    }`}
                                    disabled={loading}
                                    aria-invalid={errors.username ? "true" : "false"}
                                />
                            </div>
                            {errors.username && (
                                <p className="mt-2 text-sm text-red-400" role="alert">
                                    {errors.username.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                                    Contrasenya
                                </label>
                                <Link 
                                    to="/forgot-password" 
                                    className="text-sm text-green-400 hover:text-green-300 transition-colors"
                                >
                                    Has oblidat la contrasenya?
                                </Link>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <FaLock className="text-gray-500" />
                                </div>
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Introdueix la teva contrasenya"
                                    autoComplete="current-password"
                                    {...register('password', { 
                                        required: 'La contrasenya és obligatòria',
                                        minLength: {
                                            value: 6,
                                            message: 'Mínim 8 caràcters'
                                        },
                                        maxLength: {
                                            value: 100,
                                            message: 'Màxim 100 caràcters'
                                        }
                                    })}
                                    className={`w-full pl-10 pr-12 py-3 bg-gray-700 text-white rounded-lg border focus:ring-2 focus:outline-none transition-all ${
                                        errors.password 
                                            ? 'border-red-500 focus:ring-red-500/50' 
                                            : 'border-gray-600 focus:border-green-500 focus:ring-green-500/50'
                                    }`}
                                    disabled={loading}
                                    aria-invalid={errors.password ? "true" : "false"}
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
                            {errors.password && (
                                <p className="mt-2 text-sm text-red-400" role="alert">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="rememberMe"
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="h-4 w-4 text-green-600 rounded bg-gray-700 border-gray-600 focus:ring-green-500"
                                    disabled={loading}
                                />
                                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-300">
                                    Mantenir la sessió iniciada
                                </label>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !isValid}
                            className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center justify-center gap-2 ${
                                loading || !isValid
                                    ? 'bg-green-700 cursor-not-allowed opacity-75'
                                    : 'bg-green-600 hover:bg-green-500 shadow-lg hover:shadow-green-500/20'
                            }`}
                        >
                            {loading ? (
                                <>
                                    <Spinner size="sm" />
                                    <span>Iniciant sessió...</span>
                                </>
                            ) : (
                                <>
                                    <FaSignInAlt />
                                    <span>Iniciar sessió</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-400">
                            No tens un compte?{' '}
                            <Link 
                                to="/register" 
                                className="text-green-400 hover:text-green-300 font-medium transition-colors flex items-center justify-center gap-1 mt-2"
                            >
                                <FaUserPlus />
                                <span>Registra't ara</span>
                            </Link>
                        </p>
                    </div>
                    
                    <div className="mt-6 border-t border-gray-700 pt-4">
                        <div className="text-center text-xs text-gray-500">
                            <p>Utilitza el teu nom d'usuari per iniciar sessió a ReciclamJA</p>
                            <p className="mt-1">Si tens problemes per accedir, contacta amb l'administrador</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}