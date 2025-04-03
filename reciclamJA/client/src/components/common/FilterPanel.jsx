import React, { useState } from 'react';
import { FiFilter, FiChevronDown, FiChevronUp } from 'react-icons/fi';

export const FilterPanel = ({ 
  filters, 
  setFilters,
  ciudades,
  zonas,
  estatOptions = [],
  tipusOptions = [],
  mode = 'contenedors'
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isMobile = window.innerWidth < 768; // Detectamos si es móvil

  const handleClearFilters = () => {
    const baseFilters = {
      ciutat: '',
      zona: '',
      estat: '',
      tipus: '',
      codi: '',
      showContenedores: true,
      showZones: true
    };
    setFilters(baseFilters);
  };

  // Configuración específica por modo
  const config = {
    contenedors: {
      showZonaFilter: true,
      showEstatFilter: true,
      showTipusFilter: true,
      showCodiFilter: true,
      showToggles: false
    },
    zones: {
      showZonaFilter: false,
      showEstatFilter: false,
      showTipusFilter: false,
      showCodiFilter: true,
      showToggles: false
    },
    mapa: {
      showZonaFilter: true,
      showEstatFilter: true,
      showTipusFilter: true,
      showCodiFilter: true,
      showToggles: true
    }
  };

  const currentConfig = config[mode] || config.contenedors;

  return (
    <div className="bg-black p-4 mb-4 rounded shadow">
      {/* Botón de toggle para móvil */}
      {isMobile && (
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full p-2 mb-2 text-white bg-gray-800 rounded"
        >
          <div className="flex items-center">
            <FiFilter className="mr-2" />
            Filtres
          </div>
          {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
        </button>
      )}

      {/* Contenedor de filtros (oculto en móvil si no está expandido) */}
      <div className={`${isMobile && !isExpanded ? 'hidden' : 'block'}`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Filtro por ciudad */}
          <div>
            <label className="block mb-2 font-medium text-white">Ciutat</label>
            <select
              value={filters.ciutat}
              onChange={(e) => setFilters({...filters, ciutat: e.target.value})}
              className="w-full p-2 border rounded bg-gray-800 text-white"
            >
              <option value="">Totes</option>
              {ciudades.map((ciudad, index) => (
                <option key={index} value={ciudad}>{ciudad}</option>
              ))}
            </select>
          </div>

          {/* Filtro por zona */}
          {currentConfig.showZonaFilter && (
            <div>
              <label className="block mb-2 font-medium text-white">
                {mode === 'zones' ? 'Zona' : 'Zona de reciclatge'}
              </label>
              <select
                value={filters.zona}
                onChange={(e) => setFilters({...filters, zona: e.target.value})}
                className="w-full p-2 border rounded bg-gray-800 text-white"
              >
                <option value="">Totes</option>
                {zonas.map(zona => (
                  <option key={zona.id} value={mode === 'zones' ? zona.nom : zona.id}>
                    {zona.nom}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Filtro por estado */}
          {currentConfig.showEstatFilter && (
            <div>
              <label className="block mb-2 font-medium text-white">Estat</label>
              <select
                value={filters.estat}
                onChange={(e) => setFilters({...filters, estat: e.target.value})}
                className="w-full p-2 border rounded bg-gray-800 text-white"
              >
                <option value="">Tots</option>
                {estatOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          )}

          {/* Filtro por tipo */}
          {currentConfig.showTipusFilter && (
            <div>
              <label className="block mb-2 font-medium text-white">Tipus</label>
              <select
                value={filters.tipus}
                onChange={(e) => setFilters({...filters, tipus: e.target.value})}
                className="w-full p-2 border rounded bg-gray-800 text-white"
              >
                <option value="">Tots</option>
                {tipusOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          )}

          {/* Filtro por código y botón limpiar */}
          <div className={`md:col-span-${
            currentConfig.showZonaFilter && 
            currentConfig.showEstatFilter && 
            currentConfig.showTipusFilter ? 2 : 1
          }`}>
            <label className="block mb-2 font-medium text-white">Cercar per codi</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Introdueix el codi"
                value={filters.codi}
                onChange={(e) => setFilters({...filters, codi: e.target.value})}
                className="flex-1 p-2 border rounded bg-gray-800 text-white"
              />
              <button
                onClick={handleClearFilters}
                className="bg-red-600 hover:bg-red-700 text-white p-2 rounded transition-colors"
              >
                Netejar
              </button>
            </div>
          </div>
        </div>

        {/* Toggles para mostrar/ocultar (solo en mapa) */}
        {currentConfig.showToggles && (
          <div className="mt-4 flex space-x-4">
            <label className="flex items-center text-white">
              <input
                type="checkbox"
                checked={filters.showContenedores}
                onChange={(e) => setFilters({...filters, showContenedores: e.target.checked})}
                className="mr-2"
              />
              Mostrar Contenidors
            </label>

            <label className="flex items-center text-white">
              <input
                type="checkbox"
                checked={filters.showZones}
                onChange={(e) => setFilters({...filters, showZones: e.target.checked})}
                className="mr-2"
              />
              Mostrar Zones
            </label>
          </div>
        )}
      </div>
    </div>
  );
};