import React, { useState, useEffect } from 'react';
import { FiFilter, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { getAllRoles } from '../../api/role.api';

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
  const [internalRoleOptions, setInternalRoleOptions] = useState([]);
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

  // Cargar roles si no se pasaron por props y estamos en modo 'usuaris'
  useEffect(() => {
    if (mode === 'usuaris' && roleOptions.length === 0) {
      const fetchRoles = async () => {
        try {
          const roles = await getAllRoles();
          setInternalRoleOptions(roles); // Suponiendo { id, nom }
        } catch (error) {
          console.error('Error al cargar los roles:', error);
        }
      };
      fetchRoles();
    }
  }, [mode, roleOptions]);

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
      showZonaFilter: true,
      showEstatFilter: true,
      showTipusFilter: true,
      showUsuariFilter: true,
      showCodiFilter: true,
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
  const effectiveRoleOptions = roleOptions.length ? roleOptions : internalRoleOptions;

  return (
    <div className="bg-black p-4 mb-4 rounded shadow">
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

      <div className={`${isMobile && !isExpanded ? 'hidden' : 'block'}`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {currentConfig.showCiutatFilter && (
            <div>
              <label className="block mb-2 font-medium text-white">Ciutat</label>
              <select
                value={filters.ciutat}
                onChange={(e) => setFilters({ ...filters, ciutat: e.target.value })}
                className="w-full p-2 border rounded bg-gray-800 text-white"
              >
                <option value="">Totes</option>
                {ciudades.map((ciudad, index) => (
                  <option key={index} value={ciudad}>{ciudad}</option>
                ))}
              </select>
            </div>
          )}

          {currentConfig.showUsuariFilter && (
            <div>
              <label className="block mb-2 font-medium text-white">Usuari</label>
              <select
                value={filters.usuari}
                onChange={(e) => setFilters({ ...filters, usuari: e.target.value })}
                className="w-full p-2 border rounded bg-gray-800 text-white"
              >
                <option value="">Tots</option>
                {usuarios.map(usuario => (
                  <option key={usuario.id} value={usuario.id}>{usuario.nom}</option>
                ))}
              </select>
            </div>
          )}

          {currentConfig.showZonaFilter && (
            <div>
              <label className="block mb-2 font-medium text-white">
                {mode === 'zones' ? 'Zona' : 'Zona de reciclatge'}
              </label>
              <select
                value={filters.zona}
                onChange={(e) => setFilters({ ...filters, zona: e.target.value })}
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

          {currentConfig.showEstatFilter && (
            <div>
              <label className="block mb-2 font-medium text-white">Estat</label>
              <select
                value={filters.estat}
                onChange={(e) => setFilters({ ...filters, estat: e.target.value })}
                className="w-full p-2 border rounded bg-gray-800 text-white"
              >
                <option value="">Tots</option>
                {estatOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          )}

          {currentConfig.showTipusFilter && (
            <div>
              <label className="block mb-2 font-medium text-white">Tipus</label>
              <select
                value={filters.tipus}
                onChange={(e) => setFilters({ ...filters, tipus: e.target.value })}
                className="w-full p-2 border rounded bg-gray-800 text-white"
              >
                <option value="">Tots</option>
                {tipusOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          )}

          {currentConfig.showRoleFilter && effectiveRoleOptions.length > 0 && (
            <div>
              <label className="block mb-2 font-medium text-white">Rol</label>
              <select
                value={filters.role}
                onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                className="w-full p-2 border rounded bg-gray-800 text-white"
              >
                <option value="">Tots els rols</option>
                {effectiveRoleOptions.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.nom}
                  </option>
                ))}
              </select>
            </div>
          )}

          {currentConfig.showNomFilter && (
            <div>
              <label className="block mb-2 font-medium text-white">Nom</label>
              <input
                type="text"
                placeholder="Cercar per nom"
                value={filters.nom}
                onChange={(e) => setFilters({ ...filters, nom: e.target.value })}
                className="w-full p-2 border rounded bg-gray-800 text-white"
              />
            </div>
          )}

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
                onChange={(e) => setFilters({ ...filters, codi: e.target.value })}
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

        {currentConfig.showToggles && (
          <div className="mt-4 flex space-x-4">
            <label className="flex items-center text-white">
              <input
                type="checkbox"
                checked={filters.showContenedores}
                onChange={(e) => setFilters({ ...filters, showContenedores: e.target.checked })}
                className="mr-2"
              />
              Mostrar Contenidors
            </label>
            <label className="flex items-center text-white">
              <input
                type="checkbox"
                checked={filters.showZones}
                onChange={(e) => setFilters({ ...filters, showZones: e.target.checked })}
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
