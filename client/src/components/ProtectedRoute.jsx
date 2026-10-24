import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ role, children }) {
  const { user, loading } = useAuth();

  if (loading) return <p className="center">Loading...</p>;
  if (!user) return <Navigate to="/login" replace />;

  // Logged in but wrong role: send them to their own home page
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/my-entries'} replace />;
  }

  return children;
}