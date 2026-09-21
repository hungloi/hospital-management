const Database = require('better-sqlite3');
const db = new Database('./dev.db');

function info(table) {
  console.log('\nSchema for', table);
  const rows = db.prepare(`PRAGMA table_info(${table})`).all();
  for (const r of rows) console.log(r.cid, r.name, r.type, 'notnull=' + r.notnull, 'dflt=' + r.dflt_value, 'pk=' + r.pk);
}

const tables = ['Department','User','Doctor','Medicine','MedicalSupply','Room','RoomService'];
for (const t of tables) {
  try { info(t); } catch(e) { console.log('  (no table)', t); }
}

db.close();
