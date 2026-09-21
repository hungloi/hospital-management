const { PrismaClient } = require('./src/generated/prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' });
const prisma = new PrismaClient({ adapter });

const baseNames = [
  'BS. Nguyễn Văn A','BS. Trần Văn B','BS. Lê Văn C','BS. Phạm Văn D','BS. Hoàng Văn E',
  'BS. Vũ Thị F','BS. Đỗ Thị G','BS. Bùi Thị H','BS. Đặng Văn I','BS. Ngô Thị J'
];

function normalizeEmail(name){
  return name.replace(/^(BS\.|TS\.BS\.|PGS\.TS\.BS\.|ĐD\.|.*-\s)/g, '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').replace(/\s+/g,'.').toLowerCase() + '@bvhungloi.vn';
}

async function main(){
  const depts = await prisma.department.findMany();
  let index = 0;
  let created = 0;
  for(const dept of depts){
    if (dept.name.includes('Phòng')) continue;
    const count = await prisma.doctor.count({ where: { departmentId: dept.id } });
    const need = Math.max(0, 14 - count);
    if (need === 0) continue;
    console.log(`▶ ${dept.name}: cần thêm ${need} BS`);
    for(let i=0;i<need;i++){
      // generate a semi-unique name
      let candidate = baseNames[index % baseNames.length];
      // append number to make unique
      const suffix = Math.floor(index / baseNames.length) + 1;
      const name = candidate + ' ' + suffix;
      index++;
      const email = normalizeEmail(name);
      // ensure user
      let user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        user = await prisma.user.create({ data: { name, email, password: 'password123', role: 'DOCTOR' } });
      }
      const existingDoc = await prisma.doctor.findFirst({ where: { userId: user.id } });
      if (!existingDoc) {
        await prisma.doctor.create({ data: { specialty: dept.name, licenseNo: '', userId: user.id, departmentId: dept.id } });
        created++;
      } else if (existingDoc.departmentId !== dept.id) {
        await prisma.doctor.update({ where: { id: existingDoc.id }, data: { departmentId: dept.id, specialty: dept.name } });
      }
    }
  }
  console.log(`\n✅ Hoàn tất: đã bổ sung/điều chỉnh ${created} bác sĩ.`);
  await prisma.$disconnect();
}

main().catch(e=>{console.error(e); process.exit(1);});