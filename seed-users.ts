import { prisma } from './src/lib/prisma';

const lastNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý'];
const middleNamesM = ['Văn', 'Hữu', 'Đình', 'Xuân', 'Minh', 'Hoàng', 'Thanh', 'Đức', 'Trọng', 'Thành', 'Công', 'Hải'];
const middleNamesF = ['Thị', 'Thu', 'Ngọc', 'Phương', 'Thanh', 'Hồng', 'Mai', 'Bích', 'Kim', 'Diệu', 'Thúy'];
const firstNamesM = ['Anh', 'Tuấn', 'Dũng', 'Hùng', 'Minh', 'Hải', 'Thành', 'Bảo', 'Khoa', 'Kiên', 'Phong', 'Quân', 'Tùng', 'Đạt', 'Lâm', 'Nam', 'Long', 'Cường', 'Thắng'];
const firstNamesF = ['Anh', 'Linh', 'Trang', 'Hương', 'Lan', 'Hoa', 'Ngọc', 'Thảo', 'Nhung', 'Quỳnh', 'Oanh', 'Yến', 'Nga', 'Vy', 'My', 'Hiền', 'Thủy', 'Mai'];

function getRandomName() {
  const isMale = Math.random() > 0.5;
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  let middleName = '';
  let firstName = '';
  
  if (isMale) {
    middleName = middleNamesM[Math.floor(Math.random() * middleNamesM.length)];
    firstName = firstNamesM[Math.floor(Math.random() * firstNamesM.length)];
  } else {
    middleName = middleNamesF[Math.floor(Math.random() * middleNamesF.length)];
    firstName = firstNamesF[Math.floor(Math.random() * firstNamesF.length)];
  }

  // Tiền tố bác sĩ
  return `BS. ${lastName} ${middleName} ${firstName}`;
}

function getRandomPatientName() {
  const isMale = Math.random() > 0.5;
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const middleName = isMale ? middleNamesM[Math.floor(Math.random() * middleNamesM.length)] : middleNamesF[Math.floor(Math.random() * middleNamesF.length)];
  const firstName = isMale ? firstNamesM[Math.floor(Math.random() * firstNamesM.length)] : firstNamesF[Math.floor(Math.random() * firstNamesF.length)];
  return `${lastName} ${middleName} ${firstName}`;
}

async function main() {
  console.log('Bắt đầu cập nhật tên người dùng hiện tại...');
  
  const allUsers = await prisma.user.findMany({
    where: {
      role: { not: 'ADMIN' }
    }
  });

  for (const user of allUsers) {
    const newName = user.role === 'DOCTOR' ? getRandomName() : getRandomPatientName();
    await prisma.user.update({
      where: { id: user.id },
      data: { name: newName }
    });
  }
  console.log(`Đã cập nhật ${allUsers.length} người dùng hiện tại.`);

  console.log('Lấy danh sách chuyên khoa...');
  const departments = await prisma.department.findMany();
  if (departments.length === 0) {
    console.log('Chưa có khoa nào trong DB. Vui lòng chạy seed-depts trước.');
    return;
  }

  console.log(`Tìm thấy ${departments.length} chuyên khoa. Bắt đầu thêm Bác sĩ...`);
  
  let totalAdded = 0;

  for (const dept of departments) {
    // Random 10-15 bác sĩ
    const numDoctors = Math.floor(Math.random() * 6) + 10; 
    
    for (let i = 0; i < numDoctors; i++) {
      const name = getRandomName();
      // Generate email (remove 'BS. ', accents, spaces)
      const cleanName = name.replace('BS. ', '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').replace(/\s/g, '').toLowerCase();
      const email = `${cleanName}.${Math.floor(Math.random() * 10000)}@bvhungloi.vn`;
      
      await prisma.user.create({
        data: {
          name,
          email,
          password: 'password123', // Mật khẩu mặc định
          role: 'DOCTOR',
          doctorInfo: {
            create: {
              specialty: dept.name,
              departmentId: dept.id,
            }
          }
        }
      });
      totalAdded++;
    }
    console.log(`Đã thêm ${numDoctors} bác sĩ cho ${dept.name}`);
  }

  console.log(`Hoàn tất! Tổng cộng đã thêm ${totalAdded} Bác sĩ mới.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
