const { PrismaClient } = require('./src/generated/prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' });
const prisma = new PrismaClient({ adapter });

// Dữ liệu nhân viên thực tế cho bệnh viện hạng 1
const staff = {
  director: 'PGS.TS.BS. Trịnh Hưng Lợi',
  deputyDirectors: [
    'TS.BS. Phạm Quốc Tuấn',
    'TS.BS. Nguyễn Thị Thanh Hương',
    'TS.BS. Đặng Minh Khoa'
  ],
  headDoctors: {
    'Khoa Nội tổng hợp': 'TS.BS. Trần Anh Tuấn',
    'Khoa Ngoại tổng hợp': 'TS.BS. Vũ Đình Hùng',
    'Khoa Nhi': 'TS.BS. Nguyễn Thị Lan',
    'Khoa Phụ Sản': 'TS.BS. Lê Thị Mỹ Hạnh',
    'Khoa Mắt': 'BS. Hoàng Văn Sơn',
    'Khoa Tai Mũi Họng': 'BS. Bùi Quốc Huy',
    'Khoa Răng Hàm Mặt': 'BS. Đỗ Thị Hương',
    'Khoa Da liễu': 'BS. Phạm Văn Minh',
    'Khoa Chấn thương chỉnh hình': 'TS.BS. Trương Nhân Khánh',
    'Khoa Tim mạch': 'TS.BS. Lý Anh Đức',
    'Khoa Tiêu hóa': 'BS. Ngô Thanh Bình',
    'Khoa Thần kinh': 'TS.BS. Trần Thị Nguyệt',
    'Khoa Hô hấp': 'BS. Võ Văn Chính',
    'Khoa Nội tiết': 'BS. Đinh Thị Hồng',
    'Khoa Ung bướu': 'TS.BS. Hà Văn Tú',
    'Khoa Cấp cứu': 'TS.BS. Lê Hoàng Phúc',
    'Khoa Phục hồi chức năng': 'BS. Trần Văn Nam',
    'Khoa Y học cổ truyền': 'BS. Nguyễn Thái Bảo',
    'Khoa Truyền nhiễm': 'TS.BS. Lê Thị Thanh',
    'Khoa Xét nghiệm': 'BS. Phạm Minh Tuấn',
    'Khoa Chẩn đoán hình ảnh': 'TS.BS. Vũ Thị Hương'
  },
  deputyHeadDoctors: {
    'Khoa Nội tổng hợp': ['BS. Nguyễn Văn Bình', 'BS. Trần Thị Huệ'],
    'Khoa Ngoại tổng hợp': ['BS. Phạm Văn Sơn', 'BS. Đặng Thị Linh'],
    'Khoa Nhi': ['BS. Vũ Hữu Thiện'],
    'Khoa Phụ Sản': ['BS. Ngô Thị Hồng'],
    'Khoa Mắt': ['BS. Trương Văn Nhân'],
    'Khoa Tai Mũi Họng': ['BS. Lê Thị Thanh'],
    'Khoa Răng Hàm Mặt': ['BS. Huỳnh Anh Tuấn'],
    'Khoa Da liễu': ['BS. Lý Thị Diễm'],
    'Khoa Chấn thương chỉnh hình': ['BS. Trần Văn Hòa'],
    'Khoa Tim mạch': ['BS. Nguyễn Minh Tuấn'],
    'Khoa Tiêu hóa': ['BS. Phạm Thị Liên'],
    'Khoa Thần kinh': ['BS. Đỗ Văn Hiếu'],
    'Khoa Hô hấp': ['BS. Nguyễn Thị Hương'],
    'Khoa Nội tiết': ['BS. Trần Anh Sơn'],
    'Khoa Ung bướu': ['BS. Lê Văn Hùng'],
    'Khoa Cấp cứu': ['BS. Vũ Thanh Long', 'BS. Phạm Thị Thu'],
    'Khoa Phục hồi chức năng': ['BS. Ngô Văn Kiên'],
    'Khoa Y học cổ truyền': ['BS. Bùi Thị Mai'],
    'Khoa Truyền nhiễm': ['BS. Đặng Minh Hoàn'],
    'Khoa Xét nghiệm': ['BS. Hoàng Thị Hương'],
    'Khoa Chẩn đoán hình ảnh': ['BS. Lý Văn Đức']
  },
  doctors: {
    'Khoa Nội tổng hợp': [
      'BS. Trịnh Văn Tú',
      'BS. Nguyễn Hữu Dũng',
      'BS. Trần Hữu Phúc',
      'BS. Vũ Minh Hoàng',
      'BS. Phạm Việt Cường',
      'BS. Lê Văn Thắng',
      'BS. Đỗ Thị Hoa',
      'BS. Ngô Thanh Hải'
    ],
    'Khoa Ngoại tổng hợp': [
      'BS. Hoàng Văn Lâm',
      'BS. Trương Anh Dũng',
      'BS. Nguyễn Văn Kiên',
      'BS. Bùi Hữu Trung',
      'BS. Đặng Thái Bảo',
      'BS. Vũ Thị Linh',
      'BS. Phạm Văn Hải'
    ],
    'Khoa Nhi': [
      'BS. Lý Văn Hùng',
      'BS. Trần Thị Tú Anh',
      'BS. Nguyễn Minh Khoa',
      'BS. Phạm Đình Tuấn'
    ],
    'Khoa Phụ Sản': [
      'BS. Vũ Hằng Nga',
      'BS. Ngô Thị Thu Thảo',
      'BS. Trần Minh Tuấn',
      'BS. Hoàng Thanh Hương'
    ],
    'Khoa Cấp cứu': [
      'BS. Lê Văn Huy',
      'BS. Trịnh Minh Vũ',
      'BS. Nguyễn Thái Lâm',
      'BS. Bùi Văn Hòa',
      'BS. Phạm Thanh Tuấn'
    ]
  },
  nurses: {
    'Khoa Nội tổng hợp': [
      'ĐD. Trần Thị Lan', 'ĐD. Nguyễn Thị Hoa', 'ĐD. Vũ Thị Hương', 'ĐD. Phạm Thị Linh',
      'ĐD. Lê Thị Mai', 'ĐD. Đỗ Thị Thanh', 'ĐD. Hoàng Thị Tú', 'ĐD. Ngô Thị Bích',
      'ĐD. Bùi Thị Ngọc', 'ĐD. Trương Thị Yến', 'ĐD. Đặng Thị Thu', 'ĐD. Lý Thị Hương',
      'ĐD. Nguyễn Thị Kim', 'ĐD. Vũ Thị Diệp', 'ĐD. Phạm Thị Hồng', 'ĐD. Trần Thị Bích',
      'ĐD. Lê Văn Anh', 'ĐD. Ngô Văn Hùng', 'ĐD. Bùi Văn Tuấn', 'ĐD. Đỗ Văn Minh'
    ],
    'Khoa Ngoại tổng hợp': [
      'ĐD. Hoàng Thị Ngọc', 'ĐD. Trần Thị Hương', 'ĐD. Nguyễn Thị Linh', 'ĐD. Vũ Thị Tú',
      'ĐD. Phạm Thị Thu', 'ĐD. Lê Thị Hạnh', 'ĐD. Đặng Thị Hoa', 'ĐD. Bùi Thị Mai',
      'ĐD. Ngô Thị Loan', 'ĐD. Trương Thị Anh', 'ĐD. Lý Thị Hồng', 'ĐD. Đỗ Thị Xuân',
      'ĐD. Nguyễn Thị Yến', 'ĐD. Vũ Thị Hạ', 'ĐD. Phạm Thị Kim', 'ĐD. Trần Thị Liên',
      'ĐD. Lê Thị Diễm', 'ĐD. Hoàng Văn Tuấn', 'ĐD. Ngô Văn Long', 'ĐD. Bùi Văn Phong'
    ],
    'Khoa Nhi': [
      'ĐD. Trần Thị Hạnh', 'ĐD. Nguyễn Thị Thảo', 'ĐD. Vũ Thị Hương', 'ĐD. Phạm Thị Lệ',
      'ĐD. Lê Thị Hồng', 'ĐD. Đặng Thị Phương', 'ĐD. Bùi Thị Hiền', 'ĐD. Ngô Thị Lan',
      'ĐD. Trương Thị Ngân', 'ĐD. Lý Thị Thanh', 'ĐD. Đỗ Thị Tú', 'ĐD. Nguyễn Thị Ánh',
      'ĐD. Vũ Thị Hà', 'ĐD. Phạm Thị Vy', 'ĐD. Trần Thị Huyền'
    ],
    'Khoa Phụ Sản': [
      'ĐD. Hoàng Thị Hiền', 'ĐD. Nguyễn Thị Duyên', 'ĐD. Vũ Thị Quỳnh', 'ĐD. Phạm Thị Dân',
      'ĐD. Lê Thị Ngân', 'ĐD. Trần Thị Nhân', 'ĐD. Đặng Thị Hạo', 'ĐD. Bùi Thị Ánh',
      'ĐD. Ngô Thị Thúy', 'ĐD. Lý Thị Huyền', 'ĐD. Đỗ Thị Hạnh', 'ĐD. Trương Thị Loan',
      'ĐD. Nguyễn Thị Liên', 'ĐD. Vũ Thị Anh', 'ĐD. Phạm Thị Hương'
    ],
    'Khoa Cấp cứu': [
      'ĐD. Lê Thị Xuân', 'ĐD. Trần Thị Hương', 'ĐD. Nguyễn Thị Phượng', 'ĐD. Vũ Thị Huyền',
      'ĐD. Phạm Thị Lan', 'ĐD. Đặng Thị Hồng', 'ĐD. Bùi Thị Tú', 'ĐD. Hoàng Thị Ân',
      'ĐD. Ngô Thị Thanh', 'ĐD. Trương Thị Hà', 'ĐD. Lý Thị Mỹ', 'ĐD. Đỗ Thị Liễu',
      'ĐD. Nguyễn Thị Hạnh', 'ĐD. Vũ Thị Tuyền', 'ĐD. Phạm Thị Hạnh', 'ĐD. Trần Thị Linh',
      'ĐD. Lê Thị Thắm', 'ĐD. Hoàng Văn Sỹ', 'ĐD. Ngô Văn Huy', 'ĐD. Bùi Văn Cơ'
    ]
  },
  accountants: [
    'Kế Toán Trưởng: Nguyễn Thị Hạnh',
    'Kế Toán: Vũ Minh Hùng',
    'Kế Toán: Phạm Thị Linh',
    'Kế Toán: Đặng Văn Tuấn',
    'Kế Toán: Trần Thị Hương'
  ]
};

function generateEmail(name: string): string {
  const cleanName = name
    .replace(/^(PGS\.TS\.BS\.|TS\.BS\.|BS\.|ĐD\.|Kế Toán Trưởng:|Kế Toán:)\s+/g, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/\s+/g, '.')
    .toLowerCase();
  return `${cleanName}@bvhungloi.vn`;
}

async function main() {
  console.log('Bắt đầu thêm nhân sự bệnh viện hạng 1...\n');
  
  let totalAdded = 0;

  // 1. Giám đốc
  try {
    const existingDirector = await prisma.user.findUnique({
      where: { email: generateEmail(staff.director) }
    });
    if (!existingDirector) {
      await prisma.user.create({
        data: {
          name: staff.director,
          email: generateEmail(staff.director),
          password: 'password123',
          role: 'DIRECTOR'
        }
      });
      console.log('✓ Giám đốc: ' + staff.director);
      totalAdded++;
    }
  } catch (e) {
    console.error('Lỗi thêm Giám đốc:', e);
  }

  // 2. Phó Giám đốc
  for (const name of staff.deputyDirectors) {
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
        console.log('✓ Phó Giám đốc: ' + name);
        totalAdded++;
      }
    } catch (e) {
      console.error('Lỗi thêm Phó Giám đốc:', e);
    }
  }

  // 3. Kế toán
  console.log('\nKế toán:');
  for (const name of staff.accountants) {
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
      console.error('Lỗi thêm Kế toán:', e);
    }
  }

  // 4. Trưởng khoa, Phó khoa, Bác sĩ, Điều dưỡng
  const departments = await prisma.department.findMany();
  console.log('\nThêm nhân sự các khoa:');

  for (const dept of departments) {
    console.log(`\n▶ ${dept.name}`);

    // Trưởng khoa
    const headName = staff.headDoctors[dept.name as keyof typeof staff.headDoctors];
    if (headName) {
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
          console.log('  ✓ Trưởng khoa: ' + headName);
          totalAdded++;
        }
      } catch (e) {
        console.error('  ✗ Lỗi thêm Trưởng khoa:', e);
      }
    }

    // Phó Trưởng khoa
    const deputyHeads = staff.deputyHeadDoctors[dept.name as keyof typeof staff.deputyHeadDoctors] || [];
    for (const deputyName of deputyHeads) {
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
          console.log('  ✓ Phó Trưởng khoa: ' + deputyName);
          totalAdded++;
        }
      } catch (e) {
        console.error('  ✗ Lỗi thêm Phó Trưởng khoa:', e);
      }
    }

    // Bác sĩ
    const doctorList = staff.doctors[dept.name as keyof typeof staff.doctors] || [];
    for (const doctorName of doctorList) {
      try {
        const existing = await prisma.user.findUnique({
          where: { email: generateEmail(doctorName) }
        });
        if (!existing) {
          await prisma.user.create({
            data: {
              name: doctorName,
              email: generateEmail(doctorName),
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
          console.log('  ✓ Bác sĩ: ' + doctorName);
          totalAdded++;
        }
      } catch (e) {
        console.error('  ✗ Lỗi thêm Bác sĩ:', e);
      }
    }

    // Điều dưỡng
    const nurseList = staff.nurses[dept.name as keyof typeof staff.nurses] || [];
    for (const nurseName of nurseList) {
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
          console.log('  ✓ Điều dưỡng: ' + nurseName);
          totalAdded++;
        }
      } catch (e) {
        console.error('  ✗ Lỗi thêm Điều dưỡng:', e);
      }
    }
  }

  console.log(`\n✓ Hoàn tất! Đã thêm ${totalAdded} nhân sự.`);
}

main()
  .catch(e => {
    console.error('Lỗi:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
