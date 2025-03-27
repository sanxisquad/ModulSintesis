import { useMenu } from '../../context/MenuContext';  // Usar el contexto del menú

import { ContenedorList } from '../../components/zr/ContenedorList';
import { MapView } from '../../components/zr/MapContainer';

export function DashBoard() {
  const { menuOpen } = useMenu();  // Obtener el estado del menú desde el contexto


  return (
<div className={`transition-all duration-300 ease-in-out flex flex-col items-center`}>
  <ContenedorList />
  <div className="w-full flex justify-center mt-4">
    <div className="h-96 w-2/4">
      <MapView />
    </div>
  </div>
</div>

  );
}
