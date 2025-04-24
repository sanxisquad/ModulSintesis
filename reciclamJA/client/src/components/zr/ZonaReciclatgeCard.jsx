import { Link, useNavigate } from 'react-router-dom';

export function ZonesReciclatgeCard({ zones }) {
  const navigate = useNavigate();

  const handleDivClick = () => {
    // Solo navega a la zona cuando no se hace clic en el enlace
    navigate(`/zona/${zones.id}`);
  };

  const handleLinkClick = (e) => {
    // Evita que el click en el Link propague el evento hacia el div
    e.stopPropagation();
  };

  return (
    <div
      className="bg-zinc-800 p-3 rounded hover:bg-zinc-700 hover:cursor-pointer"
      onClick={handleDivClick}  // Redirige a editar la zona cuando se hace clic en el div
    >
      <h1 className="font-bold uppercase">{zones.nom}</h1>
      <p className="text-slate-400">{zones.ciutat}</p>

      {/* Este es el enlace para gestionar los contenedores */}
      <Link
        to={`/zones/${zones.id}/contenedores`}
        className="text-blue-600 hover:underline mt-2 block"
        onClick={handleLinkClick}  // Detiene la propagación del evento cuando se hace clic en el enlace
      >
        Gestionar contenedores
      </Link>
    </div>
  );
}
