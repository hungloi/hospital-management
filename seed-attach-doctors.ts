const { PrismaClient } = require('./src/generated/prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' });
const prisma = new PrismaClient({ adapter });

const doctorNames = [
  'BS. Trần Văn Kiên','BS. Vũ Văn Lâm','BS. Phạm Thị Hoa','BS. Nguyễn Văn Dũng','BS. Lê Thị Thanh',
  'BS. Đỗ Văn Hùng','BS. Hoàng Thị Linh','BS. Bùi Văn Hòa','BS. Trương Minh Long','BS. Ngô Thanh Hương',
  'BS. Lý Văn Sơn','BS. Đặng Minh Huy','BS. Vũ Hữu Tuấn','BS. Phạm Văn Quyền','BS. Trần Thị Hạnh',
  'BS. Nguyễn Minh Hùng','BS. Lê Văn Hòa','BS. Hoàng Văn Dũng','BS. Bùi Thị Hạnh','BS. Trương Thị Ngân',
  'BS. Ngô Minh Tuấn','BS. Lý Thị Phương','BS. Đặng Văn Tuấn','BS. Vũ Thị Liên','BS. Phạm Minh Hòa',
  'BS. Trần Văn Hải','BS. Nguyễn Thị Hà','BS. Đỗ Văn Kiên','BS. Bùi Minh Tuấn','BS. Trương Văn Hùng',
  'BS. Ngô Thị Hạnh','BS. Lý Văn Hòa','BS. Đặng Thị Yến','BS. Vũ Minh Huy','BS. Phạm Thị Loan',
  'BS. Trần Thị Hồng','BS. Nguyễn Văn Long','BS. Lê Minh Tuấn','BS. Trịnh Văn Tú','BS. Nguyễn Hữu Dũng',
  'BS. Trần Hữu Phúc','BS. Vũ Minh Hoàng','BS. Phạm Việt Cường','BS. Lê Văn Thắng','BS. Đỗ Thị Hoa',
  'BS. Ngô Thanh Hải','BS. Hoàng Văn Lâm','BS. Trương Anh Dũng','BS. Nguyễn Văn Kiên','BS. Bùi Hữu Trung',
  'BS. Đặng Thái Bảo','BS. Vũ Thị Linh','BS. Phạm Văn Hải','BS. Lý Văn Hùng','BS. Trần Thị Tú Anh',
  'BS. Nguyễn Minh Khoa','BS. Phạm Đình Tuấn','BS. Vũ Hằng Nga','BS. Ngô Thị Thu Thảo','BS. Trần Minh Tuấn',
  'BS. Hoàng Thanh Hương','BS. Lê Văn Huy','BS. Trịnh Minh Vũ','BS. Nguyễn Thái Lâm','BS. Phạm Thanh Tuấn'
];

function generateEmail(name) {
  return name.replace(/^(BS\.|TS\.BS\.|PGS\.TS\.BS\.|ĐD\.|.*-\s)/g, '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').replace(/\s+/g,'.').toLowerCase() + '@bvhungloi.vn';
}

async function ensureUser(name, role='DOCTOR'){
  const email = generateEmail(name);
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({ data: { name, email, password: 'password123', role } });
  } else {
    if (role && user.role !== role) {
      // update role if needed
      user = await prisma.user.update({ where: { id: user.id }, data: { role } });
    }
  }
  return user;
}

async function main(){
  console.log('🔗 Gắn doctors vào từng khoa (1 Trưởng, 3 Phó, >=10 BS mỗi khoa)...\n');
  const departments = await prisma.department.findMany();
  const clinicalDepts = departments.filter(d => !d.name.includes('Phòng'));

  let dIndex = 0;
  let created = 0;

  for(const dept of clinicalDepts){
    // fetch doctors linked to this dept
    const docs = await prisma.doctor.findMany({ where: { departmentId: dept.id }, include: { user: true } });
    const usersInDept = docs.map(d => d.user);

    // Ensure head
    let head = usersInDept.find(u => u.role === 'HEAD_DOCTOR');
    if(!head){
      // pick or create user and set role
      const name = doctorNames[dIndex % doctorNames.length]; dIndex++;
      const user = await ensureUser(name, 'HEAD_DOCTOR');
      // check existing doctor record
      const existingDocForUser = await prisma.doctor.findFirst({ where: { userId: user.id } });
      if (!existingDocForUser) {
        await prisma.doctor.create({ data: { specialty: dept.name, licenseNo: '', userId: user.id, departmentId: dept.id } });
        created++;
        console.log(`✓ Thêm Trưởng khoa ${dept.name}: ${name}`);
      } else {
        // update departmentId and specialty if needed
        await prisma.doctor.update({ where: { id: existingDocForUser.id }, data: { departmentId: dept.id, specialty: dept.name } });
        console.log(`✓ Cập nhật Trưởng khoa ${dept.name} cho user đã tồn tại: ${name}`);
      }
    }

    // Refresh docs list
    const docsAfterHead = await prisma.doctor.findMany({ where: { departmentId: dept.id }, include: { user: true } });
    const numDocs = docsAfterHead.length;

    // Ensure at least 14 doctors total (1 head + 3 deputy + 10 regular)
    const needed = Math.max(0, 14 - numDocs);
    for(let i=0;i<needed;i++){
      const name = doctorNames[dIndex % doctorNames.length]; dIndex++;
      const user = await ensureUser(name, 'DOCTOR');
      // check if doctor record exists for this user
      const existingDoc = await prisma.doctor.findFirst({ where: { userId: user.id } });
      if(!existingDoc){
        await prisma.doctor.create({ data: { specialty: dept.name, licenseNo: '', userId: user.id, departmentId: dept.id } });
        created++;
        console.log(`  ✓ Thêm BS cho ${dept.name}: ${name}`);
      } else {
        // ensure it is attached to this department
        if (existingDoc.departmentId !== dept.id) {
          await prisma.doctor.update({ where: { id: existingDoc.id }, data: { departmentId: dept.id, specialty: dept.name } });
          console.log(`  ✓ Chuyển BS ${name} sang ${dept.name}`);
        }
      }
    }

    // Ensure at least 3 deputy doctors (role DOCTOR) besides head
    const docsFinal = await prisma.doctor.findMany({ where: { departmentId: dept.id }, include: { user: true } });
    const deputyCount = docsFinal.filter(d => d.user.role === 'DOCTOR').length;
    const needDeputy = Math.max(0, 3 - deputyCount);
    for(let j=0;j<needDeputy;j++){
      const name = doctorNames[dIndex % doctorNames.length]; dIndex++;
      const user = await ensureUser(name, 'DOCTOR');
      const existingDoc = await prisma.doctor.findFirst({ where: { userId: user.id } });
      if(!existingDoc){
        await prisma.doctor.create({ data: { specialty: dept.name, licenseNo: '', userId: user.id, departmentId: dept.id } });
        created++;
        console.log(`  ✓ Thêm Phó khoa cho ${dept.name}: ${name}`);
      }
    }
  }

  console.log(`\n✅ Hoàn tất: đã tạo ${created} doctor records.`);
  await prisma.$disconnect();
}

main().catch(e=>{console.error(e); process.exit(1);});