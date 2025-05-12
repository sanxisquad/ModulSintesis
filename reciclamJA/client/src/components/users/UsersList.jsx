import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllUsers } from '../../api/user.api.js';
import { UserCard } from './UserCard.jsx';
import { usePermissions } from '../../../hooks/usePermissions';
import { FilterPanel } from '../common/FilterPanel.jsx';
import { Users, Search, PlusCircle, SlidersHorizontal } from 'lucide-react';

export function UsersList({ initialUsers = [] }) {
    const [users, setUsers] = useState(initialUsers);
    const { isAdmin } = usePermissions();
    const [filters, setFilters] = useState({
        nom: '',
        usuari: '',
        role: ''
    });
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        if (initialUsers.length === 0) {
            async function loadUsers() {
                const res = await getAllUsers();
                setUsers(res.data);
            }
            loadUsers();
        }
    }, [initialUsers]);

    // Obtener roles únicos
    const uniqueRoles = [...new Set(users.flatMap(user => user.role?.name ? [user.role.name] : []))];

    // Filtrar usuarios basado en los filtros
    const filteredUsers = users.filter(user => {
        // Filtro por nombre
        if (filters.nom && !user.nom?.toLowerCase().includes(filters.nom.toLowerCase()) && 
            !`${user.first_name} ${user.last_name}`.toLowerCase().includes(filters.nom.toLowerCase())) {
            return false;
        }
        
        // Filtro por rol
        if (filters.role && user.role?.name !== filters.role) {
            return false;
        }
        
        return true;
    });

    return (
        <div>
            {/* Stats Panel - Estilo más simple */}
            <div className="bg-white mb-6 p-5 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-sm font-medium text-gray-500">Usuaris Totals</div>
                        <div className="mt-1 flex items-baseline">
                            <div className="text-3xl font-semibold text-gray-900">{users.length}</div>
                            <div className="ml-2 text-sm font-medium text-gray-500">
                                ({filteredUsers.length} filtrats)
                            </div>
                        </div>
                    </div>
                    <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-blue-600" />
                    </div>
                </div>
            </div>
            
            {/* Barra de búsqueda y acciones - Estilo más limpio */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                {/* Botón de filtro - Izquierda */}
                <div className="flex items-center">
                    <button 
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <SlidersHorizontal className="h-4 w-4 mr-2" />
                        <span>Filtres</span>
                    </button>
                </div>
                
                {/* Add User Button - Derecha */}
                <div>
                    {isAdmin && (
                        <Link
                            to="/users-create"
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
                        >
                            <PlusCircle className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Afegir Usuari</span>
                            <span className="sm:hidden">Afegir</span>
                        </Link>
                    )}
                </div>
            </div>
            
            {/* Panel de filtros unificado (no duplicado) */}
            {showFilters && (
                <div className="mb-6">
                    <FilterPanel
                        filters={filters}
                        setFilters={setFilters}
                        roleOptions={uniqueRoles}
                        mode="usuaris"
                    />
                </div>
            )}

            {/* Users Grid - Mismo estilo pero espaciado optimizado */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                        <UserCard key={user.id} user={user} />
                    ))
                ) : (
                    <div className="col-span-full bg-white py-8 px-4 rounded-md border border-gray-200 text-center">
                        <Search className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-lg font-medium text-gray-700">No s'han trobat usuaris</p>
                        <p className="text-sm text-gray-500">Prova de canviar els filtres de cerca</p>
                    </div>
                )}
            </div>
        </div>
    );
}