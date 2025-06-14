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
import { TiquetView } from './components/tiquets/TiquetView';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import RecyclePage from "./pages/RecyclePage";
import { GestorPremios } from './pages/gestor/GestorPremios';
import { PrizesPage } from './pages/main/PrizesPage';
import { MediaTestPage } from './pages/MediaTestPage';
import { EstadistiquesGenerals } from './pages/EstadistiquesGenerals';
import { HomeStats } from './components/stats/HomeStats';

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
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password/:uid/:token" element={<ResetPasswordPage />} />

              {/* LOGUEJATS */}
              <Route element={<ProtectedRoute allowedRoles={["isUser", "isGestor", "isAdmin", "isSuperAdmin"]} />}> 
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/zona/:id" element={<ZonaFormPage />} />
                
              </Route>

              {/* SUPERADMIN GESTOR ADMIN - Pueden ver gestión de usuarios */}
              <Route element={<ProtectedRoute allowedRoles={["isGestor", "isAdmin", "isSuperAdmin"]} />}> 
                <Route path="/gestor-usuaris" element={<GestorUsuaris />} />
                <Route path="/contenedors-create" element={<ContenedorFormPage />} />
                <Route path="/zones-create" element={<ZonaFormPage />} />
                <Route path="/contenedors" element={<ContenedorPage />} />
                <Route path="/gestor-dashboard" element={<DashBoard />} />
                <Route path="/gestor-contenedors" element={<GestorContenedors />} />
                <Route path="/gestor-zones" element={<GestorZona />} />
                <Route path="/zones/:id/contenedores" element={<ZonaContenedoresView />} />
                <Route path="/gestor-tiquets" element={<GestioTiquets />} />
                <Route path="/gestor/tiquets/:id" element={<TiquetView />} />
                <Route path="/contenedor/:id" element={<ContenedorFormPage />} />
                <Route path="/gestor-premis" element={<GestorPremios />} />
              </Route>

              {/* SOLO ADMIN Y SUPERADMIN - Pueden crear y editar usuarios */}
              <Route element={<ProtectedRoute allowedRoles={["isAdmin", "isSuperAdmin"]} />}> 
                <Route path="/users-create" element={<UserFormPage />} />
                <Route path="/users/:id" element={<UserFormPage />} />
              </Route>

              {/* Rutas protegidas de usuario */}
              <Route path="/escaneig" element={<RecyclePage />} />
              <Route path="/premis" element={<PrizesPage />} />
              <Route path="/media-test" element={<MediaTestPage />} />
                <Route path="/estadistiques" element={<HomeStats />} />

            </Routes>
          </div>
          <Toaster />
        </div>
      </MenuProvider>
    </ConfirmDialogProvider>
  );
}

export default App;