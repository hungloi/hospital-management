import { prisma } from './src/lib/prisma';

const GENERATED_NAMES = [
  'Nguyễn Thị Mai', 'Trần Văn An', 'Lê Thị Hồng', 'Phạm Văn Quý', 'Hoàng Thị Lan',
  'Vũ Minh Tuấn', 'Đặng Thị Hậu', 'Bùi Văn Đức', 'Ngô Thị Phương', 'Lê Minh Hoàng',
  'Phan Thị Thanh', 'Đỗ Văn Khang', 'Lê Thị Ngọc', 'Hồ Văn Sơn', 'Trương Thị Kim'
];

async function main() {
  const report: string[] = [];

  // 1) Deduplicate users by email (keep earliest id)
  const dupEmails: { email: string }[] = await prisma.$queryRawUnsafe(`SELECT email FROM \"User\" GROUP BY email HAVING COUNT(*) > 1`);
  for (const row of dupEmails) {
    const email = row.email as string;
    const users = await prisma.user.findMany({ where: { email }, orderBy: [{ id: 'asc' }] });
    if (users.length < 2) continue;
    const keep = users[0];
    const toMerge = users.slice(1);
    for (const other of toMerge) {
      // Reassign doctor records
      try {
        await prisma.doctor.updateMany({ where: { userId: other.id }, data: { userId: keep.id } });
      } catch (e) {
        // ignore if Doctor model/records missing
      }
      // Reassign nurse records
      try {
        await prisma.nurse.updateMany({ where: { userId: other.id }, data: { userId: keep.id } });
      } catch (e) {}
      // Delete duplicate user
      try {
        await prisma.user.delete({ where: { id: other.id } });
        report.push(`Merged and deleted duplicate user ${other.email} (kept ${keep.email})`);
      } catch (e) {
        report.push(`Failed to delete duplicate user ${other.id} (${other.email}): ${String(e)}`);
      }
    }
  }

  // 2) Replace obvious placeholder names
  const placeholders = ['A','B','C','a','b','c','Nhân viên A','Nhân viên B','Nhân viên C','NV A','NV B','NV C'];
  const phUsers = await prisma.user.findMany({ where: { name: { in: placeholders } } });
  let genIdx = 0;
  for (const u of phUsers) {
    const newName = GENERATED_NAMES[genIdx % GENERATED_NAMES.length] + ` (${u.id.slice(0,6)})`;
    await prisma.user.update({ where: { id: u.id }, data: { name: newName } });
    report.push(`Renamed placeholder user "${u.name}" (${u.email}) -> "${newName}"`);
    genIdx++;
  }

  // 3) Standardize Director's name if exists
  const director = await prisma.user.findFirst({ where: { name: { contains: 'Trịnh Hưng Lợi' } } });
  if (director) {
    const desired = 'PGS.TS.BS. Trịnh Hưng Lợi';
    if (director.name !== desired) {
      await prisma.user.update({ where: { id: director.id }, data: { name: desired } });
      report.push(`Standardized director name: ${director.name} -> ${desired}`);
    }
  }

  // 4) Cap nurses per clinical department (keep up to 15, move extras to Pool)
  // Create/find Pool department
  let poolDept = await prisma.department.findFirst({ where: { name: 'Pool Điều Dưỡng' } });
  if (!poolDept) {
    poolDept = await prisma.department.create({ data: { name: 'Pool Điều Dưỡng', description: 'Kho dự phòng điều dưỡng được chuyển từ các khoa khi vượt hạn mức' } as any });
    report.push('Created Pool Điều Dưỡng department');
  }

  const allDepts = await prisma.department.findMany({});
  for (const dept of allDepts) {
    // Count nurses in this dept
    const nurses = await prisma.nurse.findMany({ where: { departmentId: dept.id }, orderBy: [{ id: 'asc' }] });
    // Determine if this is a clinical dept by checking if it has doctors
    const docs = await prisma.doctor.findMany({ where: { departmentId: dept.id }, take: 1 });
    const isClinical = docs.length > 0;
    if (!isClinical) continue; // skip admin rooms
    const capMin = 10;
    const capMax = 15;
    if (nurses.length > capMax) {
      const extras = nurses.slice(capMax);
      for (const ex of extras) {
        await prisma.nurse.update({ where: { id: ex.id }, data: { departmentId: poolDept.id } });
      }
      report.push(`Moved ${extras.length} excess nurses from "${dept.name}" to Pool Điều Dưỡng`);
    } else if (nurses.length < capMin) {
      // If short, create new nurse users and nurse records up to capMin
      const need = capMin - nurses.length;
      for (let i = 0; i < need; i++) {
        const nm = GENERATED_NAMES[(genIdx++) % GENERATED_NAMES.length] + ` (ND-${dept.id.slice(0,4)}-${i+1})`;
        const email = `nurse.${dept.id.slice(0,6)}.${Date.now().toString().slice(-5)}.${i}@example.local`;
        const user = await prisma.user.create({ data: { name: nm, email, password: 'password123', role: 'NURSE' } as any });
        await prisma.nurse.create({ data: { userId: user.id, departmentId: dept.id, position: 'Điều dưỡng' } as any });
      }
      report.push(`Created ${need} new nurses for "${dept.name}" to reach ${capMin}`);
    }
  }

  // 5) Final report
  console.log('\n=== NORMALIZATION REPORT ===\n');
  for (const line of report) console.log('- ' + line);
  console.log('\nDone.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
