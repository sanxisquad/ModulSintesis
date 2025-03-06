import { useForm } from 'react-hook-form';
import { useEffect, useState } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { createUser, deleteUser, updateUser, getUser } from '../api/user.api';
import { getAllRoles } from '../api/role.api';
import { registerUser } from '../api/auth.api';  // Asegúrate de importar correctamente
import { toast } from 'react-hot-toast';

export function UserFormPage() {
    const { register, handleSubmit, formState: { errors }, setValue, getValues } = useForm();
    const navigate = useNavigate();
    const params = useParams();
    const [roles, setRoles] = useState([]);

    const onSubmit = handleSubmit(async data => {
        if (params.id) {
            await updateUser(params.id, data);
            toast.success('User updated');
        } else {
            await registerUser(data);  // Aquí usas registerUser para registrar un nuevo usuario
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
                setValue('role', res.data.role.id); // Establecer el ID del rol
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

    return (
        <div className="max-w-xl mx-auto">
            <form onSubmit={onSubmit}>
                <input type="text" placeholder="Username"
                    {...register('username', { required: true })}
                    className="bg-zinc-700 p-3 rounded-lg block w-full mb-3"
                />
                {errors.username && <span>Username is required</span>}
                <br />
                <input type="email" placeholder="Email"
                    {...register('email', { required: true })}
                    className="bg-zinc-700 p-3 rounded-lg block w-full mb-3"
                />
                {errors.email && <span>Email is required</span>}
                <br />
                <input type="text" placeholder="First Name"
                    {...register('first_name', { required: true })}
                    className="bg-zinc-700 p-3 rounded-lg block w-full mb-3"
                />
                {errors.first_name && <span>First Name is required</span>}
                <br />
                <input type="text" placeholder="Last Name"
                    {...register('last_name', { required: true })}
                    className="bg-zinc-700 p-3 rounded-lg block w-full mb-3"
                />
                {errors.last_name && <span>Last Name is required</span>}
                <br />
                <input type="text" placeholder="Location"
                    {...register('location', { required: true })}
                    className="bg-zinc-700 p-3 rounded-lg block w-full mb-3"
                />
                {errors.location && <span>Location is required</span>}
                <br />

                <select
                    {...register('role', { required: true })}
                    className="bg-zinc-700 p-3 rounded-lg block w-full mb-3"
                    value={roles ? roles.find(role => role.id === Number(getValues('role')))?.id : ''}
                >
                    <option value="">Select Role</option>
                    {roles.map(role => (
                        <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                </select>
                {errors.role && <span>Role is required</span>}

                <button
                    className="bg-indigo-500 px-3 rounded-lg block w-full mt-3"
                    type="submit"
                >Save</button>
            </form>

            {params.id && <button
                className="bg-red-500 p-3 rounded-lg w-48 mt-3"
                onClick={async () => {
                    const accepted = window.confirm('Are you sure?');
                    if (accepted) {
                        await deleteUser(params.id);
                        navigate('/users');
                    }
                }}
            >Delete User</button>}
        </div>
    );
}
