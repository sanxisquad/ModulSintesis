import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';
import { TasksPage } from './pages/TasksPage';
import { TasksFormPage } from './pages/TasksFormPage';
import { UsersPage } from './pages/UsersPage';
import { UserFormPage } from './pages/UserFormPage';
import { RegisterFormPage } from './pages/RegisterFormPage';
import { Navigation } from './components/Navigation';
import { LoginFormPage } from './pages/LoginFormPage';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <BrowserRouter>
  <div className="container mx-auto">
  <Navigation />
    <Routes>
      <Route path="/" element={<Navigate to="/tasks" />} />
      <Route path="/tasks" element={<TasksPage />} />
      <Route path="/tasks-create" element={<TasksFormPage />} />
      <Route path="/tasks/:id" element={<TasksFormPage />} />
      <Route path="/users" element={<UsersPage />} />
      <Route path="/users-create" element={<UserFormPage />} />
      <Route path="/users/:id" element={<UserFormPage />} />
      <Route path="/register" element={<RegisterFormPage />} />
      <Route path="/login" element={<LoginFormPage />} />
    </Routes>
    <Toaster/>
  </div>
      
    </BrowserRouter>

  );
}
export default App;