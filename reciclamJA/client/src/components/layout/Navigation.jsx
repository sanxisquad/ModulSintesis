import { Link } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { useState, useEffect, useRef } from "react";
import { useMenu } from "../../context/MenuContext";
import { usePermissions } from "../../../hooks/usePermissions";
import { useNotification } from "../../context/NotificationContext";
import { 
  FaBars, 
  FaTimes, 
  FaChevronDown, 
  FaChevronUp, 
  FaUser, 
  FaSignOutAlt, 
  FaQrcode, 
  FaBell,
  FaHome,
  FaUsers,
  FaFlask,
  FaChartBar,
  FaTicketAlt,
  FaMap
} from "react-icons/fa";
import { MdManageAccounts } from "react-icons/md";

export function Navigation() {
    const { isAuthenticated, user, logout, loading } = useAuth();
    const { menuOpen, toggleMenu } = useMenu();
    const [gestionExpanded, setGestionExpanded] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [notificacionesOpen, setNotificacionesOpen] = useState(false);
    const { canMenu, menuUser, isUser } = usePermissions();
    const userMenuRef = useRef(null);
    const menuRef = useRef(null);
    const notificacionesRef = useRef(null);
    
    // Usar el contexto de notificaciones
    const { 
        notificaciones, 
        loadingNotificaciones, 
        notificacionesNoLeidas, 
        fetchNotificaciones, 
        handleNotificacionClick,
        marcarTodasNotificacionesLeidas 
    } = useNotification();

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
            
            if (notificacionesRef.current && !notificacionesRef.current.contains(event.target) &&
                !event.target.closest('button[aria-label="Toggle notifications"]')) {
                setNotificacionesOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [toggleMenu]);

    // Función auxiliar para formatear fechas sin date-fns
    const formatearFechaRelativa = (fecha) => {
        const ahora = new Date();
        const fechaNotif = new Date(fecha);
        const diferenciaMilisegundos = ahora - fechaNotif;
        
        // Convertir a diferentes unidades de tiempo
        const segundos = Math.floor(diferenciaMilisegundos / 1000);
        const minutos = Math.floor(segundos / 60);
        const horas = Math.floor(minutos / 60);
        const dias = Math.floor(horas / 24);
        
        if (dias > 0) {
            return dias === 1 ? 'hace 1 día' : `hace ${dias} días`;
        } else if (horas > 0) {
            return horas === 1 ? 'hace 1 hora' : `hace ${horas} horas`;
        } else if (minutos > 0) {
            return minutos === 1 ? 'hace 1 minuto' : `hace ${minutos} minutos`;
        } else {
            return 'hace unos segundos';
        }
    };

    // Helper function to render menu item with icon
    const MenuItem = ({ to, icon: Icon, children, onClick }) => (
      <li className="mb-2">
        <Link
          to={to}
          className="flex items-center p-2 text-gray-600 hover:bg-gray-100 rounded"
          onClick={onClick}
        >
          {Icon && <Icon className="w-5 h-5 mr-2" />}
          <span>{children}</span>
        </Link>
      </li>
    );

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
                        {/* Notificaciones - Solo para gestores y admins */}
                        {isAuthenticated && (canMenu || user?.is_staff) && (
                            <li className="relative mr-4">
                                <button
                                    aria-label="Toggle notifications"
                                    className="text-white p-2 rounded-full hover:bg-gray-800 relative"
                                    onClick={() => {
                                        setNotificacionesOpen(!notificacionesOpen);
                                        if (!notificacionesOpen) fetchNotificaciones();
                                    }}
                                >
                                    <FaBell className="text-lg" />
                                    {notificacionesNoLeidas > 0 && (
                                        <span className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                            {notificacionesNoLeidas > 9 ? '9+' : notificacionesNoLeidas}
                                        </span>
                                    )}
                                </button>

                                {notificacionesOpen && (
                                    <div 
                                        ref={notificacionesRef}
                                        className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-50 max-h-96 overflow-y-auto text-black"
                                    >
                                        <div className="flex justify-between items-center p-3 border-b">
                                            <h3 className="font-semibold">Notificacions</h3>
                                            {notificacionesNoLeidas > 0 && (
                                                <button 
                                                    onClick={marcarTodasNotificacionesLeidas}
                                                    className="text-sm text-blue-600 hover:text-blue-800"
                                                >
                                                    Marcar todas como leídas
                                                </button>
                                            )}
                                        </div>
                                        
                                        {loadingNotificaciones ? (
                                            <div className="p-4 text-center text-gray-500">
                                                Cargando...
                                            </div>
                                        ) : notificaciones.length > 0 ? (
                                            notificaciones.map(notif => (
                                                <div 
                                                    key={notif.id}
                                                    className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${!notif.leida ? 'bg-blue-50' : ''}`}
                                                    onClick={() => handleNotificacionClick(notif.id, notif.ruta)}
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <h4 className="font-medium text-sm">{notif.titulo}</h4>
                                                        <span className="text-xs text-gray-500">
                                                            {formatearFechaRelativa(notif.fecha)}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 mt-1">{notif.mensaje}</p>
                                                    {!notif.leida && (
                                                        <div className="mt-2 text-xs text-blue-600">Marcar como leída</div>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-4 text-center text-gray-500">
                                                No hay notificaciones
                                            </div>
                                        )}
                                    </div>
                                )}
                            </li>
                        )}
                        
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
                                        <FaChartBar className="w-5 h-5 inline-block mr-2" />
                                        Dashboard
                                    </Link>
                                </li>
                                
                                <li>
                                    <button
                                        className="flex justify-between items-center w-full py-3 px-4 hover:bg-gray-800 rounded-lg text-left"
                                        onClick={() => setGestionExpanded(!gestionExpanded)}
                                    >
                                        <span className="flex items-center">
                                            <FaFlask className="w-5 h-5 mr-2" />
                                            Gestió
                                        </span>
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
                                                    <FaUsers className="w-5 h-5 mr-2" />
                                                    Usuaris
                                                </Link>
                                                </li>
                                                <li>
                                                    <Link 
                                                        to="/gestor-contenedors" 
                                                        className="block py-2 px-4 hover:bg-gray-800 rounded-lg"
                                                        onClick={toggleMenu}
                                                    >
                                                        <FaFlask className="w-5 h-5 mr-2" />
                                                        Contenidors
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link 
                                                        to="/gestor-zones" 
                                                        className="block py-2 px-4 hover:bg-gray-800 rounded-lg"
                                                        onClick={toggleMenu}
                                                    >
                                                        <FaMap className="w-5 h-5 mr-2" />
                                                        Zones de reciclatge
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link 
                                                        to="/gestor-tiquets" 
                                                        className="block py-2 px-4 hover:bg-gray-800 rounded-lg"
                                                        onClick={toggleMenu}
                                                    >
                                                        <FaTicketAlt className="w-5 h-5 mr-2" />
                                                        Tiquets
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
                                    className=" py-3 px-4 bg-green-600 rounded-lg flex items-center justify-center"
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
                                        className="py-3 px-4 hover:bg-gray-800 rounded-lg flex items-center"
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