import { useMenu } from '../../context/MenuContext';  // Usar el contexto del menú

import { ContenedorList } from '../../components/zr/ContenedorList';

export function DashBoard() {
  const { menuOpen } = useMenu();  // Obtener el estado del menú desde el contexto


  return (
    <div
      className={`transition-all duration-300 ease-in-out ${
        menuOpen ? 'ml-64' : 'ml-0'
      }`}  // Aplica la clase ml-64 cuando el menú está abierto
    >
      <ContenedorList />
    </div>
  );
}
