import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllUsers } from '../../api/user.api.js';
import { UserCard } from './UserCard.jsx';
import { usePermissions } from '../../../hooks/usePermissions';
import { FilterPanel } from '../common/FilterPanel.jsx';

export function UsersList() {
    const [users, setUsers] = useState([]);
    const { isAdmin } = usePermissions();
    const [filters, setFilters] = useState({
        nom: '',
        role: ''
    });

    useEffect(() => {
        async function loadUsers() {
            const res = await getAllUsers();
            setUsers(res.data);
        }
        loadUsers();
    }, []);

    // Obtener roles únicos
    const uniqueRoles = ['Tots els rols', ...new Set(users.flatMap(user => user.role?.name ? [user.role.name] : []))];

    // Filtrar usuarios basado en los filtros
    const filteredUsers = users.filter(user => {
        // Filtro por nombre
        if (filters.nom && !user.nom?.toLowerCase().includes(filters.nom.toLowerCase())) {
            return false;
        }
        
        // Filtro por rol
        if (filters.role && user.role?.name !== filters.role) {
            return false;
        }
        
        return true;
    });

    return (
        <div className="container mx-auto">
            <h1 className="text-3xl font-bold text-center m-10">Usuaris</h1>
            <div className="ml-10 mb-2 text-sm text-gray-600">
                Mostrant {filteredUsers.length} de {users.length} usuaris
            </div>            
            
            {/* Usamos el FilterPanel con las opciones de rol */}
            <FilterPanel
                filters={filters}
                setFilters={setFilters}
                roleOptions={uniqueRoles.filter(role => role !== 'Tots els rols')}
                mode="usuaris"
            />

            <div className="flex ml-10 mb-5">
                {isAdmin && (
                    <Link
                        to="/users-create"
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
                        No s'han trobat usuaris amb els filtres seleccionats
                    </div>
                )}
            </div>
        </div>
    );
}