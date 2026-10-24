import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', phone: '', address: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const message = await register({ ...form, phone: form.phone.trim() });
      setSuccess(message);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not connect to the server');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="card">
          <h2>Request sent</h2>
          <div className="alert success">{success}</div>
          <Link to="/login">Back to login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <form className="card" onSubmit={handleSubmit}>
                <img src="/logo.svg" alt="Mill Records" className="logo-img" />
        <p className="muted">The owner will approve your account</p>

        {error && <div className="alert error">{error}</div>}

        <label>Full name</label>
        <input name="name" value={form.name} onChange={handleChange} required />

        <label>Phone number</label>
        <input
          name="phone"
          type="tel"
          inputMode="numeric"
          maxLength={10}
          value={form.phone}
          onChange={handleChange}
          placeholder="10-digit mobile number"
          required
        />

        <label>Address (optional)</label>
        <input name="address" value={form.address} onChange={handleChange} />

        <label>Password (min 6 characters)</label>
        <input
          name="password"
          type="password"
          minLength={6}
          value={form.password}
          onChange={handleChange}
          required
        />

        <button type="submit" disabled={submitting}>
          {submitting ? 'Sending...' : 'Register'}
        </button>

        <p className="muted">
          Already registered? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}