import { Link } from "react-router-dom";

export function Unauthorized() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-4xl font-bold text-red-600">Acceso Denegado</h1>
      <p className="text-lg text-gray-700 mt-2">
        No tienes permiso para ver esta página.
      </p>
      <div className="mt-6">
        <Link 
          to="/" 
          className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-700"
        >
          Volver al Inicio
        </Link>
        <Link 
          to="/login" 
          className="ml-4 px-4 py-2 bg-gray-500 text-white rounded-lg shadow hover:bg-gray-700"
        >
          Iniciar Sesión
        </Link>
      </div>
    </div>
  );
}