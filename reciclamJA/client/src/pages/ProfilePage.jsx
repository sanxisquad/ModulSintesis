import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext'; 
import { getUserProfile } from '../api/auth.api'; 
import { useNavigate } from 'react-router-dom';
import { ProfileView } from "../components/profile/ProfileView";

export const ProfilePage = () => {
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
        <ProfileView />
    );
};