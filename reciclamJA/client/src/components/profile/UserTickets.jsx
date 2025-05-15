import { useState, useEffect } from 'react';
import { getReportes, getReporte, getComentarios, addComentario, deleteComentario } from '../../api/zr.api';
import { FaTicketAlt, FaCheck, FaTimes, FaClock, FaSpinner, FaExclamationTriangle, FaImage, FaUser, FaPaperPlane } from 'react-icons/fa';
import { useAuth } from '../../../hooks/useAuth';

export const UserTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');
    // Modal states
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [comments, setComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [commentImage, setCommentImage] = useState(null);
    const [sendingComment, setSendingComment] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const { user } = useAuth();

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
                    icon: <FaSpinner className="mr-1" />, // Removed animate-spin class
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

    const openTicketModal = async (ticketId) => {
        try {
            const response = await getReporte(ticketId);
            setSelectedTicket(response.data);
            setShowModal(true);
            fetchComments(ticketId);
        } catch (err) {
            console.error("Error fetching ticket details:", err);
        }
    };

    const fetchComments = async (ticketId) => {
        try {
            setLoadingComments(true);
            const response = await getComentarios(ticketId);
            setComments(response.data);
            setLoadingComments(false);
        } catch (err) {
            console.error("Error fetching comments:", err);
            setLoadingComments(false);
            setComments([]);
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        
        if (!newComment.trim()) return;
        
        try {
            setSendingComment(true);
            
            // Only send text for now until imagen field is added to database
            await addComentario(selectedTicket.id, { texto: newComment.trim() });
            
            // Clear form after submission
            setNewComment('');
            setCommentImage(null);
            setImagePreview(null);
            
            // Refresh comments
            fetchComments(selectedTicket.id);
            setSendingComment(false);
        } catch (err) {
            console.error("Error submitting comment:", err);
            setSendingComment(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCommentImage(file);
            
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setCommentImage(null);
        setImagePreview(null);
    };

    // Check if ticket is active and can receive comments
    const isTicketActive = (status) => {
        return status === 'abierto' || status === 'en_proceso';
    };

    // Render table row with click handler
    const renderTicketRow = (ticket) => {
        const statusBadge = getStatusBadge(ticket.estado);
        return (
            <tr 
                key={ticket.id} 
                className="hover:bg-gray-50 cursor-pointer" 
                onClick={() => openTicketModal(ticket.id)}
            >
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
        );
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
                            {filteredTickets.map(renderTicketRow)}
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

            {/* Ticket Details Modal */}
            {showModal && selectedTicket && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Modal Header */}
                        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-semibold text-gray-800">
                                Tiquet #{selectedTicket.id} - {getTipoTraduccion(selectedTicket.tipo)}
                            </h3>
                            <div className="flex items-center space-x-2">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(selectedTicket.estado).bg} ${getStatusBadge(selectedTicket.estado).text}`}>
                                    {getStatusBadge(selectedTicket.estado).icon}
                                    {getStatusBadge(selectedTicket.estado).label}
                                </span>
                                <button 
                                    onClick={() => setShowModal(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <FaTimes />
                                </button>
                            </div>
                        </div>
                        
                        {/* Modal Body - Scrollable */}
                        <div className="p-4 overflow-y-auto flex-1">
                            {/* Ticket Information */}
                            <div className="mb-6">
                                <h4 className="font-medium text-gray-700 mb-2">Descripció:</h4>
                                <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                                    {selectedTicket.descripcion}
                                </p>
                                
                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    <div>
                                        <span className="text-sm text-gray-500">Data:</span>
                                        <p>{formatDate(selectedTicket.fecha)}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-500">Ubicació:</span>
                                        <p>
                                            {selectedTicket.contenedor 
                                                ? `Contenidor #${selectedTicket.contenedor}` 
                                                : selectedTicket.zona 
                                                    ? `Zona #${selectedTicket.zona}` 
                                                    : 'No especificat'}
                                        </p>
                                    </div>
                                </div>
                                
                                {selectedTicket.imagen && (
                                    <div className="mt-4">
                                        <h4 className="font-medium text-gray-700 mb-2">Imatge:</h4>
                                        <img 
                                            src={selectedTicket.imagen} 
                                            alt="Imatge adjuntada" 
                                            className="max-h-60 rounded-lg" 
                                        />
                                    </div>
                                )}
                                
                                {/* Closing comment if ticket is resolved or rejected */}
                                {(selectedTicket.estado === 'resuelto' || selectedTicket.estado === 'rechazado') && 
                                 selectedTicket.comentario_cierre && (
                                    <div className="mt-6 p-3 border-l-4 border-blue-500 bg-blue-50 rounded-r-md">
                                        <h4 className="font-medium text-gray-700 mb-1">Comentari de tancament:</h4>
                                        <p className="text-gray-600">{selectedTicket.comentario_cierre}</p>
                                        {selectedTicket.resuelto_por && (
                                            <p className="text-sm text-gray-500 mt-1">
                                                Per: {selectedTicket.resuelto_por}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                            
                            {/* Comments Section */}
                            <div className="mt-6">
                                <h4 className="font-medium text-gray-700 mb-4 pb-2 border-b">
                                    Comentaris ({comments.length})
                                </h4>
                                
                                {loadingComments ? (
                                    <div className="flex justify-center py-4">
                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                                    </div>
                                ) : comments.length > 0 ? (
                                    <div className="space-y-4">
                                        {comments.map(comment => (
                                            <div key={comment.id} className="p-3 bg-gray-50 rounded-lg">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex items-center">
                                                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-2">
                                                            <FaUser className="h-4 w-4" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-800">
                                                                {comment.usuario_nombre || 'Usuari'}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {formatDate(comment.fecha)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Delete comment button (only for own comments) */}
                                                    {user && comment.usuario === user.id && (
                                                        <button 
                                                            className="text-gray-400 hover:text-red-500"
                                                            onClick={async (e) => {
                                                                e.stopPropagation();
                                                                if (confirm('Segur que vols eliminar aquest comentari?')) {
                                                                    try {
                                                                        await deleteComentario(selectedTicket.id, comment.id);
                                                                        fetchComments(selectedTicket.id);
                                                                    } catch (error) {
                                                                        console.error("Error eliminant el comentari:", error);
                                                                    }
                                                                }
                                                            }}
                                                        >
                                                            <FaTimes className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </div>
                                                
                                                <p className="mt-2 text-gray-600">{comment.texto}</p>
                                                
                                                {/* Display comment image if available */}
                                                {comment.imagen && (
                                                    <div className="mt-2">
                                                        <img 
                                                            src={comment.imagen} 
                                                            alt="Imatge del comentari" 
                                                            className="max-h-40 rounded-lg" 
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 text-gray-500">
                                        <p>No hi ha comentaris encara.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Comment Form - Only show if ticket is active */}
                        {isTicketActive(selectedTicket.estado) && (
                            <div className="p-4 border-t bg-gray-50">
                                <form onSubmit={handleCommentSubmit} className="space-y-3">
                                    <textarea
                                        placeholder="Escriu un comentari..."
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        rows="3"
                                        disabled={sendingComment}
                                    />
                                    
                                    {/* Image preview */}
                                    {imagePreview && (
                                        <div className="relative inline-block">
                                            <img 
                                                src={imagePreview} 
                                                alt="Preview" 
                                                className="h-20 w-20 object-cover rounded-lg" 
                                            />
                                            <button 
                                                type="button"
                                                onClick={removeImage}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                            >
                                                <FaTimes className="h-3 w-3" />
                                            </button>
                                        </div>
                                    )}
                                    
                                    <div className="flex justify-between items-center">
                                        <label className="cursor-pointer flex items-center text-sm text-gray-600 hover:text-gray-800">
                                            <FaImage className="mr-1" />
                                            <span>Afegir imatge</span>
                                            <input 
                                                type="file" 
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleImageChange}
                                                disabled={sendingComment}
                                            />
                                        </label>
                                        
                                        <button
                                            type="submit"
                                            className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-600 disabled:bg-blue-300"
                                            disabled={sendingComment || (!newComment.trim() && !commentImage)}
                                        >
                                            {sendingComment ? (
                                                <>
                                                    <FaSpinner className="mr-2 animate-spin" />
                                                    Enviant...
                                                </>
                                            ) : (
                                                <>
                                                    <FaPaperPlane className="mr-2" />
                                                    Enviar
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// Helper function to translate ticket types
function getTipoTraduccion(tipo) {
    switch(tipo) {
        case 'mal_estado': return 'Contenidor en mal estat';
        case 'lleno': return 'Contenidor ple';
        case 'vandalismo': return 'Vandalisme';
        case 'ubicacion': return 'Problema amb la ubicació';
        case 'olores': return 'Mals olors';
        case 'otro': return 'Altre problema';
        default: return tipo;
    }
}
