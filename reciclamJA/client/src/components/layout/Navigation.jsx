import { Link } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { useState, useEffect, useRef } from "react";
import { useMenu } from "../../context/MenuContext";
import { usePermissions } from "../../../hooks/usePermissions";
import { useNotification } from "../../context/NotificationContext";
import { toast } from "react-hot-toast"; // Import toast for notifications
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
  FaTrashAlt,
  FaChartBar,
  FaExclamationTriangle,
  FaRecycle,
  FaInfoCircle,
  FaMapMarkedAlt,
  FaDownload,
  FaLink,
  FaExternalLinkAlt,
  FaDesktop,
  FaMobileAlt,
  FaFileDownload
} from "react-icons/fa";
import { MdManageAccounts } from "react-icons/md";

export function Navigation() {
    const { isAuthenticated, user, logout, loading } = useAuth();
    const { menuOpen, toggleMenu } = useMenu();
    const [gestionExpanded, setGestionExpanded] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [notificacionesOpen, setNotificacionesOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    // Always show the install button for testing
    const [showInstallButton, setShowInstallButton] = useState(true);
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [installInstructions, setInstallInstructions] = useState(false);
    const [installPlatform, setInstallPlatform] = useState('desktop'); // Default to desktop
    const { canMenu, menuUser, isUser } = usePermissions();
    const userMenuRef = useRef(null);
    const menuRef = useRef(null);
    const mobileMenuRef = useRef(null);
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

    // Detect if the app can be installed
    useEffect(() => {
        // Detect mobile devices more reliably
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        setInstallPlatform(isMobile ? 'mobile' : 'desktop');
        console.log("Device detected as:", isMobile ? "Mobile" : "Desktop");
        
        // Log when we're trying to set up the install prompt
        console.log("Setting up install prompt listener");
        
        // Listen for the beforeinstallprompt event
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log("Install prompt detected!", e);
            // Prevent Chrome 76+ from automatically showing the prompt
            e.preventDefault();
            // Stash the event so it can be triggered later
            setDeferredPrompt(e);
            // Always show the button (we'll use fallback for browsers that don't support install)
            setShowInstallButton(true);
        });

        window.addEventListener('appinstalled', () => {
            console.log('PWA was installed');
            toast.success('App instal·lada correctament!');
            setDeferredPrompt(null);
        });
        
        // Always show button even if the event doesn't fire (for testing)
        setShowInstallButton(true);
    }, []);

    // State to track if we need to show manual desktop shortcut instructions
    const [showManualShortcutInstructions, setShowManualShortcutInstructions] = useState(false);

    // Function to download desktop shortcut
    const downloadDesktopShortcut = () => {
        try {
            // Create HTML file that will serve as a shortcut
            const fileContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>ReciclamJA</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            background-color: #f0f9f4;
            color: #333;
        }
        .container {
            text-align: center;
            padding: 2rem;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            max-width: 80%;
            width: 500px;
        }
        .logo {
            width: 120px;
            height: 120px;
            margin-bottom: 1rem;
        }
        h1 {
            color: #10B981;
            margin-bottom: 1rem;
        }
        p {
            margin-bottom: 1.5rem;
            line-height: 1.6;
        }
        .btn {
            display: inline-block;
            background-color: #10B981;
            color: white;
            padding: 0.75rem 2rem;
            border-radius: 4px;
            text-decoration: none;
            font-weight: bold;
            margin-top: 1rem;
            transition: background-color 0.2s;
        }
        .btn:hover {
            background-color: #0e9f6e;
        }
    </style>
</head>
<body>
    <div class="container">
        <img src="${window.location.origin}/logo192.png" alt="ReciclamJA Logo" class="logo">
        <h1>ReciclamJA</h1>
        <p>Benvingut/da a l'aplicació de ReciclamJA. Clica al botó per accedir a l'aplicació.</p>
        <a href="${window.location.origin}" class="btn">Obrir ReciclamJA</a>
        <p><small>Si el botó no funciona, copia i enganxa aquesta URL al navegador: ${window.location.origin}</small></p>
    </div>
    <script>
        // Auto-redirect after 1 second
        setTimeout(function() {
            window.location.href = "${window.location.origin}";
        }, 1000);
    </script>
</body>
</html>`;
            
            // Create a Blob with the file content
            const blob = new Blob([fileContent], { type: 'text/html' });
            
            // Create a download link and trigger the download
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = "ReciclamJA.html";
            document.body.appendChild(link);
            link.click();
            
            // Clean up
            setTimeout(() => {
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }, 100);
            
            toast.success("Descarregant accés directe d'escriptori");
        } catch (error) {
            console.error("Error downloading desktop shortcut:", error);
            toast.error("No s'ha pogut descarregar. Et mostrarem com crear-ho manualment.");
            // Show manual shortcut instructions instead of generic install instructions
            setShowManualShortcutInstructions(true);
        }
    };

    // Enhanced install handler with automatic desktop shortcut
    const handleInstallClick = async () => {
        console.log("Install button clicked", { deferredPrompt, platform: installPlatform });
        
        // For desktop platforms, automatically download shortcut
        if (installPlatform === 'desktop') {
            // First try native installation if available
            if (deferredPrompt) {
                try {
                    // Show the native install prompt
                    deferredPrompt.prompt();
                    
                    // Wait for the user's choice
                    const { outcome } = await deferredPrompt.userChoice;
                    console.log(`User response to the install prompt: ${outcome}`);
                    
                    if (outcome === 'accepted') {
                        toast.success('Instal·lació iniciada!');
                    } else {
                        // If user declined the native prompt, download desktop shortcut
                        downloadDesktopShortcut();
                    }
                    
                    // Clear the prompt
                    setDeferredPrompt(null);
                } catch (err) {
                    console.error("Error prompting to install:", err);
                    // Fall back to desktop shortcut
                    downloadDesktopShortcut();
                }
            } else {
                // No native prompt available, download desktop shortcut
                downloadDesktopShortcut();
            }
        } else {
            // For mobile, use the existing flow
            if (deferredPrompt) {
                try {
                    deferredPrompt.prompt();
                    const { outcome } = await deferredPrompt.userChoice;
                    
                    if (outcome === 'accepted') {
                        toast.success('Instal·lació iniciada!');
                    } else {
                        setInstallInstructions(true);
                    }
                    
                    setDeferredPrompt(null);
                } catch (err) {
                    console.error("Error prompting to install:", err);
                    setInstallInstructions(true);
                }
            } else {
                // Show instructions for mobile
                setInstallInstructions(true);
            }
        }
    };

    // Cerrar menús al hacer clic fuera
    useEffect(() => {
        function handleClickOutside(event) {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setUserMenuOpen(false);
            }
            
            if (menuOpen && 
                menuRef.current && 
                !menuRef.current.contains(event.target) && 
                !event.target.closest('button[aria-label="Toggle menu"]')) {
                toggleMenu(false);
            }
            
            if (notificacionesRef.current && !notificacionesRef.current.contains(event.target) &&
                !event.target.closest('button[aria-label="Toggle notifications"]')) {
                setNotificacionesOpen(false);
            }
            
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) &&
                !event.target.closest('button[aria-label="Toggle mobile menu"]')) {
                setMobileMenuOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [toggleMenu, menuOpen]);

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
            <div className="bg-black text-white py-3 px-4 flex items-center justify-between relative z-50">
                {/* Mobile Menu Toggle Button - Only for non-admin users - Moved to be first item on mobile */}
                {(!canMenu || isUser) && (
                    <button
                        aria-label="Toggle mobile menu"
                        className="md:hidden text-white text-xl p-2 order-first"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <FaTimes /> : <FaBars />}
                    </button>
                )}
                
                {/* Logo - centered on mobile when menu button is present */}
                <div className={`flex items-center ${(!canMenu || isUser) ? 'md:ml-0 flex-grow md:flex-grow-0 justify-center md:justify-start' : ''}`}>
                    {/* Only show hamburger menu button for admin users */}
                    {canMenu && (
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

                {/* Navigation Links - Only for non-logged users and regular users - DESKTOP */}
                {(!isAuthenticated || isUser) && (
                    <div className="hidden md:flex items-center space-x-6 ml-6">
                        <a 
                            href="/#intro" 
                            className="text-white hover:text-green-400 transition-colors border-b-2 border-transparent hover:border-green-400 py-1 px-2"
                        >
                            Inici
                        </a>
                        <a 
                            href="/#reciclar" 
                            className="text-white hover:text-green-400 transition-colors border-b-2 border-transparent hover:border-green-400 py-1 px-2"
                        >
                            Com Reciclar
                        </a>
                        <a 
                            href="/#mapa" 
                            className="text-white hover:text-green-400 transition-colors border-b-2 border-transparent hover:border-green-400 py-1 px-2"
                        >
                            Mapa
                        </a>
                    </div>
                )}

                {/* Menú de usuario - Adjusted for spacing */}
                <nav className="flex items-center">
                    <ul className="flex items-center space-x-2">
                        {/* ONLY Install App Button */}
                        <li className="hidden sm:block">
                            <button
                                onClick={handleInstallClick}
                                className="text-white bg-green-600 hover:bg-green-700 px-3 py-2 rounded-md text-sm flex items-center"
                            >
                                <FaDownload className="mr-1" />
                                <span>Instal·lar App</span>
                            </button>
                        </li>
                        
                        {/* Notificaciones - Solo para gestores y admins */}
                        {isAuthenticated && (canMenu || user?.is_staff) && (
                            <li className="relative mr-2">
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
                                {/* No dropdown menu on mobile - show simple user badge */}
                                <div className="flex items-center">
                                    {isUser && (
                                        <span className="hidden md:inline-block mr-4 text-sm md:text-base">
                                            Punts: <span className="font-bold">{user?.score || 0}</span>
                                        </span>
                                    )}
                                    {/* On mobile just show the user icon, on desktop make it clickable for dropdown */}
                                    <div 
                                        className={`text-white flex items-center ${!isUser && 'md:cursor-pointer'} bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-md`}
                                        onClick={() => window.innerWidth >= 768 ? setUserMenuOpen(!userMenuOpen) : null}
                                    >
                                        <span className="hidden md:inline mr-2">{user?.username}</span>
                                        <FaUser className="text-lg" />
                                        <FaChevronDown className="hidden md:inline-block ml-1 w-3 h-3" />
                                    </div>
                                </div>
                                
                                {/* User Dropdown Menu - Only on desktop */}
                                {userMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                                        <Link 
                                            to="/profile" 
                                            className="block px-4 py-2 text-gray-800 hover:bg-gray-100" 
                                            onClick={() => setUserMenuOpen(false)}
                                        >
                                            El meu perfil
                                        </Link>
                                        {isUser && (
                                            <Link 
                                                to="/tasks" 
                                                className="block px-4 py-2 text-gray-800 hover:bg-gray-100" 
                                                onClick={() => setUserMenuOpen(false)}
                                            >
                                                Escaneja QR
                                            </Link>
                                        )}
                                        <button
                                            onClick={() => {
                                                logout();
                                                setUserMenuOpen(false);
                                            }}
                                            className="w-full text-left block px-4 py-2 text-gray-800 hover:bg-gray-100"
                                        >
                                            Tancar sessió
                                        </button>
                                    </div>
                                )}
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

            {/* Mobile Menu - Slide down panel */}
            {mobileMenuOpen && (
                <div 
                    ref={mobileMenuRef}
                    className="md:hidden bg-gray-900 text-white absolute w-full z-40 shadow-lg"
                >
                    <div className="p-4">
                        <nav>
                            <ul className="space-y-3">
                                <li>
                                    <a 
                                        href="/#intro" 
                                        className="flex items-center px-3 py-2 rounded-md hover:bg-gray-800"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <FaHome className="mr-3" />
                                        Inici
                                    </a>
                                </li>
                                <li>
                                    <a 
                                        href="/#reciclar" 
                                        className="flex items-center px-3 py-2 rounded-md hover:bg-gray-800"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <FaRecycle className="mr-3" />
                                        Com Reciclar
                                    </a>
                                </li>
                                <li>
                                    <a 
                                        href="/#mapa" 
                                        className="flex items-center px-3 py-2 rounded-md hover:bg-gray-800"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <FaMapMarkedAlt className="mr-3" />
                                        Mapa
                                    </a>
                                </li>
                                {isUser && (
                                    <li>
                                        <Link 
                                            to="/tasks" 
                                            className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            <FaQrcode className="mr-3" />
                                            Escaneja QR
                                        </Link>
                                    </li>
                                )}
                                {isAuthenticated && (
                                    <>
                                        <li>
                                            <Link 
                                                to="/profile" 
                                                className="flex items-center px-3 py-2 rounded-md hover:bg-gray-800"
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                <FaUser className="mr-3" />
                                                El meu perfil
                                            </Link>
                                        </li>
                                        <li>
                                            <button
                                                onClick={() => {
                                                    logout();
                                                    setMobileMenuOpen(false);
                                                }}
                                                className="flex items-center w-full px-3 py-2 rounded-md hover:bg-gray-800 text-white"
                                            >
                                                <FaSignOutAlt className="mr-3" />
                                                Tancar sessió
                                            </button>
                                        </li>
                                    </>
                                )}
                                {/* Only one Install button in mobile menu */}
                                <li className="mt-4">
                                    <button 
                                        onClick={handleInstallClick}
                                        className="flex items-center w-full px-3 py-3 bg-green-600 rounded-md hover:bg-green-700 text-white font-medium"
                                    >
                                        <FaDownload className="mr-3" />
                                        Instal·lar App al {installPlatform === 'mobile' ? 'Mòbil' : 'Escriptori'}
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>
            )}

            {/* Menú lateral desplegable - only for admin users */}
            {canMenu && menuOpen && (
                <aside
                    ref={menuRef}
                    className="fixed top-0 left-0 z-40 h-screen pt-16 transition-transform duration-300 bg-gray-900 text-white w-64 translate-x-0"
                >
                    <div className="h-full px-3 py-4 overflow-y-auto">
                        <ul className="space-y-2 font-medium">
                            {/* Menu for administrators/managers */}
                            {canMenu && (
                                <>
                                    <li>
                                        <Link 
                                            to="/gestor-dashboard" 
                                            className="flex items-center p-2 rounded-lg hover:bg-gray-800 group"
                                            onClick={() => toggleMenu()}
                                        >
                                            <FaChartBar className="w-5 h-5 text-gray-400 group-hover:text-white" />
                                            <span className="ml-3">Dashboard</span>
                                        </Link>
                                    </li>
                                    
                                    {/* Gestio dropdown with better styling */}
                                    <li>
                                        <button
                                            type="button"
                                            className="flex items-center w-full p-2 text-left rounded-lg hover:bg-gray-800 group"
                                            onClick={() => setGestionExpanded(!gestionExpanded)}
                                        >
                                            <MdManageAccounts className="w-5 h-5 text-gray-400 group-hover:text-white" />
                                            <span className="flex-1 ml-3 whitespace-nowrap">Gestió</span>
                                            {gestionExpanded ? 
                                                <FaChevronUp className="w-3 h-3" /> : 
                                                <FaChevronDown className="w-3 h-3" />
                                            }
                                        </button>
                                        {gestionExpanded && (
                                            <ul className="py-2 space-y-2 pl-4">
                                                <li>
                                                    <Link 
                                                        to="/gestor-usuaris" 
                                                        className="flex items-center p-2 rounded-lg hover:bg-gray-800 group"
                                                        onClick={() => toggleMenu()}
                                                    >
                                                        <FaUsers className="w-4 h-4 text-gray-400 group-hover:text-white" />
                                                        <span className="ml-3">Usuaris</span>
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link 
                                                        to="/gestor-contenedors" 
                                                        className="flex items-center p-2 rounded-lg hover:bg-gray-800 group"
                                                        onClick={() => toggleMenu()}
                                                    >
                                                        <FaTrashAlt className="w-4 h-4 text-gray-400 group-hover:text-white" />
                                                        <span className="ml-3">Contenidors</span>
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link 
                                                        to="/gestor-zones" 
                                                        className="flex items-center p-2 rounded-lg hover:bg-gray-800 group"
                                                        onClick={() => toggleMenu()}
                                                    >
                                                        <FaRecycle className="w-4 h-4 text-gray-400 group-hover:text-white" />
                                                        <span className="ml-3">Zones</span>
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link 
                                                        to="/gestor-tiquets" 
                                                        className="flex items-center p-2 rounded-lg hover:bg-gray-800 group"
                                                        onClick={() => toggleMenu()}
                                                    >
                                                        <FaExclamationTriangle className="w-4 h-4 text-gray-400 group-hover:text-white" />
                                                        <span className="ml-3">Tiquets</span>
                                                    </Link>
                                                </li>
                                            </ul>
                                        )}
                                    </li>
                                </>
                            )}
                            
                            {/* Common options for all authenticated users */}
                            {isAuthenticated && (
                                <>
                                    <li className="border-t border-gray-700 pt-2 mt-2">
                                        <Link 
                                            to="/profile" 
                                            className="flex items-center p-2 rounded-lg hover:bg-gray-800 group"
                                            onClick={() => toggleMenu()}
                                        >
                                            <FaUser className="w-5 h-5 text-gray-400 group-hover:text-white" />
                                            <span className="ml-3">El meu perfil</span>
                                        </Link>
                                    </li>
                                    <li>
                                        <button
                                            onClick={() => {
                                                logout();
                                                toggleMenu();
                                            }}
                                            className="flex items-center w-full p-2 text-left rounded-lg hover:bg-gray-800 group"
                                        >
                                            <FaSignOutAlt className="w-5 h-5 text-gray-400 group-hover:text-white" />
                                            <span className="ml-3">Tancar sessió</span>
                                        </button>
                                    </li>
                                </>
                            )}
                            
                            {/* Add Install button to admin menu too */}
                            {showInstallButton && (
                                <li className="border-t border-gray-700 pt-2 mt-2">
                                    <button
                                        onClick={() => {
                                            handleInstallClick();
                                            toggleMenu();
                                        }}
                                        className="flex items-center w-full p-2 text-left rounded-lg hover:bg-gray-800 group"
                                    >
                                        <FaDownload className="w-5 h-5 text-gray-400 group-hover:text-white" />
                                        <span className="ml-3">Instal·lar App</span>
                                    </button>
                                </li>
                            )}
                        </ul>
                    </div>
                </aside>
            )}

            {/* Manual Desktop Shortcut Instructions Modal */}
            {showManualShortcutInstructions && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Com crear un accés directe manualment</h3>
                            <button 
                                onClick={() => setShowManualShortcutInstructions(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <FaTimes />
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <p className="text-gray-600">
                                La descàrrega automàtica no ha funcionat. Pots crear un accés directe manualment seguint aquestes instruccions:
                            </p>
                            
                            <div className="bg-blue-50 p-4 rounded-lg mb-4">
                                <p className="text-blue-800 font-medium">Chrome:</p>
                                <ol className="list-decimal pl-5 space-y-2 mt-2">
                                    <li>Fes clic al menú de tres punts (⋮) a la cantonada superior dreta</li>
                                    <li>Selecciona "Més eines" i després "Crear accés directe"</li>
                                    <li>Marca la casella "Obrir com a finestra"</li>
                                    <li>Fes clic a "Crear"</li>
                                </ol>
                            </div>
                            
                            <div className="bg-blue-50 p-4 rounded-lg mb-4">
                                <p className="text-blue-800 font-medium">Firefox:</p>
                                <ol className="list-decimal pl-5 space-y-2 mt-2">
                                    <li>Fes clic dret a l'escriptori</li>
                                    <li>Selecciona "Nou" i després "Drecera"</li>
                                    <li>A l'ubicació de l'element, escriu <code>{window.location.href}</code></li>
                                    <li>Fes clic a "Següent"</li>
                                    <li>Escriu "ReciclamJA" com a nom i fes clic a "Finalitzar"</li>
                                </ol>
                            </div>
                            
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <p className="text-blue-800 font-medium">Safari i altres navegadors:</p>
                                <ol className="list-decimal pl-5 space-y-2 mt-2">
                                    <li>Crea un marcador d'aquesta pàgina (Ctrl+D o ⌘+D)</li>
                                    <li>Copia aquesta URL: <code className="bg-gray-100 px-2 py-1 rounded">{window.location.href}</code></li>
                                    <li>A l'escriptori, fes clic dret i selecciona "Nou" → "Document de text"</li>
                                    <li>Enganxa aquest codi:
                                        <pre className="bg-gray-100 p-2 rounded mt-2 overflow-x-auto text-sm">
                                            {`<html>
<head>
<meta http-equiv="refresh" content="0; url=${window.location.href}">
<title>ReciclamJA</title>
</head>
<body></body>
</html>`}
                                        </pre>
                                    </li>
                                    <li>Guarda-ho com "ReciclamJA.html"</li>
                                </ol>
                            </div>
                            
                            <div className="mt-6 flex flex-col gap-3">
                                <button
                                    onClick={() => {
                                        setShowManualShortcutInstructions(false);
                                        downloadDesktopShortcut(); // Try download again
                                    }}
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                >
                                    Tornar a provar la descàrrega
                                </button>
                                
                                <button
                                    onClick={() => setShowManualShortcutInstructions(false)}
                                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                                >
                                    Tancar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Existing Installation Instructions Modal */}
            {installInstructions && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Com instal·lar ReciclamJA</h3>
                            <button 
                                onClick={() => setInstallInstructions(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <FaTimes />
                            </button>
                        </div>
                        
                        {installPlatform === 'mobile' ? (
                            <div className="space-y-4">
                                <h4 className="font-medium text-lg">Instruccions per a dispositius mòbils:</h4>
                                
                                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                                    <p className="text-blue-800 font-medium">Android (Chrome):</p>
                                    <ol className="list-decimal pl-5 space-y-2 mt-2">
                                        <li>Toca el menú de tres punts (⋮) a la part superior dreta</li>
                                        <li>Selecciona "Instal·lar aplicació" o "Afegir a la pantalla d'inici"</li>
                                        <li>Segueix les instruccions per completar la instal·lació</li>
                                    </ol>
                                </div>
                                
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <p className="text-blue-800 font-medium">iPhone/iPad (Safari):</p>
                                    <ol className="list-decimal pl-5 space-y-2 mt-2">
                                        <li>Toca el botó de compartir (□↑) a la part inferior</li>
                                        <li>Desplaça't fins trobar i toca "Afegir a la pantalla d'inici"</li>
                                        <li>Toca "Afegir" per confirmar</li>
                                    </ol>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <h4 className="font-medium text-lg">Instruccions per a ordinadors:</h4>
                                
                                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                                    <p className="text-blue-800 font-medium">Chrome:</p>
                                    <ol className="list-decimal pl-5 space-y-2 mt-2">
                                        <li>Fes clic al menú de tres punts (⋮) a la cantonada superior dreta</li>
                                        <li>Selecciona "Instal·lar ReciclamJA..." o "Més eines → Crear accés directe"</li>
                                        <li>Marca "Obrir com a finestra" per tenir una experiència d'app</li>
                                        <li>Fes clic a "Instal·lar" o "Crear"</li>
                                    </ol>
                                </div>
                                
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <p className="text-blue-800 font-medium">Altres navegadors:</p>
                                    <ol className="list-decimal pl-5 space-y-2 mt-2">
                                        <li>Crea un marcador d'aquesta pàgina (Ctrl+D o ⌘+D)</li>
                                        <li>Per a accés directe a l'escriptori: arrossega l'adreça URL des de la barra d'adreces fins al teu escriptori</li>
                                    </ol>
                                </div>
                            </div>
                        )}
                        
                        <div className="mt-6">
                            <button
                                onClick={() => setInstallInstructions(false)}
                                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 w-full"
                            >
                                Tancar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}