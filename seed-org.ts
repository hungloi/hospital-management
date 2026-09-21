import { prisma } from './src/lib/prisma';

async function main() {
  console.log('Bắt đầu cấu trúc lại tổ chức...');

  // 1. Thêm phòng ban mới
  const newDepts = ['Phòng Quản lý Chất lượng', 'Phòng Công nghệ Thông tin', 'Phòng Kế hoạch Tổng hợp'];
  for (const name of newDepts) {
    await prisma.department.upsert({
      where: { name },
      update: {},
      create: { name }
    });
  }
  console.log('Đã thêm các phòng ban Back-office.');

  // 2. Chuyển đổi Giám đốc
  const directors = await prisma.user.findMany({ where: { role: 'DIRECTOR' } });
  for (const dir of directors) {
    if (!dir.name.includes('Trịnh Hưng Lợi')) {
      await prisma.user.update({
        where: { id: dir.id },
        data: { role: 'DEPUTY_DIRECTOR' }
      });
    }
  }
  console.log('Đã cập nhật danh sách Phó Giám đốc.');

  // 3. Kế toán trưởng
  const accountants = await prisma.user.findMany({ where: { role: 'ACCOUNTANT' } });
  if (accountants.length > 0) {
    // Lấy người đầu tiên làm Kế toán trưởng
    await prisma.user.update({
      where: { id: accountants[0].id },
      data: { role: 'CHIEF_ACCOUNTANT' }
    });
    console.log(`Đã bổ nhiệm ${accountants[0].name} làm Kế toán trưởng.`);
  }

  // 4. Phó Khoa
  const departments = await prisma.department.findMany();
  let deputyHeadCount = 0;
  for (const dept of departments) {
    // Bỏ qua các phòng ban hành chính
    if (dept.name.startsWith('Phòng')) continue;

    // Tìm một bác sĩ thường trong khoa
    const doctors = await prisma.user.findMany({
      where: { 
        role: 'DOCTOR',
        doctorInfo: { departmentId: dept.id }
      },
      take: 1
    });

    if (doctors.length > 0) {
      const doc = doctors[0];
      const newName = doc.name.replace('BS. ', 'ThS.BS. ');
      await prisma.user.update({
        where: { id: doc.id },
        data: { role: 'DEPUTY_HEAD', name: newName }
      });
      deputyHeadCount++;
    }
  }
  
  console.log(`Đã bổ nhiệm ${deputyHeadCount} Phó Khoa.`);
  console.log('Hoàn tất cấu trúc tổ chức!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
