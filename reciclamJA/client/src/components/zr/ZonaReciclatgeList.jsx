import { ZonesReciclatgeCard } from './ZonaReciclatgeCard.jsx';
import { Search } from 'lucide-react';

export function ZonaReciclatgeList({ filters, zonas }) {
    // Usamos las zonas proporcionadas por el componente padre
    // No necesitamos cargar datos aquí ni mantener un estado local
    
    if (!zonas || zonas.length === 0) {
        return (
            <div className="flex items-center justify-center h-60">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // Usamos las zonas ya filtradas que vienen del componente padre
    const zonesFiltrades = zonas;

    return (
        <div>
            {/* Contador de resultados */}
            <div className="mb-4 text-sm text-gray-600">
                Mostrant {zonesFiltrades.length} zones de reciclatge
            </div>

            {/* Lista de zones */}
            {zonesFiltrades.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {zonesFiltrades.map((zone) => (
                        <ZonesReciclatgeCard key={zone.id} zones={zone} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                    <Search className="h-12 w-12 text-gray-300 mb-4" />
                    <p className="text-lg font-medium text-gray-700">No s'han trobat zones</p>
                    <p className="text-sm text-gray-500 mt-2">Prova de canviar els filtres de cerca</p>
                </div>
            )}
        </div>
    );
}