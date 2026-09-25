import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, '../dev.db');
const db = new Database(dbPath);

// Reset passwords
const accounts = [
  { email: 'admin@hospital.com',    password: 'admin123' },
  { email: 'doctor1@hospital.com',  password: 'doctor123' },
  { email: 'doctor2@hospital.com',  password: 'doctor123' },
  { email: 'doctor3@hospital.com',  password: 'doctor123' },
  { email: 'doctor4@hospital.com',  password: 'doctor123' },
  { email: 'patient1@example.com',  password: 'patient123' },
];

console.log('=== ĐANG RESET PASSWORD ===\n');
for (const acc of accounts) {
  const hash = await bcrypt.hash(acc.password, 12);
  const result = db.prepare('UPDATE User SET password = ? WHERE email = ?').run(hash, acc.email);
  if (result.changes > 0) {
    console.log(`✅ ${acc.email}  →  mật khẩu: ${acc.password}`);
  } else {
    console.log(`❌ Không tìm thấy: ${acc.email}`);
  }
}

console.log('\n=== XONG! Bạn có thể đăng nhập với mật khẩu trên ===');
db.close();
