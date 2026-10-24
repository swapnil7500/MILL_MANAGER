import { useAuth } from '../../context/AuthContext';

export default function MyEntries() {
  const { user, logout } = useAuth();

  return (
    <div className="page">
      <h2>My Entries</h2>
      <p>Welcome, {user.name}</p>
      <p className="muted">Your work status and history come in Phase 6.</p>
      <button onClick={logout}>Log out</button>
    </div>
  );
}