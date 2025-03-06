import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../api/auth.api';  // Asegúrate de importar la función correcta
import { toast } from 'react-hot-toast'; // Para mostrar mensajes de éxito o error

export function RegisterFormPage() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Función que se ejecuta cuando el formulario se envía
    const onSubmit = async (data) => {
        setLoading(true);  // Indicamos que la solicitud está en proceso

        // Añadir el role_id con el valor 2 (USUARI) antes de enviar los datos
        const userData = { ...data, role_id: 2 };

        try {
            // Llamada a la API para registrar al usuario
            await registerUser(userData);

            // Si la respuesta es exitosa, redirigimos a la página de login
            toast.success("User registered successfully");
            navigate('/login');
        } catch (error) {
            // Si ocurre un error, mostramos un mensaje
            toast.error("Error registering user: " + error.response.data.message);
            console.error("Registration Error:", error.response.data);
        }

        setLoading(false);  // Indicamos que la solicitud ha terminado
    };

    return (
        <div className="max-w-md mx-auto mt-10">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Campo de usuario */}
                <input
                    type="text"
                    placeholder="Username"
                    {...register('username', { required: 'Username is required' })}
                    className="w-full p-3 bg-gray-700 text-white rounded-md"
                />
                {errors.username && <p className="text-red-500">{errors.username.message}</p>}

                {/* Campo de correo electrónico */}
                <input
                    type="email"
                    placeholder="Email"
                    {...register('email', { required: 'Email is required' })}
                    className="w-full p-3 bg-gray-700 text-white rounded-md"
                />
                {errors.email && <p className="text-red-500">{errors.email.message}</p>}

                {/* Campo de contraseña */}
                <input
                    type="password"
                    placeholder="Password"
                    {...register('password', { required: 'Password is required' })}
                    className="w-full p-3 bg-gray-700 text-white rounded-md"
                />
                {errors.password && <p className="text-red-500">{errors.password.message}</p>}

                {/* Campo de nombre */}
                <input
                    type="text"
                    placeholder="First Name"
                    {...register('first_name', { required: 'First name is required' })}
                    className="w-full p-3 bg-gray-700 text-white rounded-md"
                />
                {errors.first_name && <p className="text-red-500">{errors.first_name.message}</p>}

                {/* Campo de apellido */}
                <input
                    type="text"
                    placeholder="Last Name"
                    {...register('last_name', { required: 'Last name is required' })}
                    className="w-full p-3 bg-gray-700 text-white rounded-md"
                />
                {errors.last_name && <p className="text-red-500">{errors.last_name.message}</p>}

                {/* Botón de envío */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-blue-500 text-white rounded-md"
                >
                    {loading ? 'Registering...' : 'Register'}
                </button>
            </form>
        </div>
    );
}
