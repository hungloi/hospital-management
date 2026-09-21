import { prisma } from '../src/lib/prisma';

async function main() {
  const admin = await prisma.user.findUnique({ where: { email: 'admin@medicare.com' } });
  console.log('admin@medicare.com:', admin ? admin.password : 'NOT FOUND');
  
  const bs = await prisma.user.findUnique({ where: { email: 'bs.nguyenvana@medicare.com' } });
  console.log('bs.nguyenvana@medicare.com:', bs ? bs.password : 'NOT FOUND');
  
  const bn = await prisma.user.findUnique({ where: { email: 'benhnhan@gmail.com' } });
  console.log('benhnhan@gmail.com:', bn ? bn.password : 'NOT FOUND');
}

main().catch(console.error).finally(() => prisma.$disconnect());
