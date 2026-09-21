import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

const ADMIN_DEPTS = [
  'Phòng Công Nghệ Thông Tin',
  'Phòng Kế Toán - Tài Chính',
  'Phòng Nhân Sự - Hành Chính',
  'Phòng Vệ Sinh và Bảo Vệ',
  'Phòng Quản Lý Chất Lượng',
  'Phòng Đào Tạo - Nghiên Cứu Khoa Học'
];

async function main() {
  console.log('🔄 Đang đổi tên khoa Vệ sinh & Bảo vệ...');
  await prisma.department.updateMany({
    where: { name: 'Phòng Vệ Sinh' },
    data: { name: 'Phòng Vệ Sinh và Bảo Vệ' }
  });

  const allDepts = await prisma.department.findMany();
  const deptMap: Record<string, string> = {};
  allDepts.forEach(d => { deptMap[d.name] = d.id; });

  const password = await bcrypt.hash('nhansu123', 10);
  let idCounter = 9000;

  async function addStaff(deptName: string, name: string, position: string) {
    const deptId = deptMap[deptName];
    if (!deptId) return;
    idCounter++;
    const email = `staff_${idCounter}@bvhungloi.vn`;

    // Tạo User
    const user = await prisma.user.create({
      data: {
        email,
        password,
        name,
        role: 'STAFF', // Vẫn là STAFF
        phone: '090' + Math.floor(Math.random() * 9000000 + 1000000),
      }
    });

    // Tạo Nurse (nhưng coi như là Staff record để liên kết với department)
    await prisma.nurse.create({
      data: {
        userId: user.id,
        departmentId: deptId,
        position
      }
    });
  }

  // 1. Thêm nhân sự
  console.log('👥 Đang bổ sung nhân sự chức năng...');
  
  await addStaff('Phòng Công Nghệ Thông Tin', 'KS. Hoàng Đức Minh', 'Trưởng phòng CNTT');
  await addStaff('Phòng Công Nghệ Thông Tin', 'KS. Vũ Văn Hùng', 'Kỹ sư hệ thống');
  await addStaff('Phòng Công Nghệ Thông Tin', 'KS. Trần Văn Khoa', 'Chuyên viên Mạng');

  await addStaff('Phòng Kế Toán - Tài Chính', 'Nguyễn Văn Thắng', 'Kế toán trưởng');
  await addStaff('Phòng Kế Toán - Tài Chính', 'Lê Thị Thu Hằng', 'Kế toán viên');
  await addStaff('Phòng Kế Toán - Tài Chính', 'Phạm Văn Long', 'Thủ quỹ');

  await addStaff('Phòng Nhân Sự - Hành Chính', 'Nguyễn Thị Hồng Vân', 'Trưởng phòng Nhân sự');
  await addStaff('Phòng Nhân Sự - Hành Chính', 'Lê Văn Toàn', 'Chuyên viên Hành chính');
  await addStaff('Phòng Nhân Sự - Hành Chính', 'Bùi Thị Lan Anh', 'Lễ tân');

  await addStaff('Phòng Vệ Sinh và Bảo Vệ', 'Đội trưởng Nguyễn Văn Tài', 'Trưởng bộ phận');
  await addStaff('Phòng Vệ Sinh và Bảo Vệ', 'Trần Thị Kim Hoa', 'Nhân viên vệ sinh');
  await addStaff('Phòng Vệ Sinh và Bảo Vệ', 'Lê Văn Chính', 'Nhân viên vệ sinh');
  await addStaff('Phòng Vệ Sinh và Bảo Vệ', 'Lê Đình Bảo', 'Bảo vệ nội bộ');
  await addStaff('Phòng Vệ Sinh và Bảo Vệ', 'Trần Anh Tuấn', 'Bảo vệ cổng chính');

  await addStaff('Phòng Quản Lý Chất Lượng', 'ThS. Lê Thị Thu Hường', 'Trưởng phòng QLCL');
  await addStaff('Phòng Quản Lý Chất Lượng', 'Trần Thị Kim Chi', 'Chuyên viên đánh giá');

  await addStaff('Phòng Đào Tạo - Nghiên Cứu Khoa Học', 'TS. Phạm Thị Minh Hoa', 'Trưởng phòng NCKH');
  await addStaff('Phòng Đào Tạo - Nghiên Cứu Khoa Học', 'Trần Thị Phương Thảo', 'Chuyên viên đào tạo');

  // 2. Thêm mỗi phòng 1 phòng làm việc
  console.log('🏢 Đang cấp phòng làm việc (Room)...');
  for (const deptName of ADMIN_DEPTS) {
    const deptId = deptMap[deptName];
    if (deptId) {
      // Check nếu đã có phòng thì bỏ qua
      const existingRooms = await prisma.room.count({ where: { departmentId: deptId } });
      if (existingRooms === 0) {
        await prisma.room.create({
          data: {
            name: `Văn phòng - ${deptName}`,
            type: 'NORMAL',
            status: 'AVAILABLE',
            capacity: 10,
            ratePerDay: 0,
            description: 'Văn phòng làm việc hành chính',
            departmentId: deptId
          }
        });
      }
    }
  }

  console.log('✅ Hoàn tất!');
}

main().finally(() => prisma.$disconnect());
