import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);

  const users = [
    { email: 'letan1@bvhungloi.vn', name: 'Nguyễn Thị Lễ Tân', role: 'RECEPTIONIST' },
    { email: 'duocsi1@bvhungloi.vn', name: 'Trần Văn Dược Sĩ', role: 'PHARMACIST' },
    { email: 'ktv1@bvhungloi.vn', name: 'Lê Kỹ Thuật Viên', role: 'LAB_TECH' },
  ];

  for (const u of users) {
    const exists = await prisma.user.findUnique({ where: { email: u.email } });
    if (!exists) {
      await prisma.user.create({
        data: {
          email: u.email,
          name: u.name,
          password: hashedPassword,
          role: u.role,
          phone: '0900000000',
        }
      });
      console.log(`Đã tạo: ${u.email} - Role: ${u.role}`);
    } else {
      console.log(`Đã tồn tại: ${u.email}`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
