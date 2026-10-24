import { useCallback, useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../../api/axios';
import { formatDate } from '../../utils/format';

const ACCOUNT_LABELS = {
  'no-login': 'No login',
  pending: 'Pending approval',
  approved: 'Login active',
  rejected: 'Rejected',
};

function CustomerCard({ customer, onChanged }) {
  const [mode, setMode] = useState(''); // '' | 'edit' | 'password'
  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const startEdit = () => {
    setForm({ name: customer.name, phone: customer.phone, address: customer.address || '' });
    setError('');
    setMessage('');
    setMode('edit');
  };

  const startPassword = () => {
    setPassword('');
    setError('');
    setMessage('');
    setMode('password');
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.put(`/customers/${customer._id}`, form);
      setMode('');
      await onChanged();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.patch(`/customers/${customer._id}/password`, { password });
      setMode('');
      setMessage('Password updated. The customer can now log in with it.');
      await onChanged();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="entry-card">
      <div className="entry-top">
        <strong>{customer.name}</strong>
        <span className={`badge ${customer.accountStatus}`}>
          {ACCOUNT_LABELS[customer.accountStatus]}
        </span>
      </div>
      <div className="muted">
        {customer.phone}
        {customer.address ? ` · ${customer.address}` : ''}
      </div>

      {message && <div className="alert success">{message}</div>}
      {error && <div className="alert error">{error}</div>}

      {mode === 'edit' && (
        <form className="edit-form" onSubmit={saveEdit}>
          <label>Name</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <label>Phone number</label>
          <input
            type="tel"
            inputMode="numeric"
            maxLength={10}
            pattern="[6-9][0-9]{9}"
            title="Enter a 10-digit mobile number"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            required
          />
          <label>Address</label>
          <input
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
          <div className="entry-actions">
            <button type="submit" className="btn-small" disabled={saving}>
              Save
            </button>
            <button type="button" className="btn-small btn-light" onClick={() => setMode('')}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {mode === 'password' && (
        <form className="edit-form" onSubmit={savePassword}>
          <label>New password (min 6 characters)</label>
          <input
            type="text"
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <p className="muted">
            This also turns on the customer's login. Tell them the new password yourself.
          </p>
          <div className="entry-actions">
            <button type="submit" className="btn-small" disabled={saving}>
              Save password
            </button>
            <button type="button" className="btn-small btn-light" onClick={() => setMode('')}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {mode === '' && (
        <div className="entry-actions">
          <button type="button" className="btn-small btn-light" onClick={startEdit}>
            Edit details
          </button>
          <button type="button" className="btn-small btn-light" onClick={startPassword}>
            {customer.accountStatus === 'approved' ? 'Reset password' : 'Set password'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function Customers() {
  const { refreshPending } = useOutletContext();
  const [tab, setTab] = useState('all');
  const [customers, setCustomers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', phone: '', address: '', password: '' });
  const [addError, setAddError] = useState('');
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    try {
      const [all, pending] = await Promise.all([
        api.get('/customers'),
        api.get('/customers/pending'),
      ]);
      setCustomers(all.data.customers);
      setRequests(pending.data.requests);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load customers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const decide = async (id, action) => {
    if (action === 'reject' && !window.confirm('Reject this request?')) return;
    try {
      await api.patch(`/customers/${id}/${action}`);
      await load();
      await refreshPending();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  const addCustomer = async (e) => {
    e.preventDefault();
    setAddError('');
    setAdding(true);
    try {
      const body = { ...addForm, phone: addForm.phone.trim() };
      if (!body.password) delete body.password;
      await api.post('/customers', body);
      setAddForm({ name: '', phone: '', address: '', password: '' });
      setShowAdd(false);
      await load();
    } catch (err) {
      setAddError(err.response?.data?.message || 'Could not add customer');
    } finally {
      setAdding(false);
    }
  };

  const q = search.trim().toLowerCase();
  const filtered = customers.filter(
    (c) => !q || c.name.toLowerCase().includes(q) || c.phone.includes(q)
  );

  if (loading) return <p className="muted center">Loading...</p>;

  return (
    <div>
      <h2>Customers</h2>
      {error && <div className="alert error">{error}</div>}

      <div className="tabs">
        <button
          type="button"
          className={tab === 'all' ? 'tab active' : 'tab'}
          onClick={() => setTab('all')}
        >
          All customers ({customers.length})
        </button>
        <button
          type="button"
          className={tab === 'pending' ? 'tab active' : 'tab'}
          onClick={() => setTab('pending')}
        >
          Pending requests ({requests.length})
        </button>
      </div>

      {tab === 'pending' && (
        <div className="entry-list">
          {requests.length === 0 && <p className="muted center">No pending requests.</p>}
          {requests.map((r) => (
            <div className="entry-card" key={r._id}>
              <div className="entry-top">
                <strong>{r.name}</strong>
                <span className="muted">Requested {formatDate(r.updatedAt)}</span>
              </div>
              <div className="muted">
                {r.phone}
                {r.address ? ` · ${r.address}` : ''}
              </div>
              <p>
                {r.entryCount > 0
                  ? `${r.entryCount} existing ${r.entryCount === 1 ? 'entry is' : 'entries are'} saved under this phone number. Approving will show ${r.entryCount === 1 ? 'it' : 'them'} to this person.`
                  : 'No entries yet under this phone number.'}
              </p>
              <p className="muted">
                Approve only if you know this person, or call the number to confirm first.
              </p>
              <div className="entry-actions">
                <button
                  type="button"
                  className="btn-small btn-green"
                  onClick={() => decide(r._id, 'approve')}
                >
                  Approve
                </button>
                <button
                  type="button"
                  className="btn-small btn-red"
                  onClick={() => decide(r._id, 'reject')}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'all' && (
        <>
          <div className="filters">
            <input
              placeholder="Search name or phone"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="button" className="btn-small" onClick={() => setShowAdd((v) => !v)}>
              {showAdd ? 'Close' : '+ Add customer'}
            </button>
          </div>

          {showAdd && (
            <form className="form-card" onSubmit={addCustomer}>
              {addError && <div className="alert error">{addError}</div>}
              <label>Name</label>
              <input
                value={addForm.name}
                onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                required
              />
              <label>Phone number</label>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                pattern="[6-9][0-9]{9}"
                title="Enter a 10-digit mobile number"
                value={addForm.phone}
                onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                required
              />
              <label>Address (optional)</label>
              <input
                value={addForm.address}
                onChange={(e) => setAddForm({ ...addForm, address: e.target.value })}
              />
              <label>Password (optional, lets the customer log in right away)</label>
              <input
                type="text"
                minLength={6}
                value={addForm.password}
                onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
              />
              <button type="submit" disabled={adding}>
                {adding ? 'Saving...' : 'Add customer'}
              </button>
            </form>
          )}

          <div className="entry-list">
            {filtered.length === 0 && <p className="muted center">No customers found.</p>}
            {filtered.map((c) => (
              <CustomerCard key={c._id} customer={c} onChanged={load} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}