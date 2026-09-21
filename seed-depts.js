const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const depts = [
    'Khoa Nội tổng hợp',
    'Khoa Ngoại tổng hợp',
    'Khoa Nhi',
    'Khoa Phụ Sản',
    'Khoa Mắt',
    'Khoa Tai Mũi Họng',
    'Khoa Răng Hàm Mặt',
    'Khoa Da liễu',
    'Khoa Chấn thương chỉnh hình',
    'Khoa Tim mạch',
    'Khoa Tiêu hóa'
  ];

  for (const name of depts) {
    const existing = await prisma.department.findFirst({ where: { name } });
    if (!existing) {
      await prisma.department.create({
        data: {
          name,
          description: 'Chuyên khoa ' + name
        }
      });
      console.log('Added ' + name);
    } else {
      console.log('Skipped ' + name);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
