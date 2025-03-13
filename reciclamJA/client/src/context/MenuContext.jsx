import React, { createContext, useContext, useState } from 'react';

// Crear contexto
const MenuContext = createContext();

export function useMenu() {
    return useContext(MenuContext);
}

export function MenuProvider({ children }) {
    const [menuOpen, setMenuOpen] = useState(false);

    const toggleMenu = () => setMenuOpen(!menuOpen);
    const closeMenu = () => setMenuOpen(false);

    return (
        <MenuContext.Provider value={{ menuOpen, toggleMenu, closeMenu }}>
            {children}
        </MenuContext.Provider>
    );
}
