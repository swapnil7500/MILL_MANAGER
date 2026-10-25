import { useCallback, useEffect, useState } from 'react';
import api from '../../api/axios';
import SiteHeader from '../../components/SiteHeader';
import SiteFooter from '../../components/SiteFooter';
import StatusBadge from '../../components/StatusBadge';
import {
  STATUS_LIST,
  STATUS_LABELS,
  SERVICE_LABELS,
  formatDate,
  formatDateTime,
} from '../../utils/format';

export default function MyEntries() {
  const [entries, setEntries] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/entries/mine');
      setEntries(res.data.entries);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load your entries');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const counts = STATUS_LIST.reduce((acc, s) => {
    acc[s] = entries.filter((e) => e.status === s).length;
    return acc;
  }, {});

  const visible = filter ? entries.filter((e) => e.status === filter) : entries;

  return (
    <div className="app-shell">
      <SiteHeader />

      <main className="page">
        <h2>My Entries</h2>

        {counts.done > 0 && (
          <div className="alert success ready-banner">
            {counts.done} {counts.done === 1 ? 'order is' : 'orders are'} ready for pickup.
          </div>
        )}

        <div className="summary">
          {STATUS_LIST.map((s) => (
            <div className="summary-box" key={s}>
              <div className="summary-count">{counts[s]}</div>
              <div className="muted">{STATUS_LABELS[s]}</div>
            </div>
          ))}
        </div>

        <div className="tabs">
          {['', ...STATUS_LIST].map((s) => (
            <button
              key={s || 'all'}
              type="button"
              className={filter === s ? 'tab active' : 'tab'}
              onClick={() => setFilter(s)}
            >
              {s ? STATUS_LABELS[s] : `All (${entries.length})`}
            </button>
          ))}
          <button type="button" className="btn-small btn-light" onClick={load}>
            Refresh
          </button>
        </div>

        {error && <div className="alert error">{error}</div>}

        {loading ? (
          <p className="muted center">Loading...</p>
        ) : visible.length === 0 ? (
          <p className="muted center">
            {entries.length === 0 ? 'You have no entries yet.' : 'No entries with this status.'}
          </p>
        ) : (
          <div className="entry-list">
            {visible.map((entry) => (
              <div className={`entry-card ${entry.serviceType}`} key={entry._id}>
                <div className="entry-top">
                  <span className="serial">#{entry.serialNo}</span>
                  <span className="muted">{formatDate(entry.date)}</span>
                  <StatusBadge status={entry.status} />
                </div>

                <div>
                  {entry.itemName} - <strong>{entry.weightKg} kg</strong>
                </div>
                <div className="muted">{SERVICE_LABELS[entry.serviceType]}</div>

                {entry.comments.length > 0 && (
                  <div className="comments">
                    <strong>Notes from the mill</strong>
                    <ul>
                      {entry.comments.map((c, i) => (
                        <li key={i}>
                          {c.text} <span className="muted">· {formatDateTime(c.at)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}