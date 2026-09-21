const { PrismaClient } = require('./src/generated/prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' });
const prisma = new PrismaClient({ adapter });

async function main() {
  const depts = await prisma.department.findMany();
  const clinicalDepts = depts.filter(d => !d.name.includes('Phòng'));
  const adminDepts = depts.filter(d => d.name.includes('Phòng'));
  
  console.log('\n📊 THỐNG KÊ KHOA/PHÒNG BAN:\n');
  console.log('🏥 KHOA LÂMM SÀN: ' + clinicalDepts.length);
  clinicalDepts.forEach((d, i) => console.log('   ' + (i+1) + '. ' + d.name));
  
  console.log('\n🏢 PHÒNG BAN HÀNH CHÍNH: ' + adminDepts.length);
  adminDepts.forEach((d, i) => console.log('   ' + (i+1) + '. ' + d.name));
  
  console.log('\n📈 TỔNG CỘNG: ' + depts.length + ' khoa/phòng ban');
  
  await prisma.$disconnect();
}

main();
