import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  const email = 'giamdoc@bvhungloi.vn';
  const password = 'giamdoc123';
  const hashedPassword = await bcrypt.hash(password, 10);

  // Tạo hoặc cập nhật account Giám đốc Trịnh Hưng Lợi
  await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      name: 'Trịnh Hưng Lợi',
      role: 'ADMIN' // Giám đốc đóng vai trò ADMIN
    },
    create: {
      email,
      password: hashedPassword,
      name: 'Trịnh Hưng Lợi',
      role: 'ADMIN',
      phone: '0909999999',
    }
  });

  console.log('✅ Đã cập nhật tài khoản Giám đốc:');
  console.log(`   Email: ${email}`);
  console.log(`   Mật khẩu: ${password}`);
  console.log(`   Tên: Trịnh Hưng Lợi`);
}

main().finally(() => prisma.$disconnect());
