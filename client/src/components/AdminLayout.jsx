import { useCallback, useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);

  const refreshPending = useCallback(async () => {
    try {
      const res = await api.get('/customers/pending');
      setPendingCount(res.data.requests.length);
    } catch {
      // the badge is optional, so ignore errors
    }
  }, []);

  useEffect(() => {
    refreshPending();
  }, [refreshPending]);

  return (
    <div>
      <header className="topbar">
               <span className="brand-wrap">
          <img src="/favicon.svg" alt="" className="brand-icon" />
          <strong className="brand">Gupta Mill</strong>
        </span>
        <nav>
          <NavLink to="/admin" end>
            Entries
          </NavLink>
          <NavLink to="/admin/add-entry">Add Entry</NavLink>
          <NavLink to="/admin/customers">
            Customers
            {pendingCount > 0 && <span className="count-badge">{pendingCount}</span>}
          </NavLink>
        </nav>
        <div className="topbar-right">
          <span className="muted">{user.name}</span>
          <button className="btn-small" onClick={logout}>
            Log out
          </button>
        </div>
      </header>

      <main className="page">
        <Outlet context={{ refreshPending }} />
      </main>
    </div>
  );
}