import { useMenu } from '../../context/MenuContext';  // Usar el contexto del menú

import { ZonaReciclatgeList } from '../../components/zr/ZonaReciclatgeList';

export function GestorZona() {
  const { menuOpen } = useMenu();  // Obtener el estado del menú desde el contexto

    return (
      <div className={`transition-all duration-300 ease-in-out`}>
        <ZonaReciclatgeList />
      </div>
    );
}