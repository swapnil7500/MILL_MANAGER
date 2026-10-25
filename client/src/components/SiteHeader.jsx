import { useAuth } from '../context/AuthContext';
import Brand from './Brand';

export default function SiteHeader({ nav }) {
  const { user, logout } = useAuth();

  return (
    <>
      <header className={nav ? 'site-header' : 'site-header solo'}>
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
      {nav && <nav className="main-nav">{nav}</nav>}
    </>
  );
}