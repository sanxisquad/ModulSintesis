import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { requestPasswordReset } from '../../api/auth.api';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';

export function ForgotPasswordPage() {
    const { register, handleSubmit, formState: { errors, isValid } } = useForm({ mode: 'onChange' });
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    
    const onSubmit = async (data) => {
        setLoading(true);
        try {
            await requestPasswordReset(data.email);
            setEmailSent(true);
            toast.success("Si el teu correu existeix, rebràs un enllaç per restablir la contrasenya");
        } catch (error) {
            // We don't show specific errors for security reasons
            toast.success("Si el teu correu existeix, rebràs un enllaç per restablir la contrasenya");
            setEmailSent(true); // We still set this to true for security
        } finally {
            setLoading(false);
        }
    };
    
    if (emailSent) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-900 to-gray-900 px-4 py-12">
                <div className="w-full max-w-md overflow-hidden rounded-xl bg-gray-800 shadow-2xl">
                    <div className="bg-green-600 p-6 text-center">
                        <h1 className="text-3xl font-bold text-white">ReciclamJA</h1>
                        <p className="mt-2 text-gray-100">Restablir contrasenya</p>
                    </div>
                    
                    <div className="p-8 text-center">
                        <div className="rounded-full bg-green-100 p-3 mx-auto w-16 h-16 flex items-center justify-center mb-6">
                            <FaEnvelope className="text-green-600 text-2xl" />
                        </div>
                        
                        <h2 className="text-xl font-semibold text-white mb-4">Comprova el teu correu</h2>
                        <p className="text-gray-300 mb-6">
                            Si el teu correu està registrat, rebràs un enllaç per restablir la contrasenya.
                            Comprova la teva safata d'entrada i la carpeta de spam.
                        </p>
                        
                        <Link to="/login" className="inline-flex items-center text-green-400 hover:text-green-300">
                            <FaArrowLeft className="mr-2" /> Tornar a l'inici de sessió
                        </Link>
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-900 to-gray-900 px-4 py-12">
            <div className="w-full max-w-md overflow-hidden rounded-xl bg-gray-800 shadow-2xl">
                <div className="bg-green-600 p-6 text-center">
                    <h1 className="text-3xl font-bold text-white">ReciclamJA</h1>
                    <p className="mt-2 text-gray-100">Restablir contrasenya</p>
                </div>
                
                <div className="p-8">
                    <h2 className="text-xl font-semibold text-white mb-4">Has oblidat la contrasenya?</h2>
                    <p className="text-gray-300 mb-6">
                        Introdueix el teu correu i t'enviarem un enllaç per crear una nova contrasenya.
                    </p>
                    
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Correu electrònic</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <FaEnvelope className="text-gray-500" />
                                </div>
                                <input
                                    type="email"
                                    placeholder="El teu correu electrònic"
                                    {...register('email', { 
                                        required: "El correu és obligatori",
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: "Format de correu invàlid"
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
                        
                        <button
                            type="submit"
                            disabled={loading || !isValid}
                            className={`w-full py-3 px-4 mt-6 rounded-lg font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                                loading || !isValid
                                    ? 'bg-green-700 cursor-not-allowed opacity-75'
                                    : 'bg-green-600 hover:bg-green-500 shadow-lg hover:shadow-green-500/20'
                            }`}
                        >
                            {loading ? 'Enviant...' : 'Enviar enllaç'}
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
