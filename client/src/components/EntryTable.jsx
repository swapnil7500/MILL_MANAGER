import { useState } from 'react';
import StatusBadge from './StatusBadge';
import {
  STATUS_LIST,
  STATUS_LABELS,
  SERVICE_LABELS,
  formatDate,
  formatDateTime,
} from '../utils/format';

function EntryCard({ entry, onStatusChange, onAddComment }) {
  const [showComments, setShowComments] = useState(false);
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);

  const submitComment = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSaving(true);
    const ok = await onAddComment(entry._id, text.trim());
    if (ok) setText('');
    setSaving(false);
  };

  const canMarkDone = entry.status === 'pending' || entry.status === 'in-progress';

  return (
    <div className="entry-card">
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
        <div className="entry-item">
          <div>
            {entry.itemName} - <strong>{entry.weightKg} kg</strong>
          </div>
          <div className="muted">{SERVICE_LABELS[entry.serviceType]}</div>
        </div>
      </div>

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
    </div>
  );
}

export default function EntryTable({ entries, onStatusChange, onAddComment }) {
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
        />
      ))}
    </div>
  );
}