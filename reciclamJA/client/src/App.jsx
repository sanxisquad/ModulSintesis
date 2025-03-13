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

function App() {
  return (
    <MenuProvider>
      <div className="container size-full">
        <Navigation /> {/* La navegación ahora usa el contexto */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/users-create" element={<UserFormPage />} />
          <Route path="/users/:id" element={<UserFormPage />} />
          <Route path="/register" element={<RegisterFormPage />} />
          <Route path="/login" element={<LoginFormPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/contenedors-create" element={<ContenedorFormPage />} />
          <Route path="/contenedors" element={<ContenedorsPage />} />
          <Route path="/contenedor/:id" element={<ContenedorFormPage />} />
          <Route path="/gestor-dashboard" element={<DashBoard />} />
          <Route path="/gestor-contenedors" element={<GestorContenedors />} />
        </Routes>
        <Toaster />
      </div>
    </MenuProvider>
  );
}

export default App;
