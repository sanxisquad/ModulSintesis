import { useForm } from 'react-hook-form';
import { useEffect, useState } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { createUser, deleteUser, updateUser, getUser } from '../../api/user.api';
import { getAllRoles } from '../../api/role.api';
import { registerUser } from '../../api/auth.api';
import { toast } from 'react-hot-toast';
import { usePermissions } from '../../../hooks/usePermissions';
import { ArrowLeft, User, Mail, MapPin, Shield, Save, Trash2, UserPlus } from 'lucide-react';

export function UserFormPage() {
    const { register, handleSubmit, formState: { errors }, setValue, getValues, watch } = useForm();
    const { isAdmin, isSuperAdmin, canDelete, canEditUsers } = usePermissions();
    const navigate = useNavigate();
    const params = useParams();
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);

    const onSubmit = handleSubmit(async data => {
        try {
            if (params.id) {
                await updateUser(params.id, data);
                toast.success('Usuari actualitzat correctament');
            } else {
                await registerUser(data);
                toast.success('Usuari creat correctament');
            }
            navigate('/gestor-usuaris');
        } catch (error) {
            toast.error('Hi ha hagut un error. Intenta-ho de nou.');
            console.error(error);
        }
    });

    useEffect(() => {
        async function loadUser() {
            try {
                setLoading(true);
                if (params.id) {
                    const res = await getUser(params.id);
                    setValue('username', res.data.username);
                    setValue('email', res.data.email);
                    setValue('first_name', res.data.first_name);
                    setValue('last_name', res.data.last_name);
                    setValue('location', res.data.location);
                    setValue('role', res.data.role?.id);
                }
                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
                toast.error('Error carregant dades d\'usuari');
            }
        }
        loadUser();
    }, [params.id, setValue]);

    useEffect(() => {
        async function loadRoles() {
            try {
                const res = await getAllRoles();
                setRoles(res.data);
            } catch (error) {
                console.error(error);
                toast.error('Error carregant els rols');
            }
        }
        loadRoles();
    }, []);

    const handleDelete = async () => {
        try {
            const accepted = window.confirm('Estàs segur que vols eliminar aquest usuari?');
            if (accepted) {
                await deleteUser(params.id);
                toast.success('Usuari eliminat correctament');
                navigate('/gestor-usuaris');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error eliminant usuari');
        }
    };

    // Componente per mostrar camps en mode lectura
    const DisplayField = ({ label, value, icon }) => (
        <div className="mb-5">
            <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
            <div className="flex items-center border border-gray-300 rounded-lg bg-gray-50 px-4 py-3">
                {icon && <span className="text-gray-400 mr-3">{icon}</span>}
                <span className="text-gray-800 font-medium">{value || '-'}</span>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-12 bg-gray-200 rounded"></div>
                    <div className="h-12 bg-gray-200 rounded"></div>
                    <div className="h-12 bg-gray-200 rounded"></div>
                    <div className="h-12 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
            {/* Header section */}
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        {params.id ? 'Editar Usuari' : 'Crear Nou Usuari'}
                    </h1>
                    <p className="text-gray-500 text-sm">
                        {params.id 
                            ? 'Actualitza la informació de l\'usuari existent' 
                            : 'Completa el formulari per crear un nou usuari'}
                    </p>
                </div>
                <button 
                    onClick={() => navigate('/gestor-usuaris')}
                    className="flex items-center text-gray-600 hover:text-gray-800"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    <span>Tornar</span>
                </button>
            </div>

            {!canEditUsers ? (
                // Modo solo lectura - diseño mejorado
                <div className="space-y-4 bg-gray-50 p-5 rounded-lg border border-gray-100">
                    <DisplayField 
                        label="Nom d'usuari" 
                        value={watch('username')} 
                        icon={<User className="w-5 h-5" />} 
                    />
                    <DisplayField 
                        label="Correu electrònic" 
                        value={watch('email')} 
                        icon={<Mail className="w-5 h-5" />} 
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <DisplayField 
                            label="Nom" 
                            value={watch('first_name')} 
                        />
                        <DisplayField 
                            label="Cognom" 
                            value={watch('last_name')} 
                        />
                    </div>
                    <DisplayField 
                        label="Localització" 
                        value={watch('location')} 
                        icon={<MapPin className="w-5 h-5" />} 
                    />
                    <DisplayField 
                        label="Rol" 
                        value={roles.find(role => role.id === Number(watch('role')))?.name || '-'} 
                        icon={<Shield className="w-5 h-5" />} 
                    />
                </div>
            ) : (
                // Modo edición - diseño mejorado
                <form onSubmit={onSubmit} className="space-y-5">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nom d'usuari
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-gray-400" />
                            </div>
                            <input 
                                type="text" 
                                placeholder="Introdueix nom d'usuari"
                                {...register('username', { required: "Nom d'usuari requerit" })}
                                className={`pl-10 w-full rounded-lg border ${errors.username ? 'border-red-500' : 'border-gray-300'} px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            />
                        </div>
                        {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>}
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Correu electrònic
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                            <input 
                                type="email" 
                                placeholder="Introdueix correu electrònic"
                                {...register('email', { 
                                    required: "Correu electrònic requerit",
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "Correu electrònic no vàlid"
                                    }
                                })}
                                className={`pl-10 w-full rounded-lg border ${errors.email ? 'border-red-500' : 'border-gray-300'} px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            />
                        </div>
                        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nom
                            </label>
                            <input 
                                type="text" 
                                placeholder="Introdueix nom"
                                {...register('first_name', { required: "Nom requerit" })}
                                className={`w-full rounded-lg border ${errors.first_name ? 'border-red-500' : 'border-gray-300'} px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            />
                            {errors.first_name && <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>}
                        </div>
                        
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Cognom
                            </label>
                            <input 
                                type="text" 
                                placeholder="Introdueix cognom"
                                {...register('last_name', { required: "Cognom requerit" })}
                                className={`w-full rounded-lg border ${errors.last_name ? 'border-red-500' : 'border-gray-300'} px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            />
                            {errors.last_name && <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>}
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Localització
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MapPin className="h-5 w-5 text-gray-400" />
                            </div>
                            <input 
                                type="text" 
                                placeholder="Introdueix localització"
                                {...register('location', { required: "Localització requerida" })}
                                className={`pl-10 w-full rounded-lg border ${errors.location ? 'border-red-500' : 'border-gray-300'} px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            />
                        </div>
                        {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>}
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Rol
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Shield className="h-5 w-5 text-gray-400" />
                            </div>
                            <select
                                {...register('role', { required: "Rol requerit" })}
                                className={`pl-10 w-full rounded-lg border ${errors.role ? 'border-red-500' : 'border-gray-300'} px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white`}
                            >
                                <option value="">Selecciona un rol</option>
                                {roles.map(role => (
                                    <option key={role.id} value={role.id}>{role.name}</option>
                                ))}
                            </select>
                        </div>
                        {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>}
                    </div>

                    <div className="flex justify-between mt-8">
                        {params.id && (isAdmin || isSuperAdmin) && (
                            <button
                                type="button"
                                className="flex items-center px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                onClick={handleDelete}
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Eliminar Usuari
                            </button>
                        )}

                        <button
                            className="ml-auto flex items-center px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            type="submit"
                        >
                            {params.id ? (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Actualitzar
                                </>
                            ) : (
                                <>
                                    <UserPlus className="w-4 h-4 mr-2" />
                                    Crear Usuari
                                </>
                            )}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}