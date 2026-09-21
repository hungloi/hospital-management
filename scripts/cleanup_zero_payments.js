const Database = require('better-sqlite3');
const db = new Database('dev.db');

const payments = db.prepare("SELECT id, appointmentId, invoiceId, amount, status FROM Payment WHERE amount<=0 AND status='PENDING'").all();
console.log('found', payments.length);
const deletedPayments = [];
const deletedInvoices = [];

for (const p of payments) {
  db.prepare('DELETE FROM Payment WHERE id=?').run(p.id);
  deletedPayments.push(p);
}

const invoiceIds = [...new Set(payments.map(p => p.invoiceId).filter(Boolean))];
for (const inv of invoiceIds) {
  const items = db.prepare('SELECT COUNT(*) as c FROM InvoiceItem WHERE invoiceId=?').get(inv).c;
  const invRow = db.prepare('SELECT id,total FROM Invoice WHERE id=?').get(inv);
  if (invRow && invRow.total <= 0 && items === 0) {
    db.prepare('DELETE FROM Invoice WHERE id=?').run(inv);
    deletedInvoices.push(inv);
  }
}

console.log(JSON.stringify({ deletedPayments, deletedInvoices }, null, 2));
