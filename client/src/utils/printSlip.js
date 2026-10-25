import { SERVICE_LABELS, STATUS_LABELS, formatDate } from './format';

const SHOP_NAME = 'Gupta Atta Chakki'; // change to the business name

// Customer names are typed by users, so they must be escaped before going into HTML
const esc = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export function printSlip(entry) {
  const row = (label, value) =>
    `<tr><td class="l">${esc(label)}</td><td>${esc(value)}</td></tr>`;

  const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Slip #${esc(entry.serialNo)}</title>
<style>
  body { font-family: Arial, sans-serif; width: 300px; margin: 0 auto; padding: 12px; font-size: 14px; }
  h2 { text-align: center; margin: 0 0 4px; }
  .sub { text-align: center; margin-bottom: 10px; color: #555; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 4px 0; vertical-align: top; }
  td.l { color: #555; width: 38%; }
  hr { border: none; border-top: 1px dashed #999; margin: 10px 0; }
  .foot { text-align: center; margin-top: 12px; color: #555; }
</style>
</head>
<body>
  <h2>${esc(SHOP_NAME)}</h2>
  <div class="sub">Slip No. ${esc(entry.serialNo)}</div>
  <hr>
  <table>
    ${row('Date', formatDate(entry.date))}
    ${row('Customer', entry.customer?.name)}
    ${row('Phone', entry.customer?.phone)}
    ${row('Service', SERVICE_LABELS[entry.serviceType])}
    ${row('Item', entry.itemName)}
    ${row('Weight', `${entry.weightKg} kg`)}
    ${row('Status', STATUS_LABELS[entry.status])}
    ${entry.amount > 0 ? row('Amount', `Rs. ${entry.amount} (${entry.paid ? 'Paid' : 'Not paid'})`) : ''}
  </table>
  <hr>
  <div class="foot">Thank you</div>
</body>
</html>`;

  // A hidden frame avoids pop-up blockers
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(html);
  doc.close();

  setTimeout(() => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    setTimeout(() => document.body.removeChild(iframe), 1000);
  }, 250);
}