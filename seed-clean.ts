const { PrismaClient } = require('./src/generated/prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const fs = require('fs');
const path = require('path');

// Xóa database cũ
const dbPath = path.join(process.cwd(), 'dev.db');
if (fs.existsSync(dbPath)) {
  try {
    fs.unlinkSync(dbPath);
    console.log('✓ Xóa database cũ');
  } catch (e) {
    console.log('⚠ Không thể xóa database (có thể đang sử dụng)');
  }
}

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' });
const prisma = new PrismaClient({ adapter });

// Danh sách tên BS và ĐD thực tế
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
  'BS. Đỗ Văn Quân'
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
  'ĐD. Trương Thị Hạnh', 'ĐD. Ngô Thị Huyền', 'ĐD. Lý Thị Hạnh', 'ĐD. Đặng Thị Hạnh'
];

const staffNames = {
  director: 'PGS.TS.BS. Trịnh Hưng Lợi',
  deputyDirectors: [
    'TS.BS. Phạm Quốc Tuấn',
    'TS.BS. Nguyễn Thị Thanh Hương',
    'TS.BS. Đặng Minh Khoa'
  ],
  accountants: [
    'Nguyễn Thị Hạnh - Kế Toán Trưởng',
    'Vũ Minh Hùng - Kế Toán',
    'Phạm Thị Linh - Kế Toán',
    'Đặng Văn Tuấn - Kế Toán',
    'Trần Thị Hương - Kế Toán'
  ],
  itStaff: [
    'Trần Minh Sơn - CNTT - Trưởng Phòng',
    'Nguyễn Thanh Tùng - CNTT',
    'Phạm Văn Hòa - CNTT',
    'Lê Thị Hương - CNTT',
    'Vũ Minh Khanh - CNTT'
  ],
  qualityStaff: [
    'Đỗ Thị Hạnh - Quản Lý Chất Lượng - Trưởng Phòng',
    'Hoàng Văn Tuấn - Quản Lý Chất Lượng',
    'Nguyễn Thị Thu - Quản Lý Chất Lượng',
    'Trương Minh Hòa - Quản Lý Chất Lượng'
  ],
  hrStaff: [
    'Phạm Thị Hương - Nhân Sự - Hành Chính - Trưởng Phòng',
    'Lê Văn Tuấn - Nhân Sự - Hành Chính',
    'Trần Thị Linh - Nhân Sự - Hành Chính'
  ]
};

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
  console.log('\n🏥 BẮT ĐẦU THÊM NHÂN SỰ BỆNH VIỆN HẠG 1 TỈNH...\n');
  
  let totalAdded = 0;

  // 1. Giám đốc
  console.log('=== LÃNH ĐẠO ===');
  try {
    const existing = await prisma.user.findUnique({
      where: { email: generateEmail(staffNames.director) }
    });
    if (!existing) {
      await prisma.user.create({
        data: {
          name: staffNames.director,
          email: generateEmail(staffNames.director),
          password: 'password123',
          role: 'DIRECTOR'
        }
      });
      console.log('✓ ' + staffNames.director);
      totalAdded++;
    }
  } catch (e) {
    console.error('Lỗi:', e.message);
  }

  // 2. Phó Giám đốc
  for (const name of staffNames.deputyDirectors) {
    try {
      const existing = await prisma.user.findUnique({
        where: { email: generateEmail(name) }
      });
      if (!existing) {
        await prisma.user.create({
          data: {
            name,
            email: generateEmail(name),
            password: 'password123',
            role: 'DEPUTY_DIRECTOR'
          }
        });
        console.log('✓ ' + name);
        totalAdded++;
      }
    } catch (e) {
      console.error('Lỗi:', e.message);
    }
  }

  // 3. Kế toán
  console.log('\n=== KẾ TOÁN ===');
  for (const name of staffNames.accountants) {
    try {
      const existing = await prisma.user.findUnique({
        where: { email: generateEmail(name) }
      });
      if (!existing) {
        await prisma.user.create({
          data: {
            name,
            email: generateEmail(name),
            password: 'password123',
            role: 'ACCOUNTANT'
          }
        });
        console.log('✓ ' + name);
        totalAdded++;
      }
    } catch (e) {
      console.error('Lỗi:', e.message);
    }
  }

  // 4. CNTT
  console.log('\n=== CÔNG NGHỆ THÔNG TIN ===');
  for (const name of staffNames.itStaff) {
    try {
      const existing = await prisma.user.findUnique({
        where: { email: generateEmail(name) }
      });
      if (!existing) {
        await prisma.user.create({
          data: {
            name,
            email: generateEmail(name),
            password: 'password123',
            role: 'STAFF'
          }
        });
        console.log('✓ ' + name);
        totalAdded++;
      }
    } catch (e) {
      console.error('Lỗi:', e.message);
    }
  }

  // 5. Quản Lý Chất Lượng
  console.log('\n=== QUẢN LÝ CHẤT LƯỢNG ===');
  for (const name of staffNames.qualityStaff) {
    try {
      const existing = await prisma.user.findUnique({
        where: { email: generateEmail(name) }
      });
      if (!existing) {
        await prisma.user.create({
          data: {
            name,
            email: generateEmail(name),
            password: 'password123',
            role: 'STAFF'
          }
        });
        console.log('✓ ' + name);
        totalAdded++;
      }
    } catch (e) {
      console.error('Lỗi:', e.message);
    }
  }

  // 6. Nhân Sự
  console.log('\n=== NHÂN SỰ - HÀNH CHÍNH ===');
  for (const name of staffNames.hrStaff) {
    try {
      const existing = await prisma.user.findUnique({
        where: { email: generateEmail(name) }
      });
      if (!existing) {
        await prisma.user.create({
          data: {
            name,
            email: generateEmail(name),
            password: 'password123',
            role: 'STAFF'
          }
        });
        console.log('✓ ' + name);
        totalAdded++;
      }
    } catch (e) {
      console.error('Lỗi:', e.message);
    }
  }

  // 7. Thêm nhân sự khoa (10+ BS + 10+ ĐD/khoa)
  console.log('\n=== NHÂN SỰ CÁC KHOA ===');
  const departments = await prisma.department.findMany();
  
  const clinicalDepts = departments.filter(d => !d.name.includes('Phòng'));
  
  let doctorIndex = 0;
  let nurseIndex = 0;

  for (const dept of clinicalDepts) {
    const isPharmacy = dept.name.includes('Dược');
    const isNutrition = dept.name.includes('Dinh Dưỡng');
    const isLab = dept.name.includes('Xét Nghiệm') || dept.name.includes('Chẩn Đoán');
    
    // Trưởng khoa
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
        console.log(`✓ ${dept.name}: ${headName}`);
        totalAdded++;
      }
    } catch (e) {
      console.error(`Lỗi thêm Trưởng khoa ${dept.name}:`, e.message);
    }

    // Phó Trưởng khoa (3 người)
    for (let i = 0; i < 3; i++) {
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
          totalAdded++;
        }
      } catch (e) {
        console.error(`Lỗi thêm Phó Trưởng khoa ${dept.name}:`, e.message);
      }
    }

    // Bác sĩ (10-12 người/khoa)
    const numDoctors = isPharmacy || isNutrition ? 5 : isLab ? 8 : 12;
    for (let i = 0; i < numDoctors; i++) {
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
          totalAdded++;
        }
      } catch (e) {
        // Silent fail
      }
    }

    // Điều dưỡng (10-15 người/khoa, không có cho phòng ban)
    if (!dept.name.includes('Phòng')) {
      const numNurses = isPharmacy || isNutrition ? 0 : isLab ? 6 : 12;
      for (let i = 0; i < numNurses; i++) {
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
            totalAdded++;
          }
        } catch (e) {
          // Silent fail
        }
      }
    }
  }

  console.log(`\n✅ HOÀN TẤT! Đã thêm ${totalAdded} nhân sự.`);
}

main()
  .catch(e => {
    console.error('Lỗi:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
