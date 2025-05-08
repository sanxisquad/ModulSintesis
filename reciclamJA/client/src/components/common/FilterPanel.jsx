import React, { useState } from 'react';
import { FiFilter, FiChevronDown, FiChevronUp, FiX } from 'react-icons/fi';

export const FilterPanel = ({ 
  filters, 
  setFilters,
  ciudades,
  zonas,
  usuarios = [],
  estatOptions = [],
  tipusOptions = [],
  roleOptions = [],
  mode = 'contenedors'
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isMobile = window.innerWidth < 768;

  const handleClearFilters = () => {
    const baseFilters = {
      ciutat: '',
      zona: '',
      estat: '',
      tipus: '',
      usuari: '',
      codi: '',
      nom: '',
      role: '',
      showContenedores: true,
      showZones: true
    };
    setFilters(baseFilters);
  };

  // Configuración específica por modo
  const config = {
    contenedors: {
      showCiutatFilter: true,
      showZonaFilter: true,
      showEstatFilter: true,
      showTipusFilter: true,
      showUsuariFilter: false,
      showCodiFilter: true,
      showNomFilter: false,
      showToggles: false
    },
    zones: {
      showCiutatFilter: true,
      showZonaFilter: false,
      showEstatFilter: false,
      showTipusFilter: false,
      showUsuariFilter: false,
      showCodiFilter: false,
      showNomFilter: true,
      showToggles: false
    },
    mapa: {
      showCiutatFilter: true,
      showZonaFilter: false,
      showEstatFilter: true,
      showTipusFilter: true,
      showUsuariFilter: false,
      showCodiFilter: false,
      showToggles: true
    },
    usuaris: {
      showCiutatFilter: false,
      showZonaFilter: false,
      showEstatFilter: false,
      showTipusFilter: false,
      showUsuariFilter: true,
      showCodiFilter: false,
      showNomFilter: true,
      showRoleFilter: true,
      showToggles: false
    }
  };

  const currentConfig = config[mode] || config.contenedors;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header with toggle button */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center">
          <FiFilter className="mr-2 text-blue-500" />
          <h3 className="font-semibold text-gray-700">Filtres avançats</h3>
        </div>
        {isMobile && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 hover:text-gray-700"
          >
            {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
          </button>
        )}
      </div>

      {/* Filter Content */}
      <div className={`p-4 ${isMobile && !isExpanded ? 'hidden' : 'block'}`}>
        <div className="flex flex-col md:flex-row md:flex-wrap md:items-end gap-4">
          {/* Filtro por ciudad */}
          {currentConfig.showCiutatFilter && (
            <div className="w-full md:w-auto">
              <label htmlFor="ciutat-filter" className="block mb-1 text-xs font-medium text-gray-600">Ciutat</label>
              <select
                id="ciutat-filter"
                name="ciutat"
                value={filters.ciutat}
                onChange={(e) => setFilters({...filters, ciutat: e.target.value})}
                className="w-full md:w-40 p-2 border border-gray-300 rounded bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Totes</option>
                {ciudades.map((ciudad, index) => (
                  <option key={index} value={ciudad}>{ciudad}</option>
                ))}
              </select>
            </div>
          )}

          {/* Filtro por usuario */}
          {currentConfig.showUsuariFilter && (
            <div className="w-full md:w-auto">
              <label htmlFor="usuari-filter" className="block mb-1 text-xs font-medium text-gray-600">Usuari</label>
              <select
                id="usuari-filter"
                name="usuari"
                value={filters.usuari}
                onChange={(e) => setFilters({...filters, usuari: e.target.value})}
                className="w-full md:w-40 p-2 border border-gray-300 rounded bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tots</option>
                {usuarios.map(usuario => (
                  <option key={usuario.id} value={usuario.id}>{usuario.nom}</option>
                ))}
              </select>
            </div>
          )}

          {/* Filtro por zona */}
          {currentConfig.showZonaFilter && (
            <div className="w-full md:w-auto">
              <label htmlFor="zona-filter" className="block mb-1 text-xs font-medium text-gray-600">
                {mode === 'zones' ? 'Zona' : 'Zona de reciclatge'}
              </label>
              <select
                id="zona-filter"
                name="zona"
                value={filters.zona}
                onChange={(e) => setFilters({...filters, zona: e.target.value})}
                className="w-full md:w-48 p-2 border border-gray-300 rounded bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            <div className="w-full md:w-auto">
              <label htmlFor="estat-filter" className="block mb-1 text-xs font-medium text-gray-600">Estat</label>
              <select
                id="estat-filter"
                name="estat"
                value={filters.estat}
                onChange={(e) => setFilters({...filters, estat: e.target.value})}
                className="w-full md:w-40 p-2 border border-gray-300 rounded bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            <div className="w-full md:w-auto">
              <label htmlFor="tipus-filter" className="block mb-1 text-xs font-medium text-gray-600">Tipus</label>
              <select
                id="tipus-filter"
                name="tipus"
                value={filters.tipus}
                onChange={(e) => setFilters({...filters, tipus: e.target.value})}
                className="w-full md:w-40 p-2 border border-gray-300 rounded bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tots</option>
                {tipusOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          )}

          {/* Filtro por rol */}
          {currentConfig.showRoleFilter && (
            <div className="w-full md:w-auto">
              <label htmlFor="role-filter" className="block mb-1 text-xs font-medium text-gray-600">Rol</label>
              <select
                id="role-filter"
                name="role"
                value={filters.role}
                onChange={(e) => setFilters({...filters, role: e.target.value})}
                className="w-full md:w-40 p-2 border border-gray-300 rounded bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tots els rols</option>
                {roleOptions.map((role, index) => (
                  <option key={index} value={role}>{role}</option>
                ))}
              </select>
            </div>
          )}

          {/* Filtro por nombre */}
          {currentConfig.showNomFilter && (
            <div className="w-full md:w-auto">
              <label htmlFor="nom-filter" className="block mb-1 text-xs font-medium text-gray-600">Nom</label>
              <input
                id="nom-filter"
                name="nom"
                type="text"
                placeholder="Cercar per nom"
                value={filters.nom}
                onChange={(e) => setFilters({...filters, nom: e.target.value})}
                className="w-full md:w-48 p-2 border border-gray-300 rounded bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          {/* Filtro por código */}
          {currentConfig.showCodiFilter && (
            <div className="w-full md:w-auto">
              <label htmlFor="codi-filter" className="block mb-1 text-xs font-medium text-gray-600">Cercar per codi</label>
              <input
                id="codi-filter"
                name="codi"
                type="text"
                placeholder="Introdueix el codi"
                value={filters.codi}
                onChange={(e) => setFilters({...filters, codi: e.target.value})}
                className="w-full md:w-48 p-2 border border-gray-300 rounded bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          {/* Botón limpiar - estilo mejorado */}
          <div className="w-full md:w-auto md:self-end">
            <button
              type="button"
              onClick={handleClearFilters}
              className="flex items-center justify-center w-full md:w-auto px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded transition-colors focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
            >
              <FiX className="mr-1" />
              <span>Netejar filtres</span>
            </button>
          </div>
        </div>

        {/* Toggles para mostrar/ocultar */}
        {currentConfig.showToggles && (
          <div className="mt-4 flex flex-wrap gap-4 pt-3 border-t border-gray-200">
            <label htmlFor="show-contenedores" className="flex items-center text-gray-700">
              <input
                id="show-contenedores"
                name="showContenedores"
                type="checkbox"
                checked={filters.showContenedores}
                onChange={(e) => setFilters({...filters, showContenedores: e.target.checked})}
                className="mr-2 text-blue-500 focus:ring-blue-400 focus:ring-opacity-50"
              />
              Mostrar Contenidors
            </label>

            <label htmlFor="show-zones" className="flex items-center text-gray-700">
              <input
                id="show-zones"
                name="showZones"
                type="checkbox"
                checked={filters.showZones}
                onChange={(e) => setFilters({...filters, showZones: e.target.checked})}
                className="mr-2 text-blue-500 focus:ring-blue-400 focus:ring-opacity-50"
              />
              Mostrar Zones
            </label>
          </div>
        )}
      </div>
    </div>
  );
};