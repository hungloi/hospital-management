import { prisma } from '../src/lib/prisma';
async function main() {
  const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
  console.log('Admins:');
  admins.forEach((a: any) => console.log(`- Tên: ${a.name} | Email: ${a.email} | Chức vụ: Giám đốc`));
}
main().finally(() => prisma.$disconnect());
