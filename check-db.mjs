import Database from 'better-sqlite3';

const db = new Database('./dev.db');
const tables = db.prepare(`
  SELECT name FROM sqlite_master WHERE type='table' ORDER BY name
`).all();

console.log('Tables in database:');
tables.forEach(t => console.log(`  - ${t.name}`));

if (tables.length === 0) {
  console.log('⚠️  No tables found!');
} else {
  console.log(`✅ Found ${tables.length} tables`);
}

db.close();
