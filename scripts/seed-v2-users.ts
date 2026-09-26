import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log('Seeding demo users...');

  const dept = await (prisma as any).department.findFirst({
    where: { code: 'PK_NOI_TONG_HOP' }
  });

  if (!dept) throw new Error('Phòng khám PK_NOI_TONG_HOP không tồn tại. Hãy chạy seed departments trước!');

  const password = await bcrypt.hash('Hospital@2024', 10);

  // Admin / Giám đốc
  await (prisma as any).user.upsert({
    where: { email: 'director@bvhungloi.vn' },
    update: { password },
    create: { email: 'director@bvhungloi.vn', password, name: 'Giám đốc Bệnh viện', role: 'ADMIN', phone: '0901234567' }
  });

  // Bác sĩ
  const doctorUser = await (prisma as any).user.upsert({
    where: { email: 'bs.nguyenvana@medicare.com' },
    update: { password },
    create: { email: 'bs.nguyenvana@medicare.com', password, name: 'BS. Nguyễn Văn A', role: 'DOCTOR', phone: '0912345678' }
  });

  await (prisma as any).doctor.upsert({
    where: { userId: doctorUser.id },
    update: { departmentId: dept.id },
    create: { userId: doctorUser.id, departmentId: dept.id, specialty: 'Nội khoa', licenseNo: 'CCHN-12345', consultationFee: 150000 }
  });

  // Bệnh nhân
  await (prisma as any).user.upsert({
    where: { email: 'benhnhan@gmail.com' },
    update: { password },
    create: {
      email: 'benhnhan@gmail.com', password, name: 'Bệnh nhân Demo',
      role: 'PATIENT', phone: '0987654321',
      identityId: '012345678912', healthInsuranceNo: 'GD1234567890123'
    }
  });

  console.log('\n=== TÀI KHOẢN MẪU ===');
  console.log('Admin:   director@bvhungloi.vn    / Hospital@2024');
  console.log('Bác sĩ: bs.nguyenvana@medicare.com / Hospital@2024');
  console.log('BN:     benhnhan@gmail.com          / Hospital@2024');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => (prisma as any).$disconnect());
