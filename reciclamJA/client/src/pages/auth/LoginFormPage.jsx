import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '../../../hooks/usePermissions'; // Importa el hook de permisos

export function LoginFormPage() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const { login, user } = useAuth(); // Asegúrate de obtener el user del contexto
    const navigate = useNavigate();
    const { isSuperAdmin, isAdmin, isGestor, isUser } = usePermissions(); // Usa el hook de permisos

    const onSubmit = async (data) => {
        setLoading(true);
        try {
          // Espera a que login devuelva el usuario completo
          const loggedInUser = await login({
            username: data.username,
            password: data.password,
            rememberMe: rememberMe,
          });
    
          toast.success("¡Bienvenido!");
          
          // Redirige basado en el usuario recibido (no del contexto)
          if (loggedInUser?.is_superadmin || loggedInUser?.is_admin || loggedInUser?.is_gestor) {
            navigate('/gestor-dashboard');
          } else {
            navigate('/');
          }
        } catch (error) {
          toast.error(error.response?.data?.message || "Credenciales incorrectas");
        } finally {
          setLoading(false);
        }
      };

    return (
        <div className="max-w-md mx-auto mt-10">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <input
                    type="text"
                    placeholder="Username"
                    {...register('username', { required: 'Username is required' })}
                    className="w-full p-3 bg-gray-700 text-white rounded-md"
                    disabled={loading}
                />
                {errors.username && <p className="text-red-500">{errors.username.message}</p>}

                <input
                    type="password"
                    placeholder="Password"
                    {...register('password', { required: 'Password is required' })}
                    className="w-full p-3 bg-gray-700 text-white rounded-md"
                    disabled={loading}
                />
                {errors.password && <p className="text-red-500">{errors.password.message}</p>}

                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="rememberMe"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="mr-2"
                    />
                    <label htmlFor="rememberMe" className="text-white">Mantener sesión iniciada</label>
                </div>

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