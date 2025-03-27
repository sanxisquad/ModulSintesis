import { useForm } from 'react-hook-form';
import { useEffect, useState } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { createUser, deleteUser, updateUser, getUser } from '../api/user.api';
import { getAllRoles } from '../api/role.api';
import { registerUser } from '../api/auth.api';
import { toast } from 'react-hot-toast';
import { usePermissions } from '../../hooks/usePermissions';

export function UserFormPage() {
    const { register, handleSubmit, formState: { errors }, setValue, getValues, watch } = useForm();
    const { isAdmin, canDelete } = usePermissions(); // Asegúrate de que tu hook usePermissions devuelva canDelete
    const navigate = useNavigate();
    const params = useParams();
    const [roles, setRoles] = useState([]);

    const onSubmit = handleSubmit(async data => {
        if (params.id) {
            await updateUser(params.id, data);
            toast.success('User updated');
        } else {
            await registerUser(data);
            toast.success('User created');
        }
        navigate('/users');
    });

    useEffect(() => {
        async function loadUser() {
            if (params.id) {
                const res = await getUser(params.id);
                setValue('username', res.data.username);
                setValue('email', res.data.email);
                setValue('first_name', res.data.first_name);
                setValue('last_name', res.data.last_name);
                setValue('location', res.data.location);
                setValue('role', res.data.role.id);
            }
        }
        loadUser();
    }, [params.id, setValue]);

    useEffect(() => {
        async function loadRoles() {
            const res = await getAllRoles();
            setRoles(res.data);
        }
        loadRoles();
    }, []);

    const handleDelete = async () => {
        const accepted = window.confirm('Are you sure?');
        if (accepted) {
            await deleteUser(params.id);
            navigate('/users');
        }
    };

    // Componente para mostrar campos en modo lectura
    const DisplayField = ({ label, value }) => (
        <div className="mb-4">
            <label className="block text-gray-400 mb-1">{label}</label>
            <div className="bg-zinc-700 p-3 rounded-lg">{value || '-'}</div>
        </div>
    );

    return (
        <div className="max-w-xl mx-auto">
            {!canDelete ? (
                // Modo solo lectura
                <div className="space-y-4">
                    <DisplayField label="Username" value={watch('username')} />
                    <DisplayField label="Email" value={watch('email')} />
                    <DisplayField label="First Name" value={watch('first_name')} />
                    <DisplayField label="Last Name" value={watch('last_name')} />
                    <DisplayField label="Location" value={watch('location')} />
                    <DisplayField 
                        label="Role" 
                        value={roles.find(role => role.id === Number(watch('role')))?.name || '-'} 
                    />
                </div>
            ) : (
                // Modo edición
                <form onSubmit={onSubmit}>
                    <input 
                        type="text" 
                        placeholder="Username"
                        {...register('username', { required: true })}
                        className="bg-zinc-700 p-3 rounded-lg block w-full mb-3"
                        disabled={!canDelete}
                    />
                    {errors.username && <span className="text-red-500">Nom d'usuari requerit</span>}
                    <br />
                    
                    <input 
                        type="email" 
                        placeholder="Email"
                        {...register('email', { required: true })}
                        className="bg-zinc-700 p-3 rounded-lg block w-full mb-3"
                        disabled={!canDelete}
                    />
                    {errors.email && <span className="text-red-500">Correu requerit</span>}
                    <br />
                    
                    <input 
                        type="text" 
                        placeholder="First Name"
                        {...register('first_name', { required: true })}
                        className="bg-zinc-700 p-3 rounded-lg block w-full mb-3"
                        disabled={!canDelete}
                    />
                    {errors.first_name && <span className="text-red-500">Nom requerit</span>}
                    <br />
                    
                    <input 
                        type="text" 
                        placeholder="Last Name"
                        {...register('last_name', { required: true })}
                        className="bg-zinc-700 p-3 rounded-lg block w-full mb-3"
                        disabled={!canDelete}
                    />
                    {errors.last_name && <span className="text-red-500">Cognom requerit</span>}
                    <br />
                    
                    <input 
                        type="text" 
                        placeholder="Location"
                        {...register('location', { required: true })}
                        className="bg-zinc-700 p-3 rounded-lg block w-full mb-3"
                        disabled={!canDelete}
                    />
                    {errors.location && <span className="text-red-500">Localitzacio requerida</span>}
                    <br />

                    <select
                        {...register('role', { required: true })}
                        className="bg-zinc-700 p-3 rounded-lg block w-full mb-3"
                        value={roles ? roles.find(role => role.id === Number(getValues('role')))?.id : ''}
                        disabled={!canDelete}
                    >
                        <option value="">Select Role</option>
                        {roles.map(role => (
                            <option key={role.id} value={role.id}>{role.name}</option>
                        ))}
                    </select>
                    {errors.role && <span className="text-red-500">Rol requerit</span>}

                    {canDelete && (
                        <button
                            className="bg-indigo-500 px-3 rounded-lg block w-full mt-3"
                            type="submit"
                        >
                            {params.id ? 'Update' : 'Create'} User
                        </button>
                    )}
                </form>
            )}

            {canDelete && params.id && isAdmin && (
                <button
                    className="bg-red-500 p-3 rounded-lg w-48 mt-3"
                    onClick={handleDelete}
                >
                    Eliminar Usuari
                </button>
            )}
        </div>
    );
}