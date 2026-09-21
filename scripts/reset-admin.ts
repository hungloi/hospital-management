/**
 * Script cấp lại tài khoản admin
 * Chạy: npx tsx scripts/reset-admin.ts
 */
import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  const email = 'admin@hospital.com';
  const password = 'admin123';
  const hashedPassword = await bcrypt.hash(password, 10);

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword, role: 'ADMIN', name: 'Quản Trị Viên' },
    });
    console.log('✅ Đã cập nhật mật khẩu admin!');
  } else {
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: 'Quản Trị Viên',
        role: 'ADMIN',
        phone: '0901234567',
      },
    });
    console.log('✅ Đã tạo tài khoản admin mới!');
  }

  // Cũng fix các user khác nếu password chưa được hash
  const users = await prisma.user.findMany({
    where: { password: 'hashed_password' },
  });
  for (const u of users) {
    const hashed = await bcrypt.hash('admin123', 10);
    await prisma.user.update({ where: { id: u.id }, data: { password: hashed } });
  }
  if (users.length > 0) {
    console.log(`✅ Đã fix password cho ${users.length} user(s) bị "hashed_password" thô`);
  }

  console.log('\n📌 Tài khoản admin:');
  console.log('   Email: admin@hospital.com');
  console.log('   Mật khẩu: admin123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
