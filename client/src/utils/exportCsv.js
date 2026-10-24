import api from '../api/axios';
import { STATUS_LABELS, SERVICE_LABELS, toDateInput, todayISO } from './format';

// Wraps a value for CSV. Values starting with = + - @ get a leading ' so Excel
// can't run them as formulas (customers type their own names when registering).
const cell = (value) => {
  let s = value === null || value === undefined ? '' : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
};

export async function exportEntriesCsv(filters) {
  const params = { limit: 200 };
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params[key] = value;
  });

  // Fetch every page of the filtered list
  const all = [];
  let page = 1;
  let pages = 1;
  do {
    const res = await api.get('/entries', { params: { ...params, page } });
    all.push(...res.data.entries);
    pages = res.data.pages;
    page += 1;
  } while (page <= pages);

  const header = [
    'Serial No',
    'Date',
    'Customer',
    'Phone',
    'Address',
    'Service',
    'Item',
    'Weight (kg)',
    'Status',
    'Amount',
    'Paid',
    'Comments',
  ];

  const rows = all.map((e) => [
    e.serialNo,
    toDateInput(e.date),
    e.customer?.name,
    e.customer?.phone,
    e.customer?.address,
    SERVICE_LABELS[e.serviceType],
    e.itemName,
    e.weightKg,
    STATUS_LABELS[e.status],
    e.amount,
    e.paid ? 'Yes' : 'No',
    e.comments.map((c) => c.text).join(' | '),
  ]);

  const csv = [header, ...rows].map((r) => r.map(cell).join(',')).join('\r\n');

  // The \uFEFF at the start makes Excel read Hindi/Unicode names correctly
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `mill-entries-${todayISO()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return all.length;
}