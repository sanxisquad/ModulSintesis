import { Link } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { useState, useEffect, useRef } from "react";
import { useMenu } from "../../context/MenuContext";
import { usePermissions } from "../../../hooks/usePermissions";
import { FaBars, FaTimes, FaChevronDown, FaChevronUp, FaUser, FaSignOutAlt, FaQrcode } from "react-icons/fa";
import { MdManageAccounts } from "react-icons/md";

export function Navigation() {
    const { isAuthenticated, user, logout, loading } = useAuth();
    const { menuOpen, toggleMenu } = useMenu();
    const [gestionExpanded, setGestionExpanded] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const { canMenu, menuUser, isUser } = usePermissions();
    const userMenuRef = useRef(null);
    const menuRef = useRef(null);

    // Cerrar menús al hacer clic fuera
    useEffect(() => {
        function handleClickOutside(event) {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setUserMenuOpen(false);
            }
            
            if (menuRef.current && !menuRef.current.contains(event.target) && 
                !event.target.closest('button[aria-label="Toggle menu"]')) {
                toggleMenu(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [toggleMenu]);

    return (
        <div className="w-full sticky top-0 z-50">
            {/* Barra de navegación superior */}
            <div className="bg-black text-white py-3 px-4 flex items-center justify-between">
                {/* Menú hamburguesa y logo */}
                <div className="flex items-center">
                    {(canMenu || menuUser) && (
                        <button
                            aria-label="Toggle menu"
                            className="text-white text-2xl p-2 mr-2"
                            onClick={toggleMenu}
                        >
                            {menuOpen ? <FaTimes /> : <FaBars />}
                        </button>
                    )}
                    
                    <Link to={canMenu ? "/gestor-dashboard" : "/"} className="flex items-center">
                        <h1 className="text-xl md:text-3xl font-bold text-green-500">ReciclamJA</h1>
                    </Link>
                </div>

                {/* Botón de escanear QR solo para usuarios en móvil */}
                {isUser && (
                    <div className="md:hidden ml-2">
                        <Link
                            to="/tasks"
                            className="text-white bg-green-600 px-3 py-2 rounded-md text-sm flex items-center"
                        >
                            <FaQrcode className="mr-1" />
                            <span className="hidden xs:inline">Escan.</span>
                        </Link>
                    </div>
                )}

                {/* Menú de usuario */}
                <nav className="flex items-center">
                    <ul className="flex items-center">
                        {loading ? (
                            <li className="inline-block mx-2">
                                <span className="text-white">Cargando...</span>
                            </li>
                        ) : isAuthenticated ? (
                            <li className="relative" ref={userMenuRef}>
                            <div className="flex items-center">
                                {isUser && (
                                    <span className="hidden md:inline-block mr-4 text-sm md:text-base">
                                        Punts: <span className="font-bold">{user?.score || 0}</span>
                                    </span>
                                )}
                                <div className="text-white flex items-center">
                                    <span className="hidden md:inline mr-2">{user?.username}</span>
                                    <FaUser className="text-lg" />
                                </div>
                            </div>

                            </li>
                        ) : (
                            <li className="inline-block">
                                <Link 
                                    to="/login" 
                                    className="text-white bg-blue-500 px-3 py-2 md:px-4 md:py-2 rounded-md text-sm md:text-base hover:bg-blue-600 flex items-center"
                                >
                                    <FaUser className="mr-1 md:mr-2" /> Login
                                </Link>
                            </li>
                        )}
                    </ul>
                </nav>
            </div>

            {/* Menú lateral desplegable */}
            {(menuOpen && (canMenu || menuUser)) && (
                <div
                    ref={menuRef}
                    className={`fixed md:absolute left-0 top-16 h-[calc(100vh-4rem)] md:h-auto w-full md:w-64 bg-black text-white shadow-lg p-4 z-40`}
                >
                    <ul className="space-y-2">
                        {/* Contenido del menú para gestores */}
                        {canMenu && (
                            <>
                                <li>
                                    <Link 
                                        to="/gestor-dashboard" 
                                        className="block py-3 px-4 hover:bg-gray-800 rounded-lg"
                                        onClick={() => {
                                            setGestionExpanded(false);
                                            toggleMenu();
                                        }}
                                    >
                                        Dashboard
                                    </Link>
                                </li>
                                
                                <li>
                                    <button
                                        className="flex justify-between items-center w-full py-3 px-4 hover:bg-gray-800 rounded-lg text-left"
                                        onClick={() => setGestionExpanded(!gestionExpanded)}
                                    >
                                        <span>Gestió</span>
                                        {gestionExpanded ? <FaChevronUp /> : <FaChevronDown />}
                                    </button>
                                    {gestionExpanded && (
                                        <div className="ml-4 mt-1">
                                            <ul className="space-y-2">
                                            <li>
                                                <Link 
                                                    to="/gestor-usuaris" 
                                                    className="flex items-center py-2 px-4 hover:bg-gray-800 rounded-lg"
                                                    onClick={toggleMenu}
                                                >
                                                    <MdManageAccounts className="mr-2" />
                                                    Usuaris
                                                </Link>
                                                </li>
                                                <li>
                                                    <Link 
                                                        to="/gestor-contenedors" 
                                                        className="block py-2 px-4 hover:bg-gray-800 rounded-lg"
                                                        onClick={toggleMenu}
                                                    >
                                                        Contenidors
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link 
                                                        to="/gestor-zones" 
                                                        className="block py-2 px-4 hover:bg-gray-800 rounded-lg"
                                                        onClick={toggleMenu}
                                                    >
                                                        Zones de reciclatge
                                                    </Link>
                                                </li>
                                            </ul>
                                        </div>
                                    )}
                                </li>
                                
                                <li>
                                    <Link 
                                        to="/estadisticas" 
                                        className="block py-3 px-4 hover:bg-gray-800 rounded-lg"
                                        onClick={toggleMenu}
                                    >
                                        Estadístiques
                                    </Link>
                                </li>
                            </>
                        )}
                        
                        {/* Contenido del menú para usuarios normales */}
                        {menuUser && isUser && (
                            <li>
                                <Link 
                                    to="/tasks" 
                                    className="block py-3 px-4 bg-green-600 rounded-lg flex items-center justify-center"
                                    onClick={toggleMenu}
                                >
                                    <FaQrcode className="mr-2" /> Escanejar Codi QR
                                </Link>
                            </li>
                        )}
                        
                        {/* Opciones comunes */}
                        {isAuthenticated && (
                            <>
                                <li>
                                    <Link 
                                        to="/profile" 
                                        className="block py-3 px-4 hover:bg-gray-800 rounded-lg flex items-center"
                                        onClick={toggleMenu}
                                    >
                                        <FaUser className="mr-2" /> El meu perfil
                                    </Link>
                                </li>
                                <li>
                                    <button
                                        onClick={() => {
                                            logout();
                                            toggleMenu();
                                        }}
                                        className="w-full text-left py-3 px-4 hover:bg-gray-800 rounded-lg flex items-center"
                                    >
                                        <FaSignOutAlt className="mr-2" /> Tancar sessió
                                    </button>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            )}

            {/* Espacio para el contenido cuando el menú está abierto */}
            {menuOpen && (
                <div className="md:pl-64 transition-all duration-300">
                    {/* Este div empuja el contenido cuando el menú lateral está abierto */}
                </div>
            )}
        </div>
    );
}