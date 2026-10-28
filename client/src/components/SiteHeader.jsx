import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Brand from './Brand';

export default function SiteHeader({ nav }) {
  const { user, logout } = useAuth();

  // Customers get their own menu automatically. Admin pages pass their own nav.
  const menu =
    nav ||
    (user.role === 'customer' ? (
      <>
        <NavLink to="/my-entries" end>
          My Entries
        </NavLink>
        <NavLink to="/about">About Us</NavLink>
      </>
    ) : null);

  return (
    <>
      <header className={menu ? 'site-header' : 'site-header solo'}>
        <div className="top-strip">
          <span className="greet">
            Namaste, <strong>{user.name}</strong>
            {user.role === 'admin' ? ' (Owner)' : ''}
          </span>
          <button className="btn-small btn-ghost" onClick={logout}>
            Log out
          </button>
        </div>
        <div className="masthead">
          <Brand onDark />
        </div>
      </header>
      {menu && <nav className="main-nav">{menu}</nav>}
    </>
  );
}