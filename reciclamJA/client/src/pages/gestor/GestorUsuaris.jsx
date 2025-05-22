import React, { useState, useEffect } from 'react';
import { RefreshCw, Users } from 'lucide-react';
import { useMenu } from '../../context/MenuContext';
import { UsersList } from '../../components/users/UsersList';
import { getAllUsers } from '../../api/user.api';

export function GestorUsuaris() {
  const { menuOpen } = useMenu();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const usersRes = await getAllUsers();
        setUsers(usersRes.data);
        setLoading(false);
      } catch (error) {
        console.error("Error cargando datos:", error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
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
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-full mr-3">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Gestió d'Usuaris</h1>
              <p className="text-gray-500 text-sm">Administració i control d'usuaris del sistema</p>
            </div>
          </div>
        </div>
        
        <UsersList initialUsers={users} />
      </div>
    </div>
  );
}