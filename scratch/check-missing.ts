import { prisma } from '../src/lib/prisma';
async function main() {
  const depts = await prisma.department.findMany({
    include: { doctors: true, nurses: true },
    orderBy: { name: 'asc' }
  });
  console.log('\n=== KHOA THIẾU NHÂN SỰ ===\n');
  const missing = depts.filter((d: any) => d.doctors.length === 0 && d.nurses.length === 0);
  const partial = depts.filter((d: any) => (d.doctors.length === 0 || d.nurses.length === 0) && !(d.doctors.length === 0 && d.nurses.length === 0));
  
  console.log(`Hoàn toàn trống (0 BS + 0 YT): ${missing.length} khoa`);
  missing.forEach((d: any) => console.log(`  ❌ ${d.name}`));
  
  console.log(`\nThiếu một phần: ${partial.length} khoa`);
  partial.forEach((d: any) => console.log(`  ⚠️  ${d.name} — BS:${d.doctors.length}, YT:${d.nurses.length}`));
  
  console.log(`\nĐủ nhân sự: ${depts.length - missing.length - partial.length}/${depts.length} khoa`);
}
main().catch(console.error).finally(() => prisma.$disconnect());
