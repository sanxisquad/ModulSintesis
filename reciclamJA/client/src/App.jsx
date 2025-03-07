import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';
import { UsersPage } from './pages/UsersPage';
import { UserFormPage } from './pages/UserFormPage';
import { RegisterFormPage } from './pages/auth/RegisterFormPage';
import { Navigation } from './components/Navigation';
import { LoginFormPage } from './pages/auth/LoginFormPage';
import { ProfilePage } from './pages/Profile/ProfilePage';
import { HomePage } from './pages/HomePage';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
  <div className="container mx-auto">
  <Navigation />
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/users" element={<UsersPage />} />
      <Route path="/users-create" element={<UserFormPage />} />
      <Route path="/users/:id" element={<UserFormPage />} />
      <Route path="/register" element={<RegisterFormPage />} />
      <Route path="/login" element={<LoginFormPage />} />
      <Route path="/profile" element={<ProfilePage />} />
    </Routes>
    <Toaster/>
  </div>
      

  );
}
export default App;