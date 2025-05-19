import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { verifyResetToken, resetPassword } from '../../api/auth.api';
import { toast } from 'react-hot-toast';
import { FaLock, FaEye, FaEyeSlash, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';

export function ResetPasswordPage() {
    const { 
        register, 
        handleSubmit, 
        watch,
        formState: { errors, isValid } 
    } = useForm({ mode: 'onChange' });
    
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(true);
    const [tokenValid, setTokenValid] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [resetSuccess, setResetSuccess] = useState(false);
    
    const { uid, token } = useParams();
    const navigate = useNavigate();
    const password = watch("password", "");
    
    // Verify token on component mount
    useEffect(() => {
        const checkToken = async () => {
            setVerifying(true);
            try {
                const response = await verifyResetToken(uid, token);
                setTokenValid(response.valid);
            } catch (error) {
                setTokenValid(false);
                toast.error("L'enllaç no és vàlid o ha caducat.");
            } finally {
                setVerifying(false);
            }
        };
        
        checkToken();
    }, [uid, token]);
    
    const onSubmit = async (data) => {
        setLoading(true);
        try {
            await resetPassword(uid, token, data.password);
            setResetSuccess(true);
            toast.success("La teva contrasenya s'ha restablert correctament");
        } catch (error) {
            toast.error("No s'ha pogut restablir la contrasenya. L'enllaç pot haver caducat.");
        } finally {
            setLoading(false);
        }
    };
    
    // Show loading state while verifying token
    if (verifying) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-900 to-gray-900 px-4 py-12">
                <div className="w-full max-w-md overflow-hidden rounded-xl bg-gray-800 shadow-2xl p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
                    <p className="text-white mt-4">Verificant l'enllaç...</p>
                </div>
            </div>
        );
    }
    
    // Show error state if token is invalid
    if (!tokenValid) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-900 to-gray-900 px-4 py-12">
                <div className="w-full max-w-md overflow-hidden rounded-xl bg-gray-800 shadow-2xl">
                    <div className="bg-red-600 p-6 text-center">
                        <h1 className="text-3xl font-bold text-white">ReciclamJA</h1>
                        <p className="mt-2 text-gray-100">Enllaç invàlid</p>
                    </div>
                    
                    <div className="p-8 text-center">
                        <div className="rounded-full bg-red-100 p-3 mx-auto w-16 h-16 flex items-center justify-center mb-6">
                            <FaLock className="text-red-600 text-2xl" />
                        </div>
                        
                        <h2 className="text-xl font-semibold text-white mb-4">Enllaç no vàlid o caducat</h2>
                        <p className="text-gray-300 mb-6">
                            L'enllaç per restablir la contrasenya no és vàlid o ha caducat. Si us plau, sol·licita un nou enllaç.
                        </p>
                        
                        <Link to="/forgot-password" className="bg-green-600 hover:bg-green-500 text-white font-medium py-2 px-4 rounded-lg transition-colors inline-block">
                            Sol·licitar un nou enllaç
                        </Link>
                        
                        <div className="mt-4">
                            <Link to="/login" className="inline-flex items-center text-green-400 hover:text-green-300">
                                <FaArrowLeft className="mr-2" /> Tornar a l'inici de sessió
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    
    // Show success state after reset
    if (resetSuccess) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-900 to-gray-900 px-4 py-12">
                <div className="w-full max-w-md overflow-hidden rounded-xl bg-gray-800 shadow-2xl">
                    <div className="bg-green-600 p-6 text-center">
                        <h1 className="text-3xl font-bold text-white">ReciclamJA</h1>
                        <p className="mt-2 text-gray-100">Contrasenya restablerta</p>
                    </div>
                    
                    <div className="p-8 text-center">
                        <div className="rounded-full bg-green-100 p-3 mx-auto w-16 h-16 flex items-center justify-center mb-6">
                            <FaCheckCircle className="text-green-600 text-2xl" />
                        </div>
                        
                        <h2 className="text-xl font-semibold text-white mb-4">Contrasenya restablerta amb èxit</h2>
                        <p className="text-gray-300 mb-6">
                            La teva contrasenya s'ha canviat correctament. Ara pots iniciar sessió amb la nova contrasenya.
                        </p>
                        
                        <Link to="/login" className="bg-green-600 hover:bg-green-500 text-white font-medium py-2 px-4 rounded-lg transition-colors inline-block">
                            Iniciar sessió
                        </Link>
                    </div>
                </div>
            </div>
        );
    }
    
    // Main form for password reset
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-900 to-gray-900 px-4 py-12">
            <div className="w-full max-w-md overflow-hidden rounded-xl bg-gray-800 shadow-2xl">
                <div className="bg-green-600 p-6 text-center">
                    <h1 className="text-3xl font-bold text-white">ReciclamJA</h1>
                    <p className="mt-2 text-gray-100">Crear nova contrasenya</p>
                </div>
                
                <div className="p-8">
                    <h2 className="text-xl font-semibold text-white mb-4">Escull una nova contrasenya</h2>
                    <p className="text-gray-300 mb-6">
                        Crea una nova contrasenya segura per al teu compte.
                    </p>
                    
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-300 mb-1">Nova contrasenya</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <FaLock className="text-gray-500" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="La teva nova contrasenya"
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
                                >
                                    {showPassword ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.password && <p className="mt-2 text-sm text-red-400">{errors.password.message}</p>}
                            <p className="text-xs text-gray-400 mt-1">
                                La contrasenya ha de tenir com a mínim 8 caràcters i no pot ser només numèrica.
                            </p>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-300 mb-1">Confirma la contrasenya</label>
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
                                >
                                    {showConfirmPassword ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.confirmPassword && <p className="mt-2 text-sm text-red-400">{errors.confirmPassword.message}</p>}
                        </div>
                        
                        <button
                            type="submit"
                            disabled={loading || !isValid}
                            className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                                loading || !isValid
                                    ? 'bg-green-700 cursor-not-allowed opacity-75'
                                    : 'bg-green-600 hover:bg-green-500 shadow-lg hover:shadow-green-500/20'
                            }`}
                        >
                            {loading ? 'Guardant...' : 'Canviar contrasenya'}
                        </button>
                    </form>
                    
                    <div className="mt-6 text-center">
                        <Link to="/login" className="text-green-400 hover:text-green-300">
                            Tornar a l'inici de sessió
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
