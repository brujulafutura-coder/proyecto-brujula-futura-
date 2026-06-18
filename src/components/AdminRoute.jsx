import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0b0c10]">
        <div className="text-[#06b6d4]">Cargando seguridad...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.rol !== 'Administrador') {
    return <Navigate to="/home" replace />;
  }

  return children;
}
