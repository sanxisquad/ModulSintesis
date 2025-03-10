import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useRef } from 'react';

export function Navigation() {
    const { isAuthenticated, user, logout, loading } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false); // Estado para abrir/cerrar el menú lateral
    const [dropdownOpen, setDropdownOpen] = useState(false); // Estado para abrir/cerrar el dropdown
    const menuRef = useRef(null);
    const dropdownRef = useRef(null);

    // Cierra el menú si se hace clic fuera de él
    useEffect(() => {
        function handleClickOutside(event) {
            // Si se hace clic fuera del menú o del menú desplegable
            if (menuRef.current && !menuRef.current.contains(event.target) && !dropdownRef.current.contains(event.target)) {
                setMenuOpen(false); // Cierra el menú lateral
                setDropdownOpen(false); // Cierra el dropdown
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="flex items-center py-3 bg-black px-4">
            {/* Menú lateral */}
            <div className="relative mr-4" ref={menuRef}>
                <button
                    className="text-white text-2xl px-4 py-2"
                    onClick={() => setMenuOpen(!menuOpen)} // Al hacer clic, alterna entre abrir y cerrar el menú
                >
                    ☰ {/* Ícono del menú */}
                </button>

                {/* Menú lateral que se despliega */}
                {menuOpen && (
                    <ul className="absolute left-0 top-12 w-48 bg-white rounded-md shadow-lg py-2 z-10">
                        <li>
                            <Link to="/option1" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">
                                Opción 1
                            </Link>
                        </li>
                        <li>
                            <Link to="/option2" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">
                                Opción 2
                            </Link>
                        </li>
                        <li>
                            <Link to="/option3" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">
                                Opción 3
                            </Link>
                        </li>

                        {/* Opción Gestor solo si el usuario es un gestor */}
                        {user?.is_gestor && (
                            <li>
                                <Link
                                    to="/gestor-dashboard"
                                    className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                                >
                                    Gestor Dashboard
                                </Link>
                            </li>
                        )}
                    </ul>
                )}
            </div>

            {/* Logo y enlaces de la barra de navegación */}
            <Link to="/tasks" className="mr-10">
                <h1 className="text-3xl font-bold text-green-500 mb-4">
                    ReciclamJA
                </h1>
            </Link>

            {/* Enlaces principales */}
            <nav className="flex flex-1 justify-end items-center">
                <ul className="flex items-center">
                    <li className="inline-block mx-2">
                        <Link to="/users" className="text-white">Usuaris</Link>
                    </li>

                    {loading ? (
                        <li className="inline-block mx-2">
                            <span className="text-white">Cargando...</span>
                        </li>
                    ) : isAuthenticated ? (
                        <li className="relative inline-block mx-2">
                            <button
                                className="text-white focus:outline-none"
                                onClick={() => setDropdownOpen(!dropdownOpen)} // Controla el dropdown del perfil
                            >
                                {user?.username}
                            </button>
                            {dropdownOpen && (
                                <ul className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1" ref={dropdownRef}>
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
    );
}
