import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div>
      <header className="topbar">
        <strong className="brand">Mill Records</strong>
        <nav>
          <NavLink to="/admin" end>
            Entries
          </NavLink>
          <NavLink to="/admin/add-entry">Add Entry</NavLink>
        </nav>
        <div className="topbar-right">
          <span className="muted">{user.name}</span>
          <button className="btn-small" onClick={logout}>
            Log out
          </button>
        </div>
      </header>

      <main className="page">
        <Outlet />
      </main>
    </div>
  );
}