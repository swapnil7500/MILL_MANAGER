import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/admin/Dashboard';
import AddEntry from './pages/admin/AddEntry';
import Customers from './pages/admin/Customers';
import About from './pages/About';
import MyEntries from './pages/customer/MyEntries';
import CustomerAbout from './pages/customer/CustomerAbout';

// "/" sends each person to the right place
function Home() {
  const { user, loading } = useAuth();
  if (loading) return <p className="center">Loading...</p>;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'admin' ? '/admin' : '/my-entries'} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="add-entry" element={<AddEntry />} />
        <Route path="customers" element={<Customers />} />
        <Route path="about" element={<About />} />
      </Route>

      <Route
        path="/my-entries"
        element={
          <ProtectedRoute role="customer">
            <MyEntries />
          </ProtectedRoute>
        }
      />
      <Route
        path="/about"
        element={
          <ProtectedRoute role="customer">
            <CustomerAbout />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}