import { useEffect, useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { getUserProfile, updateUserProfile } from '../../api/auth.api';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaMapMarkerAlt, FaBuilding, FaTrophy, FaMedal, FaEdit, 
         FaSave, FaTimes, FaEye, FaEyeSlash, FaLock, FaIdCard, FaSignOutAlt } from 'react-icons/fa';
import { UserTickets } from './UserTickets';
import { VirtualBags } from '../recycling/VirtualBags';
import { UserRedemptions } from './UserRedemptions';
import { usePermissions } from '../../../hooks/usePermissions';
import { toast } from 'react-hot-toast';

export const ProfileView = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const { isUser, isGestor, isAdmin, isSuperAdmin } = usePermissions();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            setLoading(true);
            getUserProfile()
                .then((response) => {
                    setProfile(response.data);
                    setFormData({
                        email: response.data.email,
                        CP: response.data.CP || '',
                        first_name: response.data.first_name || '',
                        last_name: response.data.last_name || '',
                        password: '',
                        confirmPassword: '',
                    });
                    setLoading(false);
                })
                .catch((error) => {
                    console.error("Error fetching profile:", error);
                    setLoading(false);
                });
        } else {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        
        // Clear password error when either password field changes
        if (name === 'password' || name === 'confirmPassword') {
            setPasswordError('');
        }
    };

    const validatePassword = () => {
        // Skip validation if both fields are empty (user isn't changing password)
        if (!formData.password && !formData.confirmPassword) {
            return true;
        }
        
        // Check if passwords match
        if (formData.password !== formData.confirmPassword) {
            setPasswordError('Les contrasenyes no coincideixen');
            return false;
        }
        
        // Check password length
        if (formData.password.length < 8) {
            setPasswordError('La contrasenya ha de tenir almenys 8 caràcters');
            return false;
        }
        
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate passwords if entered
        if (!validatePassword()) {
            return;
        }
        
        // Create submission data (omit confirmPassword)
        const submissionData = {
            email: formData.email,
            CP: formData.CP,
            first_name: formData.first_name,
            last_name: formData.last_name,
        };
        
        // Only include password if it was entered
        if (formData.password) {
            submissionData.password = formData.password;
        }
        
        try {
            const response = await updateUserProfile(submissionData);
            setProfile({...profile, ...response.data});
            setEditing(false);
            toast.success('Perfil actualitzat correctament');
            
            // Reset password fields
            setFormData({
                ...formData,
                password: '',
                confirmPassword: ''
            });
        } catch (error) {
            console.error("Error updating profile:", error);
            if (error.response?.data?.password) {
                // Handle Django password validation errors
                setPasswordError(error.response.data.password[0]);
            } else {
                toast.error("Error al actualitzar el perfil");
            }
        }
    };

    // Determine user level based on points
    const getUserLevel = (score) => {
        if (score >= 2000) return { level: "Expert", color: "text-amber-500" };
        if (score >= 1000) return { level: "Avançat", color: "text-blue-500" };
        if (score >= 600) return { level: "Intermedi", color: "text-green-500" };
        return { level: "Principiant", color: "text-gray-500" };
    };

    const userLevel = profile?.score ? getUserLevel(profile.score) : { level: "Principiant", color: "text-gray-500" };

    if (!isAuthenticated) {
        return null;
    }

    if (loading) {
        return (
            <div className="container mx-auto p-4 max-w-6xl">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500"></div>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="container mx-auto p-4 max-w-6xl">
                <div className="bg-white p-4 rounded-lg shadow text-center">
                    <p>No s'ha trobat informació del perfil.</p>
                </div>
            </div>
        );
    }

    // Render admin/manager profile view
    if (!isUser) {
        return (
            <div className="container mx-auto p-4 max-w-6xl">
                {/* Business-like header */}
                <div className="bg-gray-800 rounded-lg shadow-lg p-6 text-white">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="h-24 w-24 rounded-full bg-gray-700 flex items-center justify-center text-white">
                            <FaUser className="h-12 w-12" />
                        </div>
                        <div className="text-center md:text-left">
                            <h1 className="text-3xl font-bold">{profile.username}</h1>
                            <p className="text-gray-300">{profile.email}</p>
                            <div className="flex items-center justify-center md:justify-start mt-2">
                                {isAdmin && <span className="bg-blue-600 text-white text-sm px-3 py-1 rounded-full">Administrador</span>}
                                {isGestor && <span className="bg-green-600 text-white text-sm px-3 py-1 rounded-full ml-2">Gestor</span>}
                                {isSuperAdmin && <span className="bg-purple-600 text-white text-sm px-3 py-1 rounded-full ml-2">Super Admin</span>}
                            </div>
                        </div>
                        {!editing && (
                            <button 
                                onClick={() => setEditing(true)}
                                className="md:ml-auto bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg flex items-center"
                            >
                                <FaEdit className="mr-2" /> Editar Perfil
                            </button>
                        )}
                    </div>
                </div>

                {/* User Details Section */}
                <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                    {editing ? (
                        <form onSubmit={handleSubmit}>
                            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
                                <span>Editar Perfil</span>
                            </h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="first_name">
                                        Nom
                                    </label>
                                    <input
                                        id="first_name"
                                        name="first_name"
                                        type="text"
                                        value={formData.first_name}
                                        onChange={handleInputChange}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="last_name">
                                        Cognoms
                                    </label>
                                    <input
                                        id="last_name"
                                        name="last_name"
                                        type="text"
                                        value={formData.last_name}
                                        onChange={handleInputChange}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                                        Correu electrònic
                                    </label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="CP">
                                        Codi Postal
                                    </label>
                                    <input
                                        id="CP"
                                        name="CP"
                                        type="text"
                                        value={formData.CP}
                                        onChange={handleInputChange}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    />
                                </div>
                            </div>
                            
                            {/* Password change section */}
                            <div className="mt-6 border-t pt-4">
                                <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                                    <FaLock className="mr-2 text-green-600" /> Canviar contrasenya
                                </h3>
                                <p className="text-sm text-gray-500 mb-4">Deixa aquests camps en blanc si no vols canviar la contrasenya</p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="mb-4">
                                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                                            Nova contrasenya
                                        </label>
                                        <div className="relative">
                                            <input
                                                id="password"
                                                name="password"
                                                type={showPassword ? "text" : "password"}
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline pr-10"
                                                placeholder="Mínim 8 caràcters"
                                            />
                                            <button 
                                                type="button"
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-500"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
                                            Confirmar contrasenya
                                        </label>
                                        <div className="relative">
                                            <input
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                type={showPassword ? "text" : "password"}
                                                value={formData.confirmPassword}
                                                onChange={handleInputChange}
                                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline pr-10"
                                                placeholder="Repeteix la contrasenya"
                                            />
                                            <button 
                                                type="button"
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-500"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                
                                {passwordError && (
                                    <div className="text-red-500 text-sm mt-1 mb-4">
                                        {passwordError}
                                    </div>
                                )}
                            </div>
                            
                            {/* Moved buttons to bottom */}
                            <div className="mt-8 pt-6 border-t flex justify-between">
                                <button 
                                    type="button" 
                                    className="text-white bg-gray-500 px-4 py-2 rounded-lg flex items-center"
                                    onClick={() => setEditing(false)}
                                >
                                    <FaTimes className="mr-2" /> Cancelar
                                </button>
                                
                                <button 
                                    type="submit" 
                                    className="text-white bg-green-600 px-4 py-2 rounded-lg flex items-center"
                                >
                                    <FaSave className="mr-2" /> Guardar
                                </button>
                            </div>
                        </form>
                    ) : (
                        <>
                            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Informació Detallada</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center">
                                    <FaUser className="mr-3 text-gray-500" />
                                    <div>
                                        <p className="text-sm text-gray-500">Nom d'usuari</p>
                                        <p className="font-medium">{profile.username}</p>
                                    </div>
                                </div>
                                {(profile.first_name || profile.last_name) && (
                                    <div className="flex items-center">
                                        <FaIdCard className="mr-3 text-gray-500" />
                                        <div>
                                            <p className="text-sm text-gray-500">Nom complert</p>
                                            <p className="font-medium">
                                                {profile.first_name} {profile.last_name}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-center">
                                    <FaEnvelope className="mr-3 text-gray-500" />
                                    <div>
                                        <p className="text-sm text-gray-500">Correu electrònic</p>
                                        <p className="font-medium">{profile.email}</p>
                                    </div>
                                </div>
                                {profile.CP && (
                                    <div className="flex items-center">
                                        <FaMapMarkerAlt className="mr-3 text-gray-500" />
                                        <div>
                                            <p className="text-sm text-gray-500">Codi Postal</p>
                                            <p className="font-medium">{profile.CP}</p>
                                        </div>
                                    </div>
                                )}
                                {profile.empresa && (
                                    <div className="flex items-center">
                                        <FaBuilding className="mr-3 text-gray-500" />
                                        <div>
                                            <p className="text-sm text-gray-500">Empresa</p>
                                            <p className="font-medium">{profile.empresa.nom}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        );

    }

    // Render regular user profile view (gamified with points and achievements)
    return (
        <div className="container mx-auto p-4 max-w-6xl">
            <div className="space-y-8">
                {/* Header with profile summary */}
                <div className="bg-gradient-to-r from-green-700 to-green-500 rounded-lg shadow-lg p-6 text-white">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="relative">
                            <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center text-green-500">
                                <FaUser className="h-12 w-12" />
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-amber-500 rounded-full h-10 w-10 flex items-center justify-center text-white font-bold shadow-lg">
                                <FaTrophy className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="text-center md:text-left">
                            <h1 className="text-3xl font-bold">{profile.username}</h1>
                            <p className="text-green-100">{profile.email}</p>
                            <div className="flex items-center justify-center md:justify-start mt-2">
                                <FaMedal className={`w-5 h-5 ${userLevel.color}`} />
                                <span className={`ml-2 font-medium ${userLevel.color}`}>{userLevel.level} Reciclador</span>
                            </div>
                        </div>
                        <div className="md:ml-auto bg-white/20 py-3 px-6 rounded-lg backdrop-blur-sm">
                            <div className="text-center">
                                <div className="text-4xl font-bold">{profile.score || 0}</div>
                                <div className="text-sm text-green-100">Punts</div>
                            </div>
                        </div>
                        {!editing && (
                            <button 
                                onClick={() => setEditing(true)}
                                className="bg-white/20 hover:bg-white/30 py-2 px-4 rounded-lg flex items-center text-white"
                            >
                                <FaEdit className="mr-2" /> Editar Perfil
                            </button>
                        )}
                        <button 
                            onClick={() => logout()}
                            className="bg-red-500/20 hover:bg-red-500/30 py-2 px-4 rounded-lg flex items-center text-white"
                        >
                            <FaSignOutAlt className="mr-2" /> Tancar Sessió
                        </button>
                    </div>
                </div>

                {/* User Details Section */}
                {editing ? (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <form onSubmit={handleSubmit}>
                            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
                                <span>Editar Perfil</span>
                            </h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="first_name">
                                        Nom
                                    </label>
                                    <input
                                        id="first_name"
                                        name="first_name"
                                        type="text"
                                        value={formData.first_name}
                                        onChange={handleInputChange}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="last_name">
                                        Cognoms
                                    </label>
                                    <input
                                        id="last_name"
                                        name="last_name"
                                        type="text"
                                        value={formData.last_name}
                                        onChange={handleInputChange}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                                        Correu electrònic
                                    </label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="CP">
                                        Codi Postal
                                    </label>
                                    <input
                                        id="CP"
                                        name="CP"
                                        type="text"
                                        value={formData.CP}
                                        onChange={handleInputChange}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    />
                                </div>
                            </div>
                            
                            {/* Password change section */}
                            <div className="mt-6 border-t pt-4">
                                <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                                    <FaLock className="mr-2 text-green-600" /> Canviar contrasenya
                                </h3>
                                <p className="text-sm text-gray-500 mb-4">Deixa aquests camps en blanc si no vols canviar la contrasenya</p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="mb-4">
                                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                                            Nova contrasenya
                                        </label>
                                        <div className="relative">
                                            <input
                                                id="password"
                                                name="password"
                                                type={showPassword ? "text" : "password"}
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline pr-10"
                                                placeholder="Mínim 8 caràcters"
                                            />
                                            <button 
                                                type="button"
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-500"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
                                            Confirmar contrasenya
                                        </label>
                                        <div className="relative">
                                            <input
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                type={showPassword ? "text" : "password"}
                                                value={formData.confirmPassword}
                                                onChange={handleInputChange}
                                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline pr-10"
                                                placeholder="Repeteix la contrasenya"
                                            />
                                            <button 
                                                type="button"
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-500"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                
                                {passwordError && (
                                    <div className="text-red-500 text-sm mt-1 mb-4">
                                        {passwordError}
                                    </div>
                                )}
                            </div>
                            
                            {/* Moved buttons to bottom */}
                            <div className="mt-8 pt-6 border-t flex justify-between">
                                <button 
                                    type="button" 
                                    className="text-white bg-gray-500 px-4 py-2 rounded-lg flex items-center"
                                    onClick={() => setEditing(false)}
                                >
                                    <FaTimes className="mr-2" /> Cancelar
                                </button>
                                
                                <button 
                                    type="submit" 
                                    className="text-white bg-green-600 px-4 py-2 rounded-lg flex items-center"
                                >
                                    <FaSave className="mr-2" /> Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Detalls Personals</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center">
                                <FaUser className="mr-3 text-green-500" />
                                <div>
                                    <p className="text-sm text-gray-500">Nom d'usuari</p>
                                    <p className="font-medium">{profile.username}</p>
                                </div>
                            </div>
                            {(profile.first_name || profile.last_name) && (
                                <div className="flex items-center">
                                    <FaIdCard className="mr-3 text-green-500" />
                                    <div>
                                        <p className="text-sm text-gray-500">Nom complert</p>
                                        <p className="font-medium">
                                            {profile.first_name} {profile.last_name}
                                        </p>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-center">
                                <FaEnvelope className="mr-3 text-green-500" />
                                <div>
                                    <p className="text-sm text-gray-500">Correu electrònic</p>
                                    <p className="font-medium">{profile.email}</p>
                                </div>
                            </div>
                            {profile.CP && (
                                <div className="flex items-center">
                                    <FaMapMarkerAlt className="mr-3 text-green-500" />
                                    <div>
                                        <p className="text-sm text-gray-500">Codi Postal</p>
                                        <p className="font-medium">{profile.CP}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Progress and Achievements - Only show if not editing */}
                {!editing && (
                    <>
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Progrés i Assoliments</h2>
                            
                            <div className="mb-4">
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm font-medium">
                                        {profile.total_score >= 2000 
                                            ? `Nivell Expert` 
                                            : `Nivell ${Math.floor(profile.total_score / 300) + 1}`
                                        }
                                    </span>
                                    <span className="text-sm font-medium">
                                        {profile.total_score >= 2000 
                                            ? `${profile.total_score} punts` 
                                            : `${profile.total_score} / ${(Math.floor(profile.total_score / 300) + 1) * 300} punts`
                                        }
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div 
                                        className="bg-green-500 h-2.5 rounded-full" 
                                        style={{ width: profile.total_score >= 2000 
                                            ? '100%' 
                                            : `${(profile.total_score % 300) / 300 * 100}%` 
                                        }}
                                    ></div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                                <div className={`p-4 rounded-lg border ${profile.total_score >= 300 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                                    <div className="text-center">
                                        <div className={`inline-block p-3 rounded-full ${profile.total_score >= 300 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                            <FaMedal className="h-6 w-6" />
                                        </div>
                                        <h3 className="font-medium mt-2">Nivell 1</h3>
                                        <p className="text-sm text-gray-500">300 punts</p>
                                    </div>
                                </div>
                                <div className={`p-4 rounded-lg border ${profile.total_score >= 600 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                                    <div className="text-center">
                                        <div className={`inline-block p-3 rounded-full ${profile.total_score >= 600 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                            <FaMedal className="h-6 w-6" />
                                        </div>
                                        <h3 className="font-medium mt-2">Nivell 2</h3>
                                        <p className="text-sm text-gray-500">600 punts</p>
                                    </div>
                                </div>
                                <div className={`p-4 rounded-lg border ${profile.total_score >= 1000 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                                    <div className="text-center">
                                        <div className={`inline-block p-3 rounded-full ${profile.total_score >= 1000 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                            <FaMedal className="h-6 w-6" />
                                        </div>
                                        <h3 className="font-medium mt-2">Nivell 3</h3>
                                        <p className="text-sm text-gray-500">1000 punts</p>
                                    </div>
                                </div>
                                <div className={`p-4 rounded-lg border ${profile.total_score >= 2000 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                                    <div className="text-center">
                                        <div className={`inline-block p-3 rounded-full ${profile.total_score >= 2000 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                            <FaTrophy className="h-6 w-6" />
                                        </div>
                                        <h3 className="font-medium mt-2">Expert</h3>
                                        <p className="text-sm text-gray-500">2000 punts</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Add the Virtual Bags component here */}
                        <VirtualBags />
                        
                        {/* Add UserRedemptions component before UserTickets */}
                        <UserRedemptions />
                        
                        {/* Always display the UserTickets component */}
                        <UserTickets />
                    </>
                )}
            </div>
        </div>
    );
};