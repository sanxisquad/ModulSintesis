import { useEffect, useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { getUserProfile } from '../../api/auth.api'; 
import { useNavigate } from 'react-router-dom';

export const ProfileView = () => {
    const { isAuthenticated, user } = useAuth();
    const [profile, setProfile] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            getUserProfile()
                .then((response) => {
                    setProfile(response.data);
                })
                .catch((error) => {
                    console.error("Error fetching profile:", error);
                });
        } else {
            navigate('/login'); 
        }
    }, [isAuthenticated, navigate]);

    if (!isAuthenticated) {
        return null; 
    }

    return (
        <div>
            {profile ? (
                <div className="mt-15 max-w-xl mx-auto p-4 bg-zinc-800 rounded-lg shadow-lg">
                    
                    <h1 className="text-2xl font-bold text-white-500 mb-4 ml-20">{profile.username}</h1>
                    <hr />
                    <div className="mt-4 font-semibold text-white">
                        <p>Name: {profile.first_name}</p>
                        <p>Email: {profile.email}</p>
                        {/* Muestra más detalles del perfil */}
                    </div>
                </div>
            ) : (
                <p>Loading profile...</p>
            )}
        </div>
    );
};