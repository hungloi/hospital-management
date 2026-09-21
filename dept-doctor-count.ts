const { PrismaClient } = require('./src/generated/prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' });
const prisma = new PrismaClient({ adapter });

async function main(){
  const depts = await prisma.department.findMany();
  for(const d of depts){
    const count = await prisma.doctor.count({ where: { departmentId: d.id } });
    console.log(`${d.name} -> ${count}`);
  }
  await prisma.$disconnect();
}
main();
