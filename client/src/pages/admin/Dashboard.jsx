import { useEffect, useState } from 'react';
import api from '../../api/axios';
import EntryTable from '../../components/EntryTable';
import { exportEntriesCsv } from '../../utils/exportCsv';
import { STATUS_LIST, STATUS_LABELS } from '../../utils/format';

const EMPTY_FILTERS = { status: '', serviceType: '', from: '', to: '', q: '' };

export default function Dashboard() {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ entries: [], total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
    const [exporting, setExporting] = useState(false);

  // Reload whenever filters or page change (search typing waits 300 ms)
  useEffect(() => {
    const timer = setTimeout(
      async () => {
        setLoading(true);
        setError('');
        try {
          const params = { page, limit: 20 };
          Object.entries(filters).forEach(([key, value]) => {
            if (value) params[key] = value;
          });
          const res = await api.get('/entries', { params });
          setData(res.data);
        } catch (err) {
          setError(err.response?.data?.message || 'Could not load entries');
        } finally {
          setLoading(false);
        }
      },
      filters.q ? 300 : 0
    );
    return () => clearTimeout(timer);
  }, [filters, page]);

  const updateFilter = (key, value) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  };

  const replaceEntry = (updated) => {
    setData((d) => ({
      ...d,
      entries: d.entries.map((e) => (e._id === updated._id ? updated : e)),
    }));
  };

  const changeStatus = async (id, status) => {
    try {
      const res = await api.patch(`/entries/${id}/status`, { status });
      replaceEntry(res.data.entry);
    } catch (err) {
      alert(err.response?.data?.message || 'Could not update status');
    }
  };

  const addComment = async (id, text) => {
    try {
      const res = await api.post(`/entries/${id}/comment`, { text });
      replaceEntry(res.data.entry);
      return true;
    } catch (err) {
      alert(err.response?.data?.message || 'Could not add comment');
      return false;
    }
  };
  
  const updateEntry = async (id, payload) => {
    try {
      const res = await api.put(`/entries/${id}`, payload);
      replaceEntry(res.data.entry);
      return true;
    } catch (err) {
      alert(err.response?.data?.message || 'Could not update entry');
      return false;
    }
  };

  const deleteEntry = async (id) => {
    try {
      await api.delete(`/entries/${id}`);
      setData((d) => ({
        ...d,
        entries: d.entries.filter((e) => e._id !== id),
        total: d.total - 1,
      }));
    } catch (err) {
      alert(err.response?.data?.message || 'Could not delete entry');
    }
  };

    const handleExport = async () => {
    setExporting(true);
    try {
      const count = await exportEntriesCsv(filters);
      if (count === 0) alert('No entries to export for these filters');
    } catch (err) {
      alert(err.response?.data?.message || 'Could not export');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <h2>Entries</h2>

      <div className="tabs">
        {['', ...STATUS_LIST].map((s) => (
          <button
            key={s || 'all'}
            type="button"
            className={filters.status === s ? 'tab active' : 'tab'}
            onClick={() => updateFilter('status', s)}
          >
            {s ? STATUS_LABELS[s] : 'All'}
          </button>
        ))}
      </div>

      <div className="filters">
        <input
          placeholder="Search name, phone or item"
          value={filters.q}
          onChange={(e) => updateFilter('q', e.target.value)}
        />
        <select
          value={filters.serviceType}
          onChange={(e) => updateFilter('serviceType', e.target.value)}
        >
          <option value="">All services</option>
          <option value="flour">Flour Mill</option>
          <option value="oil">Oil Extraction</option>
        </select>
        <div className="date-range">
          <label>
            From
            <input
              type="date"
              value={filters.from}
              onChange={(e) => updateFilter('from', e.target.value)}
            />
          </label>
          <label>
            To
            <input
              type="date"
              value={filters.to}
              onChange={(e) => updateFilter('to', e.target.value)}
            />
          </label>
        </div>
        <button
          type="button"
          className="btn-small btn-light"
          onClick={() => {
            setFilters(EMPTY_FILTERS);
            setPage(1);
          }}
        >
          Clear filters
         <button
          type="button"
          className="btn-small btn-green"
          onClick={handleExport}
          disabled={exporting}
        >
          {exporting ? 'Exporting...' : 'Export to Excel'}
        </button>

        </button>
      </div>

      {error && <div className="alert error">{error}</div>}
      {loading ? (
        <p className="muted center">Loading...</p>
      ) : (
        <>
          <p className="muted">{data.total} entries</p>
          <EntryTable
            entries={data.entries}
            onStatusChange={changeStatus}
            onAddComment={addComment}
          />
          {data.pages > 1 && (
            <div className="pager">
              <button
                className="btn-small btn-light"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </button>
              <span>
                Page {page} of {data.pages}
              </span>
              <button
                className="btn-small btn-light"
                disabled={page >= data.pages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}