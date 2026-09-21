/**
 * Cleanup: Xoá nurse/doctor records không hợp lý ở các phòng ban không y tế
 * Chạy: npx tsx scripts/fix-nonmedical-depts.ts
 */
import { prisma } from '../src/lib/prisma';

// Danh sách phòng ban KHÔNG Y TẾ (không cần BS/YT trong hệ thống)
const NON_MEDICAL = [
  'Phòng Công Nghệ Thông Tin',
  'Phòng Kế Toán - Tài Chính',
  'Phòng Nhân Sự - Hành Chính',
  'Phòng Vệ Sinh - Khám Chữa Bệnh',
];

// Phòng bán y tế (có nhân viên y tế nhưng không phải BS điều trị)
// Pool Điều Dưỡng, Phòng Dinh Dưỡng, Phòng Dược, Phòng QLCL, Phòng Đào Tạo
// → GIỮ NGUYÊN vì họ có staff y tế thật sự

async function main() {
  console.log('🔧 Dọn dẹp nhân sự sai cho các phòng ban không y tế...\n');

  const allDepts = await prisma.department.findMany();
  const D: Record<string, string> = {};
  allDepts.forEach((d: any) => { D[d.name] = d.id; });

  for (const deptName of NON_MEDICAL) {
    const deptId = D[deptName];
    if (!deptId) { console.log(`⚠️  Không tìm thấy: ${deptName}`); continue; }

    // Tìm tất cả nurses trong khoa này
    const nurses = await prisma.nurse.findMany({
      where: { departmentId: deptId },
      include: { user: true }
    });
    
    // Tìm tất cả doctors trong khoa này
    const doctors = await prisma.doctor.findMany({
      where: { departmentId: deptId },
      include: { user: true }
    });

    console.log(`🏢 ${deptName}: ${nurses.length} y tá + ${doctors.length} bác sĩ cần chuyển đổi`);

    // Xoá nurse records (giữ lại User nhưng đổi role thành STAFF)
    for (const nurse of nurses) {
      await prisma.nurse.delete({ where: { id: nurse.id } });
      await prisma.user.update({
        where: { id: nurse.userId },
        data: { role: 'STAFF' }
      });
      process.stdout.write('.');
    }

    // Xoá doctor records (giữ lại User nhưng đổi role thành STAFF)
    for (const doctor of doctors) {
      await prisma.doctor.delete({ where: { id: doctor.id } });
      await prisma.user.update({
        where: { id: doctor.userId },
        data: { role: 'STAFF' }
      });
      process.stdout.write('.');
    }

    console.log(` ✅ Đã chuyển thành STAFF`);
  }

  // Kiểm tra lại
  console.log('\n📋 Kết quả sau khi dọn dẹp:');
  for (const deptName of NON_MEDICAL) {
    const deptId = D[deptName];
    if (!deptId) continue;
    const nurses = await prisma.nurse.count({ where: { departmentId: deptId } });
    const doctors = await prisma.doctor.count({ where: { departmentId: deptId } });
    const staffUsers = await prisma.user.count({ where: { role: 'STAFF' } });
    console.log(`   ${deptName}: BS=${doctors}, YT=${nurses} | (${staffUsers} STAFF users tổng cộng)`);
  }

  console.log('\n✅ Hoàn tất! Các phòng không y tế giờ không có BS/YT trong hệ thống.');
  console.log('   Nhân viên vẫn tồn tại với role=STAFF để đăng nhập được.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
