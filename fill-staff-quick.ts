const { PrismaClient } = require('./src/generated/prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' });
const prisma = new PrismaClient({ adapter });

const doctorNames = [
  'BS. Trần Văn Kiên',
  'BS. Vũ Văn Lâm',
  'BS. Phạm Thị Hoa',
  'BS. Nguyễn Văn Dũng',
  'BS. Lê Thị Thanh',
  'BS. Đỗ Văn Hùng',
  'BS. Hoàng Thị Linh',
  'BS. Bùi Văn Hòa',
  'BS. Trương Minh Long',
  'BS. Ngô Thanh Hương',
  'BS. Lý Văn Sơn',
  'BS. Đặng Minh Huy',
  'BS. Vũ Hữu Tuấn',
  'BS. Phạm Văn Quyền',
  'BS. Trần Thị Hạnh',
  'BS. Nguyễn Minh Hùng',
  'BS. Lê Văn Hòa',
  'BS. Hoàng Văn Dũng',
  'BS. Bùi Thị Hạnh',
  'BS. Trương Thị Ngân',
  'BS. Ngô Minh Tuấn',
  'BS. Lý Thị Phương',
  'BS. Đặng Văn Tuấn',
  'BS. Vũ Thị Liên',
  'BS. Phạm Minh Hòa',
  'BS. Trần Văn Hải',
  'BS. Nguyễn Thị Hà',
  'BS. Đỗ Văn Kiên',
  'BS. Bùi Minh Tuấn',
  'BS. Trương Văn Hùng',
  'BS. Ngô Thị Hạnh',
  'BS. Lý Văn Hòa',
  'BS. Đặng Thị Yến',
  'BS. Vũ Minh Huy',
  'BS. Phạm Thị Loan',
  'BS. Trần Thị Hồng',
  'BS. Nguyễn Văn Long',
  'BS. Lê Minh Tuấn'
];

const nurseNames = [
  'ĐD. Vũ Thị Hồng', 'ĐD. Phạm Thị Thanh', 'ĐD. Trần Thị Yến', 'ĐD. Nguyễn Thị Thu',
  'ĐD. Lê Thị Linh', 'ĐD. Đỗ Thị Hảo', 'ĐD. Hoàng Thị Duyên', 'ĐD. Bùi Thị Loan',
  'ĐD. Trương Thị Huyền', 'ĐD. Ngô Thị Vân', 'ĐD. Lý Thị Hà', 'ĐD. Đặng Thị Hợp',
  'ĐD. Vũ Thị Tuyến', 'ĐD. Phạm Thị Hạnh', 'ĐD. Trần Thị Linh', 'ĐD. Nguyễn Thị Kim',
  'ĐD. Lê Thị Thắm', 'ĐD. Đỗ Thị Ngân', 'ĐD. Hoàng Thị Sơn', 'ĐD. Bùi Thị Tính'
];

function generateEmail(name) {
  const cleanName = name
    .replace(/^(BS\.|ĐD\.|.*-\s)/g, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/\s+/g, '.')
    .toLowerCase();
  return `${cleanName}@bvhungloi.vn`;
}

async function main() {
  console.log('\n⚡ BỔ SUNG NHÂN SỰ THIẾU CÁC KHOA...\n');
  
  const depts = await prisma.department.findMany();
  const clinicalDepts = depts.filter(d => !d.name.includes('Phòng'));
  
  let totalAdded = 0;
  let doctorIndex = 0;
  let nurseIndex = 0;

  for (const dept of clinicalDepts) {
    const doctors = await prisma.doctor.findMany({
      where: { departmentId: dept.id },
      include: { user: true }
    });
    
    const needDoctors = 14 - doctors.length;
    
    if (needDoctors > 0) {
      console.log(`▶ ${dept.name}: Thêm ${needDoctors} BS`);
      
      for (let i = 0; i < needDoctors; i++) {
        const docName = doctorNames[doctorIndex % doctorNames.length];
        doctorIndex++;
        
        try {
          const existing = await prisma.user.findUnique({
            where: { email: generateEmail(docName) }
          });
          if (!existing) {
            await prisma.user.create({
              data: {
                name: docName,
                email: generateEmail(docName),
                password: 'password123',
                role: 'DOCTOR',
                doctorInfo: {
                  create: {
                    specialty: dept.name,
                    departmentId: dept.id
                  }
                }
              }
            });
            totalAdded++;
          }
        } catch (e) {
          console.error(`  Lỗi: ${e.message}`);
        }
      }
    }
    
    // Thêm ĐD
    for (let i = 0; i < 10; i++) {
      const nurseName = nurseNames[nurseIndex % nurseNames.length];
      nurseIndex++;
      
      try {
        const existing = await prisma.user.findUnique({
          where: { email: generateEmail(nurseName) }
        });
        if (!existing) {
          await prisma.user.create({
            data: {
              name: nurseName,
              email: generateEmail(nurseName),
              password: 'password123',
              role: 'NURSE'
            }
          });
          totalAdded++;
        }
      } catch (e) {}
    }
  }

  console.log(`\n✅ Đã thêm ${totalAdded} nhân sự!`);
  await prisma.$disconnect();
}

main();
