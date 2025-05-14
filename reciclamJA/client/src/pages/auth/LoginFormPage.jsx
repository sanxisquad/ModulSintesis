import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { toast } from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import { Spinner } from '../../components/common/Spinner';

export function LoginFormPage() {
    const { 
        register, 
        handleSubmit, 
        formState: { errors, isValid } 
    } = useForm({ mode: 'onChange' });
    
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
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
                    navigate('/gestor-dashboard');
                    break;
                case loggedInUser?.is_admin:
                    navigate('/gestor-dashboard');
                    break;
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
        <div className="max-w-md w-full mx-auto p-8 bg-gray-800 rounded-xl shadow-2xl">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Iniciar Sessió</h1>
                <p className="text-gray-400">Accedeix al teu compte per continuar</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                        Nom d'usuari
                    </label>
                    <div className="relative">
                        <input
                            id="username"
                            type="text"
                            placeholder="exemple@domini.com"
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
                            className={`w-full px-4 py-3 bg-gray-700 text-white rounded-lg border focus:ring-2 focus:outline-none transition-all ${
                                errors.username 
                                    ? 'border-red-500 focus:ring-red-500/50' 
                                    : 'border-gray-600 focus:border-blue-500 focus:ring-blue-500/50'
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
                            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            Has oblidat la contrasenya?
                        </Link>
                    </div>
                    <div className="relative">
                        <input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            autoComplete="current-password"
                            {...register('password', { 
                                required: 'La contrasenya és obligatòria',
                                minLength: {
                                    value: 6,
                                    message: 'Mínim 6 caràcters'
                                },
                                maxLength: {
                                    value: 100,
                                    message: 'Màxim 100 caràcters'
                                }
                            })}
                            className={`w-full px-4 py-3 bg-gray-700 text-white rounded-lg border focus:ring-2 focus:outline-none transition-all ${
                                errors.password 
                                    ? 'border-red-500 focus:ring-red-500/50' 
                                    : 'border-gray-600 focus:border-blue-500 focus:ring-blue-500/50'
                            }`}
                            disabled={loading}
                            aria-invalid={errors.password ? "true" : "false"}
                        />
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
                            className="h-4 w-4 text-blue-600 rounded bg-gray-700 border-gray-600 focus:ring-blue-500"
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
                    className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                        loading || !isValid
                            ? 'bg-blue-700 cursor-not-allowed opacity-75'
                            : 'bg-blue-600 hover:bg-blue-500 shadow-lg hover:shadow-blue-500/20'
                    }`}
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <Spinner size="sm" />
                            Iniciant sessió...
                        </span>
                    ) : (
                        'Iniciar sessió'
                    )}
                </button>
            </form>

            <div className="mt-6 text-center">
                <p className="text-gray-400">
                    No tens un compte?{' '}
                    <Link 
                        to="/register" 
                        className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                    >
                        Registra't
                    </Link>
                </p>
            </div>
        </div>
    );
}