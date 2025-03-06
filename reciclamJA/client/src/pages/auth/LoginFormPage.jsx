import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../api/auth.api';  // Función que consulta la API
import { toast } from 'react-hot-toast'; // Para mostrar mensajes de éxito o error

export function LoginFormPage() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Función que se ejecuta cuando el formulario se envía
    const onSubmit = async (data) => {
        setLoading(true);  // Indicamos que la solicitud está en proceso

        try {
            // Cambia "email" por "username" si tu API espera "username"
            const response = await loginUser({
                username: data.username,  // Usamos "username" aquí
                password: data.password,
            });

            // Guardar el token recibido en el localStorage (para mantener la sesión)
            localStorage.setItem('auth_token', response.data.token);  // Asegúrate de que el token esté en la respuesta

            // Si la respuesta es exitosa, redirigimos al usuario al dashboard o página principal
            toast.success("Logged in successfully");
            navigate('/dashboard');  // O a la página que desees
        } catch (error) {
            // Si ocurre un error, mostramos un mensaje
            toast.error("Error logging in: " + error.response.data.message);
            console.error("Login Error:", error.response.data);
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
                />
                {errors.username && <p className="text-red-500">{errors.username.message}</p>}

                {/* Campo de contraseña */}
                <input
                    type="password"
                    placeholder="Password"
                    {...register('password', { required: 'Password is required' })}
                    className="w-full p-3 bg-gray-700 text-white rounded-md"
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
