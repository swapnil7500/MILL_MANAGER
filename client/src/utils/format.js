export const STATUS_LIST = ['pending', 'in-progress', 'done', 'delivered'];

export const STATUS_LABELS = {
  pending: 'Pending',
  'in-progress': 'In Progress',
  done: 'Done',
  delivered: 'Delivered',
};

export const SERVICE_LABELS = {
  flour: 'Flour Mill',
  oil: 'Oil Extraction',
};

export const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  });

export const formatDateTime = (d) =>
  new Date(d).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata',
  });

// Today's date as YYYY-MM-DD in Indian time (what <input type="date"> uses)
export const todayISO = () =>
  new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });