import { useState } from 'react';
import StatusBadge from './StatusBadge';
import { printSlip } from '../utils/printSlip';
import {
  STATUS_LIST,
  STATUS_LABELS,
  SERVICE_LABELS,
  formatDate,
  formatDateTime,
  toDateInput,
} from '../utils/format';

function EntryCard({ entry, onStatusChange, onAddComment, onUpdate, onDelete }) {
  const [showComments, setShowComments] = useState(false);
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);

  const submitComment = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSaving(true);
    const ok = await onAddComment(entry._id, text.trim());
    if (ok) setText('');
    setSaving(false);
  };

  const startEdit = () => {
    setForm({
      serviceType: entry.serviceType,
      itemName: entry.itemName,
      weightKg: entry.weightKg,
      date: toDateInput(entry.date),
      amount: entry.amount || '',
      paid: entry.paid,
    });
    setEditing(true);
  };

  const handleForm = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      serviceType: form.serviceType,
      itemName: form.itemName,
      weightKg: form.weightKg,
      amount: form.amount === '' ? 0 : form.amount,
      paid: form.paid,
    };
    // Only send the date if it was changed, so the original time is kept
    if (form.date !== toDateInput(entry.date)) payload.date = form.date;

    const ok = await onUpdate(entry._id, payload);
    setSaving(false);
    if (ok) setEditing(false);
  };

  const handleDelete = () => {
    const name = entry.customer?.name || 'this customer';
    if (window.confirm(`Delete entry #${entry.serialNo} for ${name}? This cannot be undone.`)) {
      onDelete(entry._id);
    }
  };

  const canMarkDone = entry.status === 'pending' || entry.status === 'in-progress';

  return (
        <div className={`entry-card ${entry.serviceType}`}>
      <div className="entry-top">
        <span className="serial">#{entry.serialNo}</span>
        <span className="muted">{formatDate(entry.date)}</span>
        <StatusBadge status={entry.status} />
      </div>

      <div className="entry-main">
        <div>
          <strong>{entry.customer?.name || 'Unknown customer'}</strong>
          <div className="muted">
            {entry.customer?.phone}
            {entry.customer?.address ? ` · ${entry.customer.address}` : ''}
          </div>
        </div>
        {!editing && (
          <div className="entry-item">
            <div>
              {entry.itemName} - <strong>{entry.weightKg} kg</strong>
            </div>
            <div className="muted">{SERVICE_LABELS[entry.serviceType]}</div>
          </div>
        )}
      </div>

      {editing ? (
        <form className="edit-form" onSubmit={saveEdit}>
          <label>Service</label>
          <select name="serviceType" value={form.serviceType} onChange={handleForm}>
            <option value="flour">Flour Mill</option>
            <option value="oil">Oil Extraction</option>
          </select>

          <label>Item</label>
          <input name="itemName" value={form.itemName} onChange={handleForm} required />

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

          <label>Amount ₹</label>
          <input name="amount" type="number" min="0" value={form.amount} onChange={handleForm} />

          <label className="check">
            <input name="paid" type="checkbox" checked={form.paid} onChange={handleForm} />
            Paid
          </label>

          <div className="entry-actions">
            <button type="submit" className="btn-small" disabled={saving}>
              {saving ? 'Saving...' : 'Save changes'}
            </button>
            <button
              type="button"
              className="btn-small btn-light"
              onClick={() => setEditing(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          {entry.amount > 0 && (
            <div className="muted">
              Amount: ₹{entry.amount} · {entry.paid ? 'Paid' : 'Not paid'}
            </div>
          )}

          <div className="entry-actions">
            <select
              value={entry.status}
              onChange={(e) => onStatusChange(entry._id, e.target.value)}
            >
              {STATUS_LIST.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>

            {canMarkDone && (
              <button
                type="button"
                className="btn-small btn-green"
                onClick={() => onStatusChange(entry._id, 'done')}
              >
                Mark done
              </button>
            )}

            <button
              type="button"
              className="btn-small btn-light"
              onClick={() => setShowComments((v) => !v)}
            >
              Comments ({entry.comments.length})
            </button>
            <button type="button" className="btn-small btn-light" onClick={startEdit}>
              Edit
            </button>
            <button
              type="button"
              className="btn-small btn-light"
              onClick={() => printSlip(entry)}
            >
              Print
            </button>
            <button type="button" className="btn-small btn-red" onClick={handleDelete}>
              Delete
            </button>
          </div>

          {showComments && (
            <div className="comments">
              {entry.comments.length === 0 && <p className="muted">No comments yet.</p>}
              <ul>
                {entry.comments.map((c, i) => (
                  <li key={i}>
                    {c.text} <span className="muted">· {formatDateTime(c.at)}</span>
                  </li>
                ))}
              </ul>
              <form className="comment-form" onSubmit={submitComment}>
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Add a comment (customer can see it)"
                />
                <button type="submit" className="btn-small" disabled={saving}>
                  Add
                </button>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function EntryTable({
  entries,
  onStatusChange,
  onAddComment,
  onUpdate,
  onDelete,
}) {
  if (!entries.length) {
    return <p className="muted center">No entries found.</p>;
  }

  return (
    <div className="entry-list">
      {entries.map((entry) => (
        <EntryCard
          key={entry._id}
          entry={entry}
          onStatusChange={onStatusChange}
          onAddComment={onAddComment}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}