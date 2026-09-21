import Database from 'better-sqlite3';
const db = new Database('./dev.db');

function count(table) {
  try {
    return db.prepare(`SELECT COUNT(*) as c FROM ${table}`).get().c;
  } catch (err) {
    return `error: ${err.message}`;
  }
}

console.log('counts:');
console.log('  departments:', count('Department'));
console.log('  medicines:  ', count('Medicine'));
console.log('  supplies:   ', count('MedicalSupply'));
console.log('  rooms:      ', count('Room'));

db.close();
