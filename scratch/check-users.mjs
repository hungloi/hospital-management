import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, '../dev.db');
const db = new Database(dbPath);

const admin = db.prepare('SELECT email, password FROM User WHERE email = ?').get('admin@hospital.com');

if (admin) {
  console.log('✅ Tìm thấy tài khoản admin');
  console.log('Email:', admin.email);
  console.log('Password hash (60 ký tự đầu):', admin.password?.substring(0, 60));
  console.log('Độ dài hash:', admin.password?.length);
  
  // Bcrypt hash bắt đầu bằng $2b$ hoặc $2a$
  if (admin.password?.startsWith('$2')) {
    console.log('✅ Password đã được hash bcrypt - OK');
  } else {
    console.log('⚠️  Password KHÔNG phải bcrypt hash!');
  }
} else {
  console.log('❌ Không tìm thấy tài khoản admin!');
}

db.close();
