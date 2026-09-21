/**
 * Gán nhân sự phòng ban vào đúng department tương ứng
 * (Họ đã có User record nhưng chưa liên kết department)
 * Chạy: npx tsx scripts/seed-office-depts.ts
 */
import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

let PASS_STAFF = '';
let PASS_NURSE = '';
let PASS_DOCTOR = '';

function rp(): string {
  const px = ['0901','0905','0907','0909','0912','0938','0976','0977'];
  return px[Math.floor(Math.random()*px.length)] + Math.floor(100000+Math.random()*900000);
}

let nurseIdx = 5000;
async function addNurse(name: string, position: string, deptId: string) {
  nurseIdx++;
  const suffix = Math.floor(Math.random() * 9000 + 1000);
  const email = `nurse${nurseIdx}_${suffix}@bvhungloi.vn`;
  const user = await prisma.user.create({
    data: { email, password: PASS_NURSE, name, role: 'NURSE', phone: rp(), address: 'TP.HCM', gender: 'FEMALE' }
  });
  await prisma.nurse.create({ data: { userId: user.id, departmentId: deptId, position } });
  process.stdout.write('.');
}

let docIdx = 5000;
async function addDoctor(name: string, specialty: string, deptId: string) {
  docIdx++;
  const suffix = Math.floor(Math.random() * 9000 + 1000);
  const email = `doc${docIdx}_${suffix}@bvhungloi.vn`;
  const user = await prisma.user.create({
    data: { email, password: PASS_DOCTOR, name, role: 'DOCTOR', phone: rp(), address: 'TP.HCM' }
  });
  await prisma.doctor.create({
    data: { userId: user.id, departmentId: deptId, specialty, licenseNo: `BV-EX${docIdx}-${suffix}`, consultationFee: 150000 }
  });
  process.stdout.write('.');
}

async function addStaff(name: string, email: string, role: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (!existing) {
    await prisma.user.create({ data: { email, password: PASS_STAFF, name, role, phone: rp(), address: 'TP.HCM' } });
  }
  process.stdout.write('.');
}

async function main() {
  PASS_STAFF  = await bcrypt.hash('nhansu123', 10);
  PASS_NURSE  = await bcrypt.hash('yta123', 10);
  PASS_DOCTOR = await bcrypt.hash('bacsi123', 10);

  const allDepts = await prisma.department.findMany();
  const D: Record<string, string> = {};
  allDepts.forEach((d: any) => { D[d.name] = d.id; });

  // ── Pool Điều Dưỡng ─────────────────────────────────────────────────────
  // Pool không có bs/yta cố định - chỉ cần y tá trực
  if (D['Pool Điều Dưỡng']) {
    console.log('\n💊 Pool Điều Dưỡng');
    const id = D['Pool Điều Dưỡng'];
    await addNurse('CN. Nguyễn Thị Bảo Ngọc',   'Điều dưỡng trực', id);
    await addNurse('CN. Trần Thị Thu Hà',         'Điều dưỡng trực', id);
    await addNurse('CN. Lê Thị Kim Anh',           'Điều dưỡng trực', id);
    await addNurse('CN. Phạm Thị Ngọc Huyền',    'Điều dưỡng trực', id);
    await addNurse('CN. Đặng Thị Mỹ Hạnh',        'Điều dưỡng trực', id);
    await addNurse('CN. Hoàng Thị Lan Nhung',     'Điều dưỡng trực', id);
    await addNurse('CN. Bùi Thị Cẩm Loan',        'Điều dưỡng trực', id);
    await addNurse('CN. Vũ Thị Thu Trang',         'Điều dưỡng trực', id);
    await addNurse('CN. Hồ Thị Bích Hà',          'Điều dưỡng trực', id);
    await addNurse('CN. Lý Thị Ngọc Yến',         'Điều dưỡng trực', id);
    console.log(' ✅');
  }

  // ── Phòng Dược ──────────────────────────────────────────────────────────
  // Dược sĩ thực chất là PHARMACIST nên sẽ dùng Doctor model tạm thời
  if (D['Phòng Dược']) {
    console.log('\n💊 Phòng Dược — thêm dược sĩ');
    const id = D['Phòng Dược'];
    await addDoctor('TS. Nguyễn Thị Bảo Dung',  'Dược lâm sàng', id);
    await addDoctor('ThS. Lê Văn Trung',          'Dược học', id);
    await addDoctor('ThS. Trần Thị Hoa Mai',      'Dược học', id);
    await addDoctor('DS. Phạm Thị Kim Tuyền',    'Pha chế thuốc', id);
    await addDoctor('DS. Hoàng Văn Bảo',          'Quản lý dược', id);
    await addNurse('CN. Nguyễn Thị Thu Hiền',    'Dược tá', id);
    await addNurse('CN. Trần Thị Ngọc Bảo',      'Dược tá', id);
    await addNurse('CN. Lê Văn Tài',              'Dược tá', id);
    await addNurse('CN. Phạm Thị Kim Yến',        'Thủ kho dược', id);
    await addNurse('CN. Đặng Thị Hồng Loan',     'Dược tá', id);
    console.log(' ✅');
  }

  // ── Phòng Dinh Dưỡng ────────────────────────────────────────────────────
  if (D['Phòng Dinh Dưỡng']) {
    console.log('\n🍽️  Phòng Dinh Dưỡng');
    const id = D['Phòng Dinh Dưỡng'];
    await addDoctor('ThS. Nguyễn Thị Cẩm Hương', 'Dinh dưỡng lâm sàng', id);
    await addDoctor('BS. Trần Văn Phú',            'Dinh dưỡng tiêu hóa', id);
    await addDoctor('BS. Lê Thị Ngọc Trinh',       'Dinh dưỡng nhi', id);
    await addNurse('CN. Phạm Thị Bích Lan',       'Chuyên viên dinh dưỡng', id);
    await addNurse('CN. Đỗ Thị Thanh Ngân',       'Kỹ thuật viên dinh dưỡng', id);
    await addNurse('CN. Hoàng Thị Thu Hiền',      'Kỹ thuật viên', id);
    await addNurse('CN. Bùi Thị Xuân Mai',        'Nhân viên bếp ăn BV', id);
    await addNurse('CN. Vũ Thị Hoa',              'Nhân viên bếp ăn BV', id);
    console.log(' ✅');
  }

  // ── Phòng CNTT ──────────────────────────────────────────────────────────
  if (D['Phòng Công Nghệ Thông Tin']) {
    console.log('\n💻 Phòng CNTT');
    const id = D['Phòng Công Nghệ Thông Tin'];
    await addNurse('KS. Hoàng Đức Minh',    'Trưởng phòng CNTT', id);
    await addNurse('KS. Vũ Văn Hùng',       'Kỹ sư phần mềm', id);
    await addNurse('KS. Lý Thanh Hải',      'Kỹ sư hệ thống', id);
    await addNurse('KS. Đặng Thị Ngọc Ánh','Kỹ sư mạng', id);
    await addNurse('KS. Trần Văn Khoa',     'Kỹ sư bảo mật', id);
    await addNurse('KS. Nguyễn Thị Phương', 'Kỹ thuật viên máy tính', id);
    await addNurse('KS. Lê Quang Nhật',    'Lập trình viên', id);
    await addNurse('KS. Phạm Thị Thu Uyên', 'Phân tích dữ liệu', id);
    console.log(' ✅');
  }

  // ── Phòng Kế Toán - Tài Chính ────────────────────────────────────────────
  if (D['Phòng Kế Toán - Tài Chính']) {
    console.log('\n💰 Phòng Kế Toán');
    const id = D['Phòng Kế Toán - Tài Chính'];
    await addNurse('Nguyễn Văn Thắng',       'Kế toán trưởng', id);
    await addNurse('Trần Thị Minh Nguyệt',   'Kế toán phó', id);
    await addNurse('Lê Thị Thu Hằng',        'Kế toán ngân sách', id);
    await addNurse('Phạm Văn Long',           'Kế toán chi phí', id);
    await addNurse('Đỗ Thị Bảo Ngọc',       'Kế toán BHYT', id);
    await addNurse('Hoàng Thị Mỹ Liên',     'Kế toán thu viện phí', id);
    await addNurse('Nguyễn Thị Kim Oanh',    'Thủ quỹ', id);
    await addNurse('Lê Văn Phúc',            'Kế toán tài sản', id);
    console.log(' ✅');
  }

  // ── Phòng Nhân Sự - Hành Chính ───────────────────────────────────────────
  if (D['Phòng Nhân Sự - Hành Chính']) {
    console.log('\n📋 Phòng Nhân Sự - Hành Chính');
    const id = D['Phòng Nhân Sự - Hành Chính'];
    await addNurse('Nguyễn Thị Hồng Vân',    'Trưởng phòng Nhân sự', id);
    await addNurse('Lê Văn Toàn',             'Phó phòng Hành chính', id);
    await addNurse('Phạm Thị Thu Thảo',      'Chuyên viên nhân sự', id);
    await addNurse('Bùi Thị Lan Anh',        'Chánh văn phòng', id);
    await addNurse('Đinh Văn Tú',             'Hành chính tổng hợp', id);
    await addNurse('Trần Thị Bảo Châu',      'Chuyên viên đào tạo', id);
    await addNurse('Hoàng Văn Đức',          'Nhân viên hành chính', id);
    await addNurse('Vũ Thị Thu Hiền',        'Nhân viên văn thư', id);
    console.log(' ✅');
  }

  // ── Phòng Quản Lý Chất Lượng ─────────────────────────────────────────────
  if (D['Phòng Quản Lý Chất Lượng']) {
    console.log('\n📊 Phòng Quản Lý Chất Lượng');
    const id = D['Phòng Quản Lý Chất Lượng'];
    await addDoctor('ThS. Lê Thị Thu Hường',    'Quản lý chất lượng y tế', id);
    await addDoctor('BS. Nguyễn Văn Hoàng',     'Kiểm soát nhiễm khuẩn', id);
    await addNurse('CN. Trần Thị Kim Chi',      'Kiểm tra chất lượng', id);
    await addNurse('CN. Phạm Thị Hồng Hạnh',   'Chuyên viên QLCL', id);
    await addNurse('CN. Đặng Văn Phú',          'Chuyên viên an toàn', id);
    await addNurse('CN. Hoàng Thị Bảo Ngọc',   'Kiểm soát nhiễm khuẩn', id);
    await addNurse('CN. Lê Thị Thanh Nga',      'Chuyên viên QLCL', id);
    console.log(' ✅');
  }

  // ── Phòng Đào Tạo - Nghiên Cứu ────────────────────────────────────────────
  if (D['Phòng Đào Tạo - Nghiên Cứu Khoa Học']) {
    console.log('\n🎓 Phòng Đào Tạo - NCKH');
    const id = D['Phòng Đào Tạo - Nghiên Cứu Khoa Học'];
    await addDoctor('TS. Phạm Thị Minh Hoa',    'Nghiên cứu y học', id);
    await addDoctor('ThS. Nguyễn Văn Thắng Lợi','Đào tạo y khoa', id);
    await addNurse('CN. Trần Thị Phương Thảo',  'Chuyên viên đào tạo', id);
    await addNurse('CN. Lê Thị Kim Uyên',       'Thư viện y học', id);
    await addNurse('CN. Phạm Văn Hưng',         'Nghiên cứu viên', id);
    await addNurse('CN. Đặng Thị Thu Trà',      'Chuyên viên NCKH', id);
    console.log(' ✅');
  }

  // ── Phòng Vệ Sinh ──────────────────────────────────────────────────────────
  if (D['Phòng Vệ Sinh - Khám Chữa Bệnh']) {
    console.log('\n🧹 Phòng Vệ Sinh');
    const id = D['Phòng Vệ Sinh - Khám Chữa Bệnh'];
    await addNurse('Nguyễn Văn Tài',        'Trưởng bộ phận vệ sinh', id);
    await addNurse('Trần Thị Kim Hoa',      'Nhân viên vệ sinh BV', id);
    await addNurse('Lê Văn Chính',          'Nhân viên vệ sinh BV', id);
    await addNurse('Phạm Thị Thu Loan',     'Nhân viên vệ sinh BV', id);
    await addNurse('Đặng Văn Hào',          'Nhân viên vệ sinh BV', id);
    await addNurse('Bùi Thị Ngọc Tiên',    'Nhân viên vệ sinh BV', id);
    await addNurse('Hoàng Văn Minh Tuấn',  'Tạp vụ', id);
    await addNurse('Võ Thị Phượng',        'Tạp vụ', id);
    console.log(' ✅');
  }

  // Tổng kết
  const totalNurses = await prisma.nurse.count();
  const totalDoctors = await prisma.doctor.count();
  const coverage = await prisma.department.count({
    where: {
      OR: [
        { doctors: { some: {} } },
        { nurses: { some: {} } }
      ]
    }
  });
  const total = await prisma.department.count();

  console.log('\n\n' + '═'.repeat(55));
  console.log('✅ HOÀN TẤT BỔ SUNG PHÒNG BAN!');
  console.log(`   👨‍⚕️ Tổng bác sĩ/chuyên gia: ${totalDoctors}`);
  console.log(`   👩‍⚕️ Tổng y tá/nhân viên: ${totalNurses}`);
  console.log(`   🏥 Phủ nhân sự: ${coverage}/${total} khoa/phòng`);
  console.log('═'.repeat(55));
}

main().catch(console.error).finally(() => prisma.$disconnect());
