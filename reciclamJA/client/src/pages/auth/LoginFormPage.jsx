import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext'; // Importa el contexto de autenticación
import { toast } from 'react-hot-toast'; // Para mostrar mensajes de éxito o error
import { useNavigate } from 'react-router-dom';  // Importa el hook de navegación

export function LoginFormPage() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();  // Usa la función login del contexto de autenticación
    const navigate = useNavigate();  // Hook para redirigir

    // Función que se ejecuta cuando el formulario se envía
    const onSubmit = async (data) => {
        setLoading(true);  // Indicamos que la solicitud está en proceso

        try {
            // Cambia "email" por "username" si tu API espera "username"
            await login({
                username: data.username,  // Usamos "username" aquí
                password: data.password,
            });

            // Si la respuesta es exitosa, mostramos un mensaje de éxito
            toast.success("Logged in successfully");
            navigate('/dashboard'); // Redirige al dashboard o página principal
        } catch (error) {
            // Si ocurre un error, mostramos un mensaje
            const errorMessage = error?.response?.data?.message || "Unknown error occurred";
            toast.error("Error logging in: " + errorMessage);
            console.error("Login Error:", error);
        }

        setLoading(false);  // Indicamos que la solicitud ha terminado
    };

    return (
        <div className="max-w-md mx-auto mt-10">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Campo de nombre de usuario */}
                <input
                    type="text"
                    placeholder="Username"
                    {...register('username', { required: 'Username is required' })}
                    className="w-full p-3 bg-gray-700 text-white rounded-md"
                    disabled={loading}
                />
                {errors.username && <p className="text-red-500">{errors.username.message}</p>}

                {/* Campo de contraseña */}
                <input
                    type="password"
                    placeholder="Password"
                    {...register('password', { required: 'Password is required' })}
                    className="w-full p-3 bg-gray-700 text-white rounded-md"
                    disabled={loading}
                />
                {errors.password && <p className="text-red-500">{errors.password.message}</p>}

                {/* Botón de envío */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-blue-500 text-white rounded-md"
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
        </div>
    );
}
