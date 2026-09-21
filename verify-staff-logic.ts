const { PrismaClient } = require('./src/generated/prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' });
const prisma = new PrismaClient({ adapter });

const doctorNames = [
  'TS.BS. Trần Anh Tuấn',
  'TS.BS. Vũ Đình Hùng',
  'TS.BS. Nguyễn Thị Lan',
  'TS.BS. Lê Thị Mỹ Hạnh',
  'BS. Hoàng Văn Sơn',
  'BS. Bùi Quốc Huy',
  'BS. Đỗ Thị Hương',
  'BS. Phạm Văn Minh',
  'TS.BS. Trương Nhân Khánh',
  'TS.BS. Lý Anh Đức',
  'BS. Ngô Thanh Bình',
  'TS.BS. Trần Thị Nguyệt',
  'BS. Võ Văn Chính',
  'BS. Đinh Thị Hồng',
  'TS.BS. Hà Văn Tú',
  'TS.BS. Lê Hoàng Phúc',
  'BS. Trần Văn Nam',
  'BS. Nguyễn Thái Bảo',
  'TS.BS. Lê Thị Thanh',
  'BS. Phạm Minh Tuấn',
  'TS.BS. Vũ Thị Hương',
  'BS. Nguyễn Văn Bình',
  'BS. Trần Thị Huệ',
  'BS. Phạm Văn Sơn',
  'BS. Đặng Thị Linh',
  'BS. Vũ Hữu Thiện',
  'BS. Ngô Thị Hồng',
  'BS. Trương Văn Nhân',
  'BS. Lê Thị Thanh',
  'BS. Huỳnh Anh Tuấn',
  'BS. Lý Thị Diễm',
  'BS. Trần Văn Hòa',
  'BS. Nguyễn Minh Tuấn',
  'BS. Phạm Thị Liên',
  'BS. Đỗ Văn Hiếu',
  'BS. Nguyễn Thị Hương',
  'BS. Trần Anh Sơn',
  'BS. Lê Văn Hùng',
  'BS. Vũ Thanh Long',
  'BS. Phạm Thị Thu',
  'BS. Ngô Văn Kiên',
  'BS. Bùi Thị Mai',
  'BS. Đặng Minh Hoàn',
  'BS. Hoàng Thị Hương',
  'BS. Lý Văn Đức',
  'BS. Trịnh Văn Tú',
  'BS. Nguyễn Hữu Dũng',
  'BS. Trần Hữu Phúc',
  'BS. Vũ Minh Hoàng',
  'BS. Phạm Việt Cường',
  'BS. Lê Văn Thắng',
  'BS. Đỗ Thị Hoa',
  'BS. Ngô Thanh Hải',
  'BS. Hoàng Văn Lâm',
  'BS. Trương Anh Dũng',
  'BS. Nguyễn Văn Kiên',
  'BS. Bùi Hữu Trung',
  'BS. Đặng Thái Bảo',
  'BS. Vũ Thị Linh',
  'BS. Phạm Văn Hải',
  'BS. Lý Văn Hùng',
  'BS. Trần Thị Tú Anh',
  'BS. Nguyễn Minh Khoa',
  'BS. Phạm Đình Tuấn',
  'BS. Vũ Hằng Nga',
  'BS. Ngô Thị Thu Thảo',
  'BS. Trần Minh Tuấn',
  'BS. Hoàng Thanh Hương',
  'BS. Lê Văn Huy',
  'BS. Trịnh Minh Vũ',
  'BS. Nguyễn Thái Lâm',
  'BS. Bùi Văn Hòa',
  'BS. Phạm Thanh Tuấn',
  'BS. Trần Việt Anh',
  'BS. Vũ Văn Thắng',
  'BS. Nguyễn Hữu Kiên',
  'BS. Lê Thị Hồng',
  'BS. Đỗ Minh Trí',
  'BS. Phạm Thị Hạnh',
  'BS. Hoàng Minh Tuấn',
  'BS. Bùi Thanh Hòa',
  'BS. Trương Thị Liên',
  'BS. Ngô Văn Long',
  'BS. Lý Thị Ngọc',
  'BS. Đặng Thị Hương',
  'BS. Vũ Minh Khôi',
  'BS. Phạm Văn Dũng',
  'BS. Trần Anh Vũ',
  'BS. Nguyễn Thị Hạnh',
  'BS. Lê Văn Tú',
  'BS. Đỗ Thị Thanh',
  'BS. Hoàng Văn Hùng',
  'BS. Bùi Minh Hoàn',
  'BS. Phạm Thị Hương',
  'BS. Trương Văn Sơn',
  'BS. Ngô Thanh Hùng',
  'BS. Lý Văn Toàn',
  'BS. Đặng Minh Huy',
  'BS. Vũ Thị Hạnh',
  'BS. Trần Thị Minh',
  'BS. Nguyễn Văn Tú',
  'BS. Lê Thị Liên',
  'BS. Đỗ Văn Tùng',
  'BS. Phạm Minh Tuấn',
  'BS. Hoàng Thị Hạnh',
  'BS. Bùi Văn Sơn',
  'BS. Trương Minh Quân',
  'BS. Ngô Thị Yến',
  'BS. Lý Thị Hồng',
  'BS. Đặng Thị Mai',
  'BS. Vũ Hữu Lâm',
  'BS. Trần Văn Phúc',
  'BS. Nguyễn Thị Vy',
  'BS. Lê Minh Sơn',
  'BS. Đỗ Thị Huyền',
  'BS. Phạm Văn Hoàn',
  'BS. Hoàng Văn Tú',
  'BS. Bùi Thị Hồng',
  'BS. Trương Thị Hương',
  'BS. Ngô Minh Hạnh',
  'BS. Lý Thái Bảo',
  'BS. Đặng Văn Hòa',
  'BS. Vũ Thị Phương',
  'BS. Trần Thị Thúy',
  'BS. Nguyễn Văn Hải',
  'BS. Lê Thị Ngà',
  'BS. Đỗ Văn Quân',
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
  'BS. Đặng Thị Hạnh',
  'BS. Vũ Hữu Tuấn',
  'BS. Phạm Văn Quyền',
  'BS. Trần Thị Hạnh',
  'BS. Nguyễn Minh Hùng',
  'BS. Lê Văn Hòa',
  'BS. Đỗ Thị Hương',
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
  'BS. Lê Thị Hạnh',
  'BS. Đỗ Văn Kiên',
  'BS. Hoàng Thị Tú',
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
  'ĐD. Trần Thị Lan', 'ĐD. Nguyễn Thị Hoa', 'ĐD. Vũ Thị Hương', 'ĐD. Phạm Thị Linh',
  'ĐD. Lê Thị Mai', 'ĐD. Đỗ Thị Thanh', 'ĐD. Hoàng Thị Tú', 'ĐD. Ngô Thị Bích',
  'ĐD. Bùi Thị Ngọc', 'ĐD. Trương Thị Yến', 'ĐD. Đặng Thị Thu', 'ĐD. Lý Thị Hương',
  'ĐD. Nguyễn Thị Kim', 'ĐD. Vũ Thị Diệp', 'ĐD. Phạm Thị Hồng', 'ĐD. Trần Thị Bích',
  'ĐD. Lê Văn Anh', 'ĐD. Ngô Văn Hùng', 'ĐD. Bùi Văn Tuấn', 'ĐD. Đỗ Văn Minh',
  'ĐD. Hoàng Thị Ngọc', 'ĐD. Trần Thị Hương', 'ĐD. Nguyễn Thị Linh', 'ĐD. Vũ Thị Tú',
  'ĐD. Phạm Thị Thu', 'ĐD. Lê Thị Hạnh', 'ĐD. Đặng Thị Hoa', 'ĐD. Bùi Thị Mai',
  'ĐD. Ngô Thị Loan', 'ĐD. Trương Thị Anh', 'ĐD. Lý Thị Hồng', 'ĐD. Đỗ Thị Xuân',
  'ĐD. Nguyễn Thị Yến', 'ĐD. Vũ Thị Hạ', 'ĐD. Phạm Thị Kim', 'ĐD. Trần Thị Liên',
  'ĐD. Lê Thị Diễm', 'ĐD. Hoàng Văn Tuấn', 'ĐD. Ngô Văn Long', 'ĐD. Bùi Văn Phong',
  'ĐD. Trần Thị Hạnh', 'ĐD. Nguyễn Thị Thảo', 'ĐD. Vũ Thị Hương', 'ĐD. Phạm Thị Lệ',
  'ĐD. Lê Thị Hồng', 'ĐD. Đặng Thị Phương', 'ĐD. Bùi Thị Hiền', 'ĐD. Ngô Thị Lan',
  'ĐD. Trương Thị Ngân', 'ĐD. Lý Thị Thanh', 'ĐD. Đỗ Thị Tú', 'ĐD. Nguyễn Thị Ánh',
  'ĐD. Vũ Thị Hà', 'ĐD. Phạm Thị Vy', 'ĐD. Trần Thị Huyền', 'ĐD. Hoàng Thị Hiền',
  'ĐD. Nguyễn Thị Duyên', 'ĐD. Vũ Thị Quỳnh', 'ĐD. Phạm Thị Dân', 'ĐD. Lê Thị Ngân',
  'ĐD. Trần Thị Nhân', 'ĐD. Đặng Thị Hạo', 'ĐD. Bùi Thị Ánh', 'ĐD. Ngô Thị Thúy',
  'ĐD. Lý Thị Huyền', 'ĐD. Đỗ Thị Hạnh', 'ĐD. Trương Thị Loan', 'ĐD. Nguyễn Thị Liên',
  'ĐD. Vũ Thị Anh', 'ĐD. Phạm Thị Hương', 'ĐD. Lê Thị Xuân', 'ĐD. Trần Thị Hương',
  'ĐD. Nguyễn Thị Phượng', 'ĐD. Vũ Thị Huyền', 'ĐD. Phạm Thị Lan', 'ĐD. Đặng Thị Hồng',
  'ĐD. Bùi Thị Tú', 'ĐD. Hoàng Thị Ân', 'ĐD. Ngô Thị Thanh', 'ĐD. Trương Thị Hà',
  'ĐD. Lý Thị Mỹ', 'ĐD. Đỗ Thị Liễu', 'ĐD. Nguyễn Thị Hạnh', 'ĐD. Vũ Thị Tuyền',
  'ĐD. Phạm Thị Hạnh', 'ĐD. Trần Thị Linh', 'ĐD. Lê Thị Thắm', 'ĐD. Hoàng Văn Sỹ',
  'ĐD. Ngô Văn Huy', 'ĐD. Bùi Văn Cơ', 'ĐD. Trần Văn Tùng', 'ĐD. Lý Văn Phúc',
  'ĐD. Đặng Thị Hoa', 'ĐD. Vũ Thị Hạnh', 'ĐD. Phạm Thị Hương', 'ĐD. Nguyễn Thị Loan',
  'ĐD. Lê Thị Huy', 'ĐD. Đỗ Thị Yên', 'ĐD. Hoàng Thị Hoa', 'ĐD. Bùi Thị Hương',
  'ĐD. Trương Thị Hạnh', 'ĐD. Ngô Thị Huyền', 'ĐD. Lý Thị Hạnh', 'ĐD. Đặng Thị Hạnh',
  'ĐD. Vũ Thị Hồng', 'ĐD. Phạm Thị Thanh', 'ĐD. Trần Thị Yến', 'ĐD. Nguyễn Thị Thu',
  'ĐD. Lê Thị Linh', 'ĐD. Đỗ Thị Hảo', 'ĐD. Hoàng Thị Duyên', 'ĐD. Bùi Thị Loan',
  'ĐD. Trương Thị Huyền', 'ĐD. Ngô Thị Vân', 'ĐD. Lý Thị Hà', 'ĐD. Đặng Thị Hợp'
];

function generateEmail(name) {
  const cleanName = name
    .replace(/^(PGS\.TS\.BS\.|TS\.BS\.|BS\.|ĐD\.|.*-\s)/g, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/\s+/g, '.')
    .toLowerCase();
  return `${cleanName}@bvhungloi.vn`;
}

async function main() {
  console.log('\n📋 KIỂM TRA & HOÀN THIỆN LOGIC NHÂN SỰ CÁC KHOA...\n');
  
  const departments = await prisma.department.findMany();
  const clinicalDepts = departments.filter(d => !d.name.includes('Phòng'));
  
  let totalAdded = 0;
  let doctorIndex = 0;
  let nurseIndex = 0;

  for (const dept of clinicalDepts) {
    // Đếm nhân sự hiện tại
    const doctors = await prisma.doctor.findMany({
      where: { departmentId: dept.id },
      include: { user: true }
    });

    const headDoctors = doctors.filter(d => d.user.role === 'HEAD_DOCTOR');
    const regularDoctors = doctors.filter(d => d.user.role === 'DOCTOR');

    const nurses = await prisma.user.findMany({
      where: { role: 'NURSE' }
    });

    // Cần: 1 Trưởng khoa + 3 Phó khoa + 10+ BS
    const needHeadDoctor = headDoctors.length < 1;
    const needDeputyDoctors = regularDoctors.length < 3;
    const needRegularDoctors = regularDoctors.length + headDoctors.length < 14; // 1 trưởng + 3 phó + 10 bs
    const needNurses = nurses.length < 10;

    console.log(`\n▶ ${dept.name}:`);
    console.log(`   BS: ${doctors.length} (cần ≥14: 1 Trưởng + 3 Phó + 10 BS)`);
    console.log(`   ĐD: ${nurses.length} (cần ≥10)`);

    // Thêm Trưởng khoa nếu thiếu
    if (needHeadDoctor) {
      let headName = doctorNames[doctorIndex % doctorNames.length];
      doctorIndex++;
      try {
        const existing = await prisma.user.findUnique({
          where: { email: generateEmail(headName) }
        });
        if (!existing) {
          await prisma.user.create({
            data: {
              name: headName,
              email: generateEmail(headName),
              password: 'password123',
              role: 'HEAD_DOCTOR',
              doctorInfo: {
                create: {
                  specialty: dept.name,
                  departmentId: dept.id
                }
              }
            }
          });
          console.log(`   ✓ Thêm Trưởng khoa: ${headName}`);
          totalAdded++;
        }
      } catch (e) {}
    }

    // Thêm Phó khoa nếu thiếu
    while (regularDoctors.length + headDoctors.length < 4) {
      let deputyName = doctorNames[doctorIndex % doctorNames.length];
      doctorIndex++;
      try {
        const existing = await prisma.user.findUnique({
          where: { email: generateEmail(deputyName) }
        });
        if (!existing) {
          await prisma.user.create({
            data: {
              name: deputyName,
              email: generateEmail(deputyName),
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
          console.log(`   ✓ Thêm Phó khoa: ${deputyName}`);
          totalAdded++;
          regularDoctors.length++;
        }
      } catch (e) {}
    }

    // Thêm BS thường nếu thiếu
    while (regularDoctors.length + headDoctors.length < 14) {
      let docName = doctorNames[doctorIndex % doctorNames.length];
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
          console.log(`   ✓ Thêm BS: ${docName}`);
          totalAdded++;
          regularDoctors.length++;
        }
      } catch (e) {}
    }

    // Thêm ĐD nếu thiếu
    while (nurses.length < 10) {
      let nurseName = nurseNames[nurseIndex % nurseNames.length];
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
          console.log(`   ✓ Thêm ĐD: ${nurseName}`);
          totalAdded++;
          nurses.length++;
        }
      } catch (e) {}
    }
  }

  console.log(`\n✅ HOÀN THIỆN! Đã thêm ${totalAdded} nhân sự.`);
  await prisma.$disconnect();
}

main();
