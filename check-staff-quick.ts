const { PrismaClient } = require('./src/generated/prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('\n📊 TỔNG QUAN NHÂN SỰ:\n');
  
  const depts = await prisma.department.findMany();
  const clinicalDepts = depts.filter(d => !d.name.includes('Phòng'));
  
  let totalDoctors = 0;
  let totalNurses = 0;
  let deptOK = 0;
  let deptNeedFix = 0;

  for (const dept of clinicalDepts) {
    const doctors = await prisma.doctor.findMany({
      where: { departmentId: dept.id },
      include: { user: true }
    });
    
    const nurses = await prisma.user.findMany({
      where: { role: 'NURSE' }
    });

    totalDoctors += doctors.length;
    totalNurses += nurses.length;
    
    if (doctors.length >= 14 && nurses.length >= 10) {
      deptOK++;
    } else {
      deptNeedFix++;
      console.log(`❌ ${dept.name}: BS=${doctors.length} ĐD=${nurses.length}`);
    }
  }

  console.log(`\n✅ Đủ logic: ${deptOK}/${clinicalDepts.length} khoa`);
  console.log(`⚠️  Cần bổ sung: ${deptNeedFix}/${clinicalDepts.length} khoa`);
  console.log(`\n👨‍⚕️  Tổng BS: ${totalDoctors}`);
  console.log(`👩‍⚕️  Tổng ĐD: ${totalNurses}`);
  
  await prisma.$disconnect();
}

main();
