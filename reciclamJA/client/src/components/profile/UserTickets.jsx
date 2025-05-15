import { useState, useEffect } from 'react';
import { getReportes } from '../../api/zr.api';
import { FaTicketAlt, FaCheck, FaTimes, FaClock, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';

export const UserTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchUserTickets();
    }, []);

    const fetchUserTickets = async () => {
        try {
            setLoading(true);
            setError(null); // Reset error state before fetching
            
            const response = await getReportes();
            
            // Debug the response
            console.log("Tickets API response:", response);
            
            // Check if response.data exists and is an array
            if (Array.isArray(response.data)) {
                setTickets(response.data);
            } else {
                console.warn("Expected array of tickets but got:", response.data);
                setTickets([]);
            }
            
            setLoading(false);
        } catch (err) {
            console.error("Error fetching user tickets:", err);
            setError("No s'han pogut carregar els tiquets");
            setLoading(false);
            setTickets([]); // Ensure tickets is an array even on error
        }
    };

    const filteredTickets = filter === 'all' 
        ? tickets 
        : tickets.filter(ticket => ticket.estado === filter);

    // Helper to get status badge style
    const getStatusBadge = (status) => {
        switch(status) {
            case 'abierto':
                return {
                    bg: 'bg-blue-100',
                    text: 'text-blue-800',
                    icon: <FaTicketAlt className="mr-1" />,
                    label: 'Obert'
                };
            case 'en_proceso':
                return {
                    bg: 'bg-yellow-100',
                    text: 'text-yellow-800',
                    icon: <FaSpinner className="mr-1 animate-spin" />,
                    label: 'En Procés'
                };
            case 'resuelto':
                return {
                    bg: 'bg-green-100',
                    text: 'text-green-800',
                    icon: <FaCheck className="mr-1" />,
                    label: 'Resolt'
                };
            case 'rechazado':
                return {
                    bg: 'bg-red-100',
                    text: 'text-red-800',
                    icon: <FaTimes className="mr-1" />,
                    label: 'Rebutjat'
                };
            default:
                return {
                    bg: 'bg-gray-100',
                    text: 'text-gray-800',
                    icon: <FaClock className="mr-1" />,
                    label: status || 'Desconocido'
                };
        }
    };

    // Format date to local format
    const formatDate = (dateString) => {
        if (!dateString) return '';
        
        try {
            const date = new Date(dateString);
            return date.toLocaleString('ca-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            console.error("Error formatting date:", e);
            return dateString;
        }
    };

    // Separate error display from the main render logic
    if (error) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center">
                    <FaTicketAlt className="mr-2 text-green-500" />
                    Els meus Tiquets
                </h2>
                <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-red-700 flex items-center">
                    <FaExclamationTriangle className="mr-2" />
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center">
                <FaTicketAlt className="mr-2 text-green-500" />
                Els meus Tiquets
            </h2>
            
            {/* Filter Buttons - Only show if there are tickets */}
            {tickets.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                    <button 
                        onClick={() => setFilter('all')}
                        className={`px-3 py-1 rounded-full text-sm font-medium 
                            ${filter === 'all' 
                                ? 'bg-green-500 text-white' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                        Tots
                    </button>
                    <button 
                        onClick={() => setFilter('abierto')}
                        className={`px-3 py-1 rounded-full text-sm font-medium flex items-center
                            ${filter === 'abierto' 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}
                    >
                        <FaTicketAlt className="mr-1" /> Oberts
                    </button>
                    <button 
                        onClick={() => setFilter('en_proceso')}
                        className={`px-3 py-1 rounded-full text-sm font-medium flex items-center
                            ${filter === 'en_proceso' 
                                ? 'bg-yellow-500 text-white' 
                                : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'}`}
                    >
                        <FaSpinner className="mr-1" /> En procés
                    </button>
                    <button 
                        onClick={() => setFilter('resuelto')}
                        className={`px-3 py-1 rounded-full text-sm font-medium flex items-center
                            ${filter === 'resuelto' 
                                ? 'bg-green-500 text-white' 
                                : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
                    >
                        <FaCheck className="mr-1" /> Resolts
                    </button>
                    <button 
                        onClick={() => setFilter('rechazado')}
                        className={`px-3 py-1 rounded-full text-sm font-medium flex items-center
                            ${filter === 'rechazado' 
                                ? 'bg-red-500 text-white' 
                                : 'bg-red-50 text-red-700 hover:bg-red-100'}`}
                    >
                        <FaTimes className="mr-1" /> Rebutjats
                    </button>
                </div>
            )}
            
            {loading ? (
                <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500"></div>
                </div>
            ) : tickets.length > 0 && filteredTickets.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ID
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tipus
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Descripció
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Data
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Estat
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredTickets.map((ticket) => {
                                const statusBadge = getStatusBadge(ticket.estado);
                                return (
                                    <tr key={ticket.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            #{ticket.id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {ticket.tipo === 'contenedor_lleno' ? 'Contenidor ple' : 
                                             ticket.tipo === 'contenedor_roto' ? 'Contenidor trencat' : 
                                             ticket.tipo === 'contenedor_sucio' ? 'Contenidor brut' : 
                                             ticket.tipo}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                            {ticket.descripcion}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(ticket.fecha_creacion)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                                                {statusBadge.icon}
                                                {statusBadge.label}
                                            </span>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-10 text-gray-500 flex flex-col items-center">
                    <FaTicketAlt className="h-16 w-16 text-gray-300 mb-4" />
                    <p className="text-lg font-medium mb-2">No tens tiquets oberts</p>
                    <p>Quan reportis incidències, els teus tiquets apareixeran aquí</p>
                </div>
            )}
        </div>
    );
};
