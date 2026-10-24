import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { todayISO } from '../../utils/format';

const ITEM_SUGGESTIONS = {
  flour: ['Wheat', 'Gram', 'Maize', 'Bajra', 'Barley', 'Rice'],
  oil: ['Mustard seed', 'Sesame', 'Groundnut'],
};

const emptyEntry = () => ({
  serviceType: 'flour',
  itemName: '',
  weightKg: '',
  date: todayISO(),
  amount: '',
  paid: false,
  comment: '',
});

export default function AddEntry() {
  const [customers, setCustomers] = useState([]);
  const [mode, setMode] = useState('existing'); // 'existing' or 'new'
  const [search, setSearch] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', address: '' });
  const [form, setForm] = useState(emptyEntry());
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .get('/customers')
      .then((res) => setCustomers(res.data.customers))
      .catch(() => setError('Could not load customers'));
  }, []);

  const filtered = customers.filter((c) => {
    const q = search.trim().toLowerCase();
    return !q || c.name.toLowerCase().includes(q) || c.phone.includes(q);
  });

  const handleForm = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleNewCustomer = (e) =>
    setNewCustomer({ ...newCustomer, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (mode === 'existing' && !customerId) {
      setError('Please select a customer');
      return;
    }

    setSubmitting(true);
    let id = customerId;

    try {
      // Step 1: create the walk-in customer first, if needed
      if (mode === 'new') {
        const res = await api.post('/customers', {
          name: newCustomer.name,
          phone: newCustomer.phone.trim(),
          address: newCustomer.address,
        });
        const created = res.data.customer;
        id = created._id;
        setCustomers((prev) => [...prev, created]);
        setCustomerId(created._id);
        setMode('existing'); // if saving the entry fails, a retry won't create the customer twice
        setNewCustomer({ name: '', phone: '', address: '' });
      }

      // Step 2: save the entry
      const res = await api.post('/entries', {
        customerId: id,
        serviceType: form.serviceType,
        itemName: form.itemName,
        weightKg: form.weightKg,
        date: form.date === todayISO() ? undefined : form.date, // today = use the current time
        amount: form.amount,
        paid: form.paid,
        comment: form.comment,
      });

      setSuccess(`Entry #${res.data.entry.serialNo} saved`);
      setForm(emptyEntry());
    } catch (err) {
      setError(err.response?.data?.message || 'Could not connect to the server');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2>Add Entry</h2>

      {success && (
        <div className="alert success">
          {success}. <Link to="/admin">View entries</Link>
        </div>
      )}
      {error && <div className="alert error">{error}</div>}

      <form className="form-card" onSubmit={handleSubmit}>
        <h3>Customer</h3>
        <div className="tabs">
          <button
            type="button"
            className={mode === 'existing' ? 'tab active' : 'tab'}
            onClick={() => setMode('existing')}
          >
            Existing customer
          </button>
          <button
            type="button"
            className={mode === 'new' ? 'tab active' : 'tab'}
            onClick={() => setMode('new')}
          >
            New customer
          </button>
        </div>

        {mode === 'existing' ? (
          <>
            <input
              placeholder="Search by name or phone"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
              <option value="">-- Select customer --</option>
              {filtered.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} - {c.phone}
                </option>
              ))}
            </select>
          </>
        ) : (
          <>
            <label>Name</label>
            <input name="name" value={newCustomer.name} onChange={handleNewCustomer} required />
            <label>Phone number</label>
            <input
              name="phone"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              pattern="[6-9][0-9]{9}"
              title="Enter a 10-digit mobile number"
              value={newCustomer.phone}
              onChange={handleNewCustomer}
              required
            />
            <label>Address (optional)</label>
            <input name="address" value={newCustomer.address} onChange={handleNewCustomer} />
          </>
        )}

        <h3>Work details</h3>

        <label>Service</label>
        <select name="serviceType" value={form.serviceType} onChange={handleForm}>
          <option value="flour">Flour Mill</option>
          <option value="oil">Oil Extraction</option>
        </select>

        <label>Item</label>
        <input
          name="itemName"
          list="item-list"
          value={form.itemName}
          onChange={handleForm}
          placeholder="e.g. Wheat"
          required
        />
        <datalist id="item-list">
          {ITEM_SUGGESTIONS[form.serviceType].map((i) => (
            <option key={i} value={i} />
          ))}
        </datalist>

        <label>Weight (kg)</label>
        <input
          name="weightKg"
          type="number"
          step="0.01"
          min="0.01"
          value={form.weightKg}
          onChange={handleForm}
          required
        />

        <label>Date</label>
        <input name="date" type="date" value={form.date} onChange={handleForm} required />

        <label>Amount ₹ (optional)</label>
        <input
          name="amount"
          type="number"
          min="0"
          value={form.amount}
          onChange={handleForm}
        />

        <label className="check">
          <input name="paid" type="checkbox" checked={form.paid} onChange={handleForm} />
          Paid
        </label>

        <label>Comment (optional, the customer can see it)</label>
        <textarea name="comment" rows={2} value={form.comment} onChange={handleForm} />

        <button type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : 'Save entry'}
        </button>
      </form>
    </div>
  );
}