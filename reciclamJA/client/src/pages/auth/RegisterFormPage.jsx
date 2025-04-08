import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser, checkEmailExists } from '../../api/auth.api';
import { toast } from 'react-hot-toast';

export function RegisterFormPage() {
    const { 
        register, 
        handleSubmit, 
        watch, 
        setError,  // Asegúrate de importar setError para establecer errores manualmente
        formState: { errors } 
    } = useForm();
    
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const password = watch("password", "");

    const onSubmit = async (data) => {
        setLoading(true);
        
        // Verificar si el correo electrónico ya existe
        try {
            const emailExists = await checkEmailExists(data.email);
            if (emailExists) {
                // Aquí se marca el campo email como inválido
                setError('email', {
                    type: 'manual',
                    message: 'Aquest correu electrònic ja està registrat'
                });
                
                // Mostrar el mensaje con toast
                toast.error("Aquest correu electrònic ja està registrat!");

                setLoading(false);
                return;
            }
        } catch (error) {
            // Si ocurre un error en la verificación del correo
            toast.error("Error al verificar el correu electrònic!");
            setLoading(false);
            return;
        }

        // Si el correo no existe, se envía el registro
        const userData = {
            username: data.username,
            email: data.email,
            password: data.password,
            first_name: data.first_name,
            last_name: data.last_name,
            age: data.age,
            location: data.location,
            CP: data.postal_code,
            role_id: 4,  // Rol fijo para usuarios normales
            empresa_id: null // Empresa siempre null
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
        <div className="max-w-md mx-auto p-6 bg-gray-800 rounded-lg shadow-xl mt-10">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Registre d'Usuari</h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Nom d'usuari */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Nom d'usuari*</label>
                    <input
                        type="text"
                        {...register('username', { 
                            required: "El nom d'usuari és obligatori",
                            minLength: {
                                value: 3,
                                message: "Mínim 3 caràcters"
                            }
                        })}
                        className="w-full p-3 bg-gray-700 text-white rounded-md"
                    />
                    {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>}
                </div>

                {/* Correu electrònic */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Correu electrònic*</label>
                    <input
                        type="email"
                        {...register('email', { 
                            required: "El correu electrònic és obligatori",
                            pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: "Correu electrònic invàlid"
                            }
                        })}
                        className="w-full p-3 bg-gray-700 text-white rounded-md"
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                </div>

                {/* Contrasenya */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Contrasenya*</label>
                    <input
                        type="password"
                        {...register('password', { 
                            required: "La contrasenya és obligatòria",
                            minLength: {
                                value: 8,
                                message: "Mínim 8 caràcters"
                            },
                            validate: (value) => 
                                !/^\d+$/.test(value) || "La contrasenya no pot ser només numèrica"
                        })}
                        className="w-full p-3 bg-gray-700 text-white rounded-md"
                    />
                    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
                    <p className="text-xs text-gray-400 mt-1">
                        La contrasenya ha de tenir com a mínim 8 caràcters i no pot ser només numèrica.
                    </p>
                </div>

                {/* Confirmar contrasenya */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Repeteix la contrasenya*</label>
                    <input
                        type="password"
                        {...register('confirmPassword', { 
                            required: "Has de confirmar la contrasenya",
                            validate: value => 
                                value === password || "Les contrasenyes no coincideixen"
                        })}
                        className="w-full p-3 bg-gray-700 text-white rounded-md"
                    />
                    {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
                </div>

                {/* Nom */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Nom*</label>
                    <input
                        type="text"
                        {...register('first_name', { 
                            required: "El nom és obligatori"
                        })}
                        className="w-full p-3 bg-gray-700 text-white rounded-md"
                    />
                    {errors.first_name && <p className="text-red-500 text-sm mt-1">{errors.first_name.message}</p>}
                </div>

                {/* Cognom */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Cognom*</label>
                    <input
                        type="text"
                        {...register('last_name', { 
                            required: "El cognom és obligatori"
                        })}
                        className="w-full p-3 bg-gray-700 text-white rounded-md"
                    />
                    {errors.last_name && <p className="text-red-500 text-sm mt-1">{errors.last_name.message}</p>}
                </div>

                {/* Edat */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Edat*</label>
                    <input
                        type="number"
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
                        className="w-full p-3 bg-gray-700 text-white rounded-md"
                    />
                    {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age.message}</p>}
                </div>

                {/* Ciutat */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Ciutat*</label>
                    <input
                        type="text"
                        {...register('location', { 
                            required: "La ciutat és obligatòria"
                        })}
                        className="w-full p-3 bg-gray-700 text-white rounded-md"
                    />
                    {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>}
                </div>

                {/* Codi Postal */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Codi Postal*</label>
                    <input
                        type="text"
                        {...register('postal_code', { 
                            required: "El codi postal és obligatori",
                            pattern: {
                                value: /^\d{5}$/,
                                message: "Codi postal invàlid (5 dígits)"
                            }
                        })}
                        className="w-full p-3 bg-gray-700 text-white rounded-md"
                    />
                    {errors.postal_code && <p className="text-red-500 text-sm mt-1">{errors.postal_code.message}</p>}
                </div>

                {/* Botó de registre */}
                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${
                        loading ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                >
                    {loading ? 'Registrant...' : 'Registra-te'}
                </button>
            </form>

            <p className="text-center text-gray-400 mt-4">
                Ja tens un compte?{' '}
                <a href="/login" className="text-blue-400 hover:text-blue-300">
                    Inicia sessió
                </a>
            </p>
        </div>
    );
}
