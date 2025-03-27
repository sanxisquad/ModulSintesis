import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { UsersPage } from './pages/UsersPage';
import { UserFormPage } from './pages/UserFormPage';
import { RegisterFormPage } from './pages/auth/RegisterFormPage';
import { Navigation } from './components/Navigation';
import { LoginFormPage } from './pages/auth/LoginFormPage';
import { ProfilePage } from './pages/Profile/ProfilePage';
import { HomePage } from './pages/HomePage';
import { ContenedorFormPage } from './pages/zr/ContenedorFormPage';
import { ContenedorsPage } from './pages/zr/ContenedorsPage';
import { DashBoard } from './pages/gestor/DashBoard';
import { Toaster } from 'react-hot-toast';
import { MenuProvider } from './context/MenuContext'; // Importar MenuProvider
import { GestorContenedors } from './pages/gestor/GestorContenedors';
import { GestorZona } from './pages/gestor/GestorZonesReciclatge';
import { ZonaFormPage } from './pages/zr/ZonaReciclatgeFormPage';
import { GestorUsuaris } from './pages/gestor/GestorUsuaris';

function App() {
  return (
    <MenuProvider>
      <div className="w-screen h-screen flex flex-col">
        <Navigation />
        <div className="flex-1 overflow-auto"> {/* La navegación ahora usa el contexto */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/gestor-usuaris" element={<GestorUsuaris />} />
          <Route path="/users-create" element={<UserFormPage />} />
          <Route path="/users/:id" element={<UserFormPage />} />
          <Route path="/register" element={<RegisterFormPage />} />
          <Route path="/login" element={<LoginFormPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/contenedors-create" element={<ContenedorFormPage />} />
          <Route path="/zones-create" element={<ZonaFormPage />} />
          <Route path="/contenedors" element={<ContenedorsPage />} />
          <Route path="/contenedor/:id" element={<ContenedorFormPage />} />
          <Route path="/gestor-dashboard" element={<DashBoard />} />
          <Route path="/gestor-contenedors" element={<GestorContenedors />} />
          <Route path="/gestor-zones" element={<GestorZona />} />
          <Route path="/zona/:id" element={<ZonaFormPage />} />
        </Routes>
        </div>
        <Toaster />
      </div>
    </MenuProvider>
  );
}

export default App;
