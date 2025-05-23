import React, { useState, useEffect } from 'react';
import { RefreshCw, Users, Building } from 'lucide-react';
import { useMenu } from '../../context/MenuContext';
import { UsersList } from '../../components/users/UsersList';
import { getAllUsers } from '../../api/user.api';
import { useAuth } from '../../../hooks/useAuth';
import { usePermissions } from '../../../hooks/usePermissions';

export function GestorUsuaris() {
  const { menuOpen } = useMenu();
  const { user } = useAuth();
  const { isSuperAdmin } = usePermissions();
  const [users, setUsers] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [selectedEmpresa, setSelectedEmpresa] = useState('all');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const usersRes = await getAllUsers();
        setUsers(usersRes.data);
        
        // Si es superadmin, obtener lista de empresas únicas
        if (isSuperAdmin) {
          const uniqueEmpresas = usersRes.data
            .filter(user => user.empresa)
            .reduce((acc, user) => {
              if (!acc.find(emp => emp.id === user.empresa.id)) {
                acc.push(user.empresa);
              }
              return acc;
            }, []);
          setEmpresas(uniqueEmpresas);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error cargando datos:", error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [isSuperAdmin]);

  // Filtrar usuarios por empresa seleccionada
  const filteredUsers = selectedEmpresa === 'all' 
    ? users 
    : users.filter(user => user.empresa?.id === parseInt(selectedEmpresa));
  
  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col items-center">
        <RefreshCw className="animate-spin h-12 w-12 text-blue-500" />
        <p className="mt-4 text-lg text-gray-800">Carregant dades...</p>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen px-4 sm:px-6 md:px-8 py-6">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado más simple y limpio, sin tarjeta */}
        <div className="pb-5 border-b border-gray-200 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-blue-100 p-2 rounded-full mr-3">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Gestió d'Usuaris</h1>
                <p className="text-gray-500 text-sm">Administració i control d'usuaris del sistema</p>
              </div>
            </div>
            
            {/* Selector de empresas para superadmin */}
            {isSuperAdmin && empresas.length > 0 && (
              <div className="flex items-center space-x-2">
                <Building className="h-4 w-4 text-gray-500" />
                <select
                  value={selectedEmpresa}
                  onChange={(e) => setSelectedEmpresa(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Totes les empreses</option>
                  {empresas.map(empresa => (
                    <option key={empresa.id} value={empresa.id}>
                      {empresa.nom}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
        
        <UsersList initialUsers={filteredUsers} />
      </div>
    </div>
  );
}