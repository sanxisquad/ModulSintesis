import { ContenedorCard } from './ContenedorCard.jsx';
import { Search } from 'lucide-react';

export function ContenedorList({ filters, contenedores, zonas }) {
    // Only show loading spinner when contenedores is null/undefined (still loading)
    // Not when it's an empty array (means data loaded but no results)
    if (contenedores === null || contenedores === undefined) {
        return (
            <div className="flex items-center justify-center h-60">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // Use the filtered contenedores that are already filtered in the parent component
    const contenedorsFiltrados = contenedores.filter(contenedor => {
        if (!contenedor) return false;
        
        // Filtro por ciudad
        if (filters?.ciutat && contenedor.ciutat !== filters.ciutat) return false;
        
        // Filtro por zona
        if (filters?.zona && contenedor.zona !== Number(filters.zona)) return false;
        
        // Filtro por estado
        if (filters?.estat && contenedor.estat !== filters.estat) return false;
        
        // Filtro por tipo
        if (filters?.tipus && contenedor.tipus !== filters.tipus) return false;
        
        // Filtro por código (búsqueda parcial)
        if (filters?.codi && !contenedor.cod?.toLowerCase().includes(filters.codi.toLowerCase())) {
            return false;
        }
        
        return true;
    });

    return (
        <div>
            {/* Contador de resultados */}
            <div className="mb-4 text-sm text-gray-600">
                Mostrant {contenedorsFiltrados.length} de {contenedores.length} contenedors
            </div>

            {/* Lista de contenedores */}
            {contenedorsFiltrados.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {contenedorsFiltrados.map((contenedor) => (
                        <ContenedorCard key={contenedor.id} contenedor={contenedor} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                    <Search className="h-12 w-12 text-gray-300 mb-4" />
                    <p className="text-lg font-medium text-gray-700">No s'han trobat contenidors</p>
                    <p className="text-sm text-gray-500 mt-2">Prova de canviar els filtres de cerca</p>
                </div>
            )}
        </div>
    );
}