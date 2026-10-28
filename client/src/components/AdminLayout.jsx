import { useCallback, useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import api from '../api/axios';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';

export default function AdminLayout() {
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

  const nav = (
    <>
       <NavLink to="/admin/about">About Us</NavLink>
      <NavLink to="/admin" end>
        Entries
      </NavLink>
      <NavLink to="/admin/add-entry">Add Entry</NavLink>
      <NavLink to="/admin/customers">
        Customers
        {pendingCount > 0 && <span className="count-badge">{pendingCount}</span>}
      </NavLink>
         
    </>
  );

  return (
    <div className="app-shell">
      <SiteHeader nav={nav} />
      <main className="page">
        <Outlet context={{ refreshPending }} />
      </main>
      <SiteFooter />
    </div>
  );
}