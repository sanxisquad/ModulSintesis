import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect, useRef } from "react";
import { useMenu } from "../context/MenuContext";  // Importa el hook del contexto

export function Navigation() {
    const { isAuthenticated, user, logout, loading } = useAuth();
    const { menuOpen, toggleMenu } = useMenu();  // Usar el estado del menú desde el contexto
    const [gestionExpanded, setGestionExpanded] = useState(false);  // Estado para expandir "Gestión"
    const [userMenuOpen, setUserMenuOpen] = useState(false);  // Estado para el menú desplegable del usuario
    const userMenuRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setUserMenuOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="w-full sticky top-0 ">
            {/* Barra de navegación superior */}
            <div className="bg-black text-white py-3 px-4 relative flex items-center justify-between">
                {/* Menú icono */}
                <button
                    className="text-white text-2xl px-4 py-2"
                    onClick={toggleMenu}  // Usar toggleMenu del contexto
                >
                    ☰
                </button>

                {/* Logo */}
                <Link to="/tasks" className="ml-4">
                    <h1 className="text-3xl font-bold text-green-500">ReciclamJA</h1>
                </Link>

                {/* Enlaces y perfil */}
                <nav className="flex flex-1 justify-end items-center">
                    <ul className="flex items-center">
                        {loading ? (
                            <li className="inline-block mx-2">
                                <span className="text-white">Cargando...</span>
                            </li>
                        ) : isAuthenticated ? (
                            <li className="relative inline-block mx-2" ref={userMenuRef}>
                                <button
                                    className="text-white focus:outline-none"
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                >
                                    {user?.username}
                                </button>
                                {userMenuOpen && (
                                    <ul className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
                                        <li>
                                            <Link to="/profile" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">
                                                Profile
                                            </Link>
                                        </li>
                                        <li>
                                            <button
                                                onClick={logout}
                                                className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                                            >
                                                Logout
                                            </button>
                                        </li>
                                    </ul>
                                )}
                            </li>
                        ) : (
                            <li className="inline-block mx-2">
                                <Link to="/login" className="text-white bg-blue-500 px-4 py-2 rounded-md hover:bg-blue-600">
                                    Login
                                </Link>
                            </li>
                        )}
                    </ul>
                </nav>
            </div>

            {/* Menú lateral grande SOLO para gestores/admins */}
            {menuOpen && (user?.is_gestor || user?.is_admin) && (
                <div
                    className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-black text-white shadow-lg p-4 z-40 transition-all duration-300"
                >
                    <ul>
                        <li>
                            <Link to="/gestor-dashboard" className="block py-2 hover:bg-gray-800 px-4 rounded">Dashboard</Link>
                        </li>

                        {/* Gestión */}
                        <li>
                            <button
                                className="block py-2 hover:bg-gray-800 px-4 rounded w-full text-left"
                                onClick={() => setGestionExpanded(!gestionExpanded)} // Expande/contrae el submenú
                            >
                                Gestio
                            </button>
                            {/* Submenú de Gestión */}
                            {gestionExpanded && (
                                <div className="ml-4">
                                    <ul>
                                        <li>
                                            <Link to="/gestor-usuaris" className="block py-2 hover:bg-gray-800 px-4 rounded">Usuaris</Link>
                                        </li>
                                        <li>
                                            <Link to="/gestor-contenedors" className="block py-2 hover:bg-gray-800 px-4 rounded">Contenedors</Link>
                                        </li>
                                        <li>
                                            <Link to="/gestor-zones" className="block py-2 hover:bg-gray-800 px-4 rounded">Zones de reciclatge</Link>
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </li>

                        <li>
                            <Link to="/estadisticas" className="block py-2 hover:bg-gray-800 px-4 rounded">Estadísticas</Link>
                        </li>
                        <li>
                            <Link to="/usuarios" className="block py-2 hover:bg-gray-800 px-4 rounded">Usuaris</Link>
                        </li>
                    </ul>
                </div>
            )}

            {/* Contenedor principal con navbar y contenido */}
            <div className="flex-1 transition-all duration-300 w-full">
                {/* Contenido de la página */}
            </div>
        </div>
    );
}