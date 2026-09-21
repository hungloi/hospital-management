import { prisma } from '../src/lib/prisma';
async function main() {
  const depts = await prisma.department.findMany();
  for (const dept of depts) {
    if (dept.name === 'Phòng Vệ Sinh - Khám Chữa Bệnh' || dept.name === 'Phòng Vệ Sinh - Khám Chửa Bệnh') {
      await prisma.department.update({
        where: { id: dept.id },
        data: { name: 'Phòng Vệ Sinh' }
      });
      console.log('✅ Đã đổi tên thành Phòng Vệ Sinh');
    }
  }
}
main().finally(() => prisma.$disconnect());
