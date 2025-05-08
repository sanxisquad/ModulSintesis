import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { UsersPage } from './pages/Users/UsersPage';
import { UserFormPage } from './pages/Users/UserFormPage';
import { RegisterFormPage } from './pages/auth/RegisterFormPage';
import { Navigation } from './components/layout/Navigation';
import { LoginFormPage } from './pages/auth/LoginFormPage';
import { ProfilePage } from './pages/Profile/ProfilePage';
import { HomePage } from './pages/main/HomePage';
import { ContenedorFormPage } from './pages/zr/ContenedorFormPage';
import { ContenedorPage } from './pages/zr/ContenedorPage';
import { DashBoard } from './pages/gestor/DashBoard';
import { Toaster } from 'react-hot-toast';
import { MenuProvider } from './context/MenuContext';
import { GestorContenedors } from './pages/gestor/GestorContenedors';
import { GestorZona } from './pages/gestor/GestorZonesReciclatge';
import { ZonaFormPage } from './pages/zr/ZonaReciclatgeFormPage';
import { GestorUsuaris } from './pages/gestor/GestorUsuaris';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Unauthorized } from './pages/auth/Unauthorized';
import { ZonaContenedoresView } from './components/zr/ZonaContenedoresView';
import { GestioTiquets } from './pages/gestor/GestioTiquets';

import { ConfirmDialogProvider } from './components/common/ConfirmDialog';

function App() {
  return (
    <ConfirmDialogProvider>
      <MenuProvider>
        <div className="w-screen h-screen flex flex-col">
          <Navigation />
          <div className="flex-1 overflow-auto">
            <Routes>
              {/* TOTS */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginFormPage />} />
              <Route path="/register" element={<RegisterFormPage />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* LOGUEJATS */}
              <Route element={<ProtectedRoute allowedRoles={["isUser", "isGestor", "isAdmin", "isSuperAdmin"]} />}> 
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/zona/:id" element={<ZonaFormPage />} />
                <Route path="/contenedor/:id" element={<ContenedorFormPage />} />
              </Route>

              {/* SUPERADMIN GESTOR ADMIN */}
              <Route element={<ProtectedRoute allowedRoles={["isGestor", "isAdmin", "isSuperAdmin"]} />}> 
                <Route path="/gestor-usuaris" element={<GestorUsuaris />} />
                <Route path="/users-create" element={<UserFormPage />} />
                <Route path="/users/:id" element={<UserFormPage />} />
                <Route path="/contenedors-create" element={<ContenedorFormPage />} />
                <Route path="/zones-create" element={<ZonaFormPage />} />
                <Route path="/contenedors" element={<ContenedorPage />} />
                <Route path="/gestor-dashboard" element={<DashBoard />} />
                <Route path="/gestor-contenedors" element={<GestorContenedors />} />
                <Route path="/gestor-zones" element={<GestorZona />} />
                <Route path="/zones/:id/contenedores" element={<ZonaContenedoresView />} />
                <Route path="/gestor-tiquets" element={<GestioTiquets />} />
              </Route>
            </Routes>
          </div>
          <Toaster />
        </div>
      </MenuProvider>
    </ConfirmDialogProvider>
  );
}

export default App;