import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  const user = await prisma.user.findUnique({ where: { email: 'letan1@bvhungloi.vn' } });
  if (!user) {
    console.log('NOT FOUND - user does not exist in DB!');
    console.log('Creating now...');
    const hashed = await bcrypt.hash('password123', 10);
    await prisma.user.create({
      data: { email: 'letan1@bvhungloi.vn', name: 'Nguyễn Thị Lễ Tân', password: hashed, role: 'RECEPTIONIST', phone: '0900000000' }
    });
    await prisma.user.create({
      data: { email: 'duocsi1@bvhungloi.vn', name: 'Trần Văn Dược Sĩ', password: hashed, role: 'PHARMACIST', phone: '0900000001' }
    });
    await prisma.user.create({
      data: { email: 'ktv1@bvhungloi.vn', name: 'Lê Kỹ Thuật Viên', password: hashed, role: 'LAB_TECH', phone: '0900000002' }
    });
    console.log('Created 3 new users!');
  } else {
    console.log('FOUND:', user.role, '| Hash starts:', user.password.substring(0, 10));
    const valid = await bcrypt.compare('password123', user.password);
    console.log('Password valid?', valid);
  }
}

main().catch(console.error);
