import { prisma } from './src/lib/prisma';

const lastNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý'];
const middleNamesM = ['Văn', 'Hữu', 'Đình', 'Xuân', 'Minh', 'Hoàng', 'Thanh', 'Đức', 'Trọng', 'Thành', 'Công', 'Hải'];
const middleNamesF = ['Thị', 'Thu', 'Ngọc', 'Phương', 'Thanh', 'Hồng', 'Mai', 'Bích', 'Kim', 'Diệu', 'Thúy'];
const firstNamesM = ['Anh', 'Tuấn', 'Dũng', 'Hùng', 'Minh', 'Hải', 'Thành', 'Bảo', 'Khoa', 'Kiên', 'Phong', 'Quân', 'Tùng', 'Đạt', 'Lâm', 'Nam', 'Long', 'Cường', 'Thắng'];
const firstNamesF = ['Anh', 'Linh', 'Trang', 'Hương', 'Lan', 'Hoa', 'Ngọc', 'Thảo', 'Nhung', 'Quỳnh', 'Oanh', 'Yến', 'Nga', 'Vy', 'My', 'Hiền', 'Thủy', 'Mai'];

function getRandomName() {
  const isMale = Math.random() > 0.5;
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const middleName = isMale ? middleNamesM[Math.floor(Math.random() * middleNamesM.length)] : middleNamesF[Math.floor(Math.random() * middleNamesF.length)];
  const firstName = isMale ? firstNamesM[Math.floor(Math.random() * firstNamesM.length)] : firstNamesF[Math.floor(Math.random() * firstNamesF.length)];
  return `${lastName} ${middleName} ${firstName}`;
}

function generateEmail(name: string) {
  const cleanName = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').replace(/\s/g, '').toLowerCase();
  return `${cleanName}.${Math.floor(Math.random() * 10000)}@bvhungloi.vn`;
}

async function main() {
  console.log('Bắt đầu thêm Nhân viên (STAFF) cho các phòng ban...');

  const targetDepts = ['Phòng Quản lý Chất lượng', 'Phòng Công nghệ Thông tin', 'Phòng Kế hoạch Tổng hợp'];
  
  let count = 0;
  for (const deptName of targetDepts) {
    const dept = await prisma.department.findUnique({ where: { name: deptName } });
    if (!dept) continue;

    for (let i = 0; i < 5; i++) {
      const name = getRandomName();
      await prisma.user.create({
        data: {
          name,
          email: generateEmail(name),
          password: 'password123',
          role: 'STAFF',
          doctorInfo: {
            create: {
              specialty: 'Nhân viên Hành chính',
              departmentId: dept.id
            }
          }
        }
      });
      count++;
    }
  }

  console.log(`Đã thêm thành công ${count} nhân viên.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
