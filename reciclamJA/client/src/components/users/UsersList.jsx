import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllUsers } from '../../api/user.api.js';
import { UserCard } from './UserCard.jsx';
import { usePermissions } from '../../../hooks/usePermissions';

export function UsersList() {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [selectedRole, setSelectedRole] = useState('Tots els rols');
    const { isAdmin } = usePermissions();

    useEffect(() => {
        async function loadUsers() {
            const res = await getAllUsers();
            setUsers(res.data);
            setFilteredUsers(res.data); // Inicialmente mostrar todos
        }
        loadUsers();
    }, []);

    useEffect(() => {
        if (selectedRole === 'Tots els rols') {
            setFilteredUsers(users);
        } else {
            const filtered = users.filter(user => 
                user.role?.name?.toLowerCase() === selectedRole.toLowerCase()
            );
            setFilteredUsers(filtered);
        }
    }, [selectedRole, users]);

    const uniqueRoles = ['Tots els rols', ...new Set(users.map(user => user.role?.name).filter(Boolean))];

    return (
        <div className="container mx-auto">
            <h1 className="text-3xl font-bold text-center m-10">Usuaris</h1>
            <div className="flex ml-10 mb-5 items-center">
                    <select
                    id="roleFilter"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                     className="border p-2 rounded"
                >
                    {uniqueRoles.map(role => (
                        <option className="text-black" key={role} value={role}>
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                        </option>
                    ))}
                </select>

                {isAdmin && (
                    <Link
                        to="/users-create"  // Corregí la ruta que estaba como "/contenedors-create"
                        className="ml-auto mr-10 bg-green-500 text-white p-2 rounded hover:bg-green-600 cursor-pointer"
                    >
                        Afegir Usuari
                    </Link>
                )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 m-10">
                {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                        <UserCard key={user.id} user={user} />
                    ))
                ) : (
                    <div className="col-span-full text-center text-gray-500 py-10">
                        No s'han trobat usuaris amb aquest rol
                    </div>
                )}
            </div>
        </div>
    );
}