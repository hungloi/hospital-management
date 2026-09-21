const { PrismaClient } = require('./src/generated/prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' });
const prisma = new PrismaClient({ adapter });

const nursePool = [
  'ĐD. Vũ Thị Hồng','ĐD. Phạm Thị Thanh','ĐD. Trần Thị Yến','ĐD. Nguyễn Thị Thu','ĐD. Lê Thị Linh',
  'ĐD. Đỗ Thị Hảo','ĐD. Hoàng Thị Duyên','ĐD. Bùi Thị Loan','ĐD. Trương Thị Huyền','ĐD. Ngô Thị Vân',
  'ĐD. Lý Thị Hà','ĐD. Đặng Thị Hợp','ĐD. Vũ Thị Tuyến','ĐD. Phạm Thị Hạnh','ĐD. Trần Thị Linh',
  'ĐD. Nguyễn Thị Kim','ĐD. Lê Thị Thắm','ĐD. Đỗ Thị Ngân','ĐD. Hoàng Thị Sơn','ĐD. Bùi Thị Tính',
  'ĐD. Lê Thị Mai','ĐD. Đỗ Thị Thanh','ĐD. Hoàng Thị Tú','ĐD. Ngô Thị Bích','ĐD. Bùi Thị Ngọc',
  'ĐD. Trương Thị Yến','ĐD. Đặng Thị Thu','ĐD. Lý Thị Hương','ĐD. Nguyễn Thị Kim','ĐD. Vũ Thị Diệp'
];

function generateEmail(name){
  return name.replace(/^(BS\.|TS\.BS\.|PGS\.TS\.BS\.|ĐD\.|.*-\s)/g,'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').replace(/\s+/g,'.').toLowerCase()+'.n@bvhungloi.vn';
}

async function ensureNurseForDept(name, deptId){
  const email = generateEmail(name);
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({ data: { name, email, password: 'password123', role: 'NURSE' } });
  } else if (user.role !== 'NURSE'){
    user = await prisma.user.update({ where: { id: user.id }, data: { role: 'NURSE' } });
  }

  let nurse = await prisma.nurse.findFirst({ where: { userId: user.id } });
  if (!nurse) {
    nurse = await prisma.nurse.create({ data: { userId: user.id, departmentId: deptId, position: 'Staff Nurse' } });
  } else if (nurse.departmentId !== deptId) {
    await prisma.nurse.update({ where: { id: nurse.id }, data: { departmentId: deptId } });
  }
  return nurse;
}

async function main(){
  console.log('🔧 Gắn/Thêm điều dưỡng cho từng khoa (>=10 mỗi khoa) ...\n');
  const depts = await prisma.department.findMany();
  const clinicalDepts = depts.filter(d => !d.name.includes('Phòng'));
  let idx = 0;
  let created = 0;

  for(const dept of clinicalDepts){
    const currentCount = await prisma.nurse.count({ where: { departmentId: dept.id } });
    const need = Math.max(0, 10 - currentCount);
    if (need === 0) continue;
    console.log(`▶ ${dept.name}: cần thêm ${need} điều dưỡng`);
    for(let i=0;i<need;i++){
      const name = nursePool[idx % nursePool.length] + ' ' + Math.floor(idx / nursePool.length + 1);
      idx++;
      await ensureNurseForDept(name, dept.id);
      created++;
    }
  }

  console.log(`\n✅ Hoàn tất: đã tạo/gắn ${created} điều dưỡng.`);
  await prisma.$disconnect();
}

main().catch(e=>{console.error(e); process.exit(1);});