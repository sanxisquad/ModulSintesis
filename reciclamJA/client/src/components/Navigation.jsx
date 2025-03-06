import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export function Navigation() {
    const { isAuthenticated, user, logout } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    return (
        <div className="flex justify-between items-center py-3 bg-black-500 px-4">
            <Link to="/tasks">
                <h1 className="text-3xl font-bold text-green-500 mb-4 ml-20">
                    ReciclamJA
                </h1>
            </Link>
            <nav>
                <ul className="flex items-center">
                    <li className="inline-block mx-2">
                        <Link to="/users" className="text-white">Usuaris</Link>
                    </li>
                    {isAuthenticated ? (
                        <li className="relative inline-block mx-2">
                            <button
                                className="text-white focus:outline-none"
                                onClick={toggleDropdown}
                            >
                                {user?.username}
                            </button>
                            {dropdownOpen && (
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
    );
}