/**
 * Script bổ sung nhân sự cho tất cả khoa còn thiếu
 * Chạy: npx tsx scripts/seed-staff-extra.ts
 */
import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

let PASS_DOCTOR = '';
let PASS_NURSE  = '';
let PASS_STAFF  = '';
let licenseCounter = 101;

function nextLicense() {
  return `BV-${String(licenseCounter++).padStart(3, '0')}`;
}

function randomPhone(): string {
  const prefixes = ['0901','0903','0905','0907','0908','0912','0913','0938','0939','0976','0977','0978'];
  return prefixes[Math.floor(Math.random() * prefixes.length)] + Math.floor(100000 + Math.random() * 900000);
}

function toEmail(fullName: string, suffix: string): string {
  let name = fullName.replace(/^(GS\.TS\.|PGS\.TS\.|TS\.|ThS\.|BS\.|CN\.|DS\.|PGS\.|BS\. CKII|BSCKII|BSCKI)\s*/i, '');
  const parts = name.trim().toLowerCase().split(/\s+/);
  const first = parts[parts.length - 1];
  const mid = parts.slice(0, -1).map((p: string) => p[0] || '').join('');
  const clean = (first + mid)
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g,'d').replace(/[^a-z0-9]/gi,'');
  return `${clean}.${suffix}@bvhungloi.vn`;
}

async function createDoctor(name: string, specialty: string, title: string, deptId: string, fee = 150000) {
  const email = toEmail(name, 'bs');
  // ensure unique email
  const emailFinal = await prisma.user.findUnique({ where: { email } })
    ? `${email}${licenseCounter}` : email;
  const lic = nextLicense();
  const user = await prisma.user.upsert({
    where: { email: emailFinal },
    update: { password: PASS_DOCTOR, role: 'DOCTOR', name, phone: randomPhone() },
    create: { email: emailFinal, password: PASS_DOCTOR, name, role: 'DOCTOR', phone: randomPhone(), address: 'TP. Hồ Chí Minh', gender: name.includes('Thị') ? 'FEMALE' : 'MALE' }
  });
  await prisma.doctor.upsert({
    where: { userId: user.id },
    update: { specialty, licenseNo: lic, departmentId: deptId, consultationFee: fee, bio: `${title} - ${specialty}` },
    create: { specialty, licenseNo: lic, departmentId: deptId, userId: user.id, consultationFee: fee, bio: `${title} - ${specialty}` }
  });
  process.stdout.write('.');
}

async function createNurse(name: string, position: string, deptId: string) {
  const email = toEmail(name, 'yt');
  const emailFinal = await prisma.user.findUnique({ where: { email } })
    ? `${email}${Math.floor(Math.random()*9000+1000)}` : email;
  const user = await prisma.user.upsert({
    where: { email: emailFinal },
    update: { password: PASS_NURSE, role: 'NURSE', name, phone: randomPhone() },
    create: { email: emailFinal, password: PASS_NURSE, name, role: 'NURSE', phone: randomPhone(), address: 'TP. Hồ Chí Minh', gender: 'FEMALE' }
  });
  await prisma.nurse.upsert({
    where: { userId: user.id },
    update: { position, departmentId: deptId },
    create: { position, departmentId: deptId, userId: user.id }
  });
  process.stdout.write('.');
}

async function createStaff(name: string, email: string, role: string, position: string) {
  await prisma.user.upsert({
    where: { email },
    update: { password: PASS_STAFF, name, phone: randomPhone() },
    create: { email, password: PASS_STAFF, name, role, phone: randomPhone(), address: 'TP. Hồ Chí Minh' }
  });
  process.stdout.write('.');
}

async function main() {
  PASS_DOCTOR = await bcrypt.hash('bacsi123', 10);
  PASS_NURSE  = await bcrypt.hash('yta123', 10);
  PASS_STAFF  = await bcrypt.hash('nhansu123', 10);

  console.log('🔄 Bổ sung nhân sự các khoa còn thiếu...\n');

  const allDepts = await prisma.department.findMany();
  const D: Record<string,string> = {};
  allDepts.forEach(d => { D[d.name] = d.id; });

  console.log('📋 Danh sách tất cả khoa:\n' + allDepts.map(d => `   ${d.name}`).join('\n') + '\n');

  // ═══════════════════════════════════════════════════════
  // KHOA SẢN PHỤ KHOA
  // ═══════════════════════════════════════════════════════
  if (D['Khoa Sản Phụ Khoa']) {
    console.log('\n🏥 Khoa Sản Phụ Khoa');
    const id = D['Khoa Sản Phụ Khoa'];
    await createDoctor('PGS.TS. Nguyễn Thị Bích Ngọc', 'Sản phụ khoa', 'Trưởng khoa', id, 200000);
    await createDoctor('TS. Phạm Thị Thúy Vân', 'Sản phụ khoa', 'Phó trưởng khoa', id, 180000);
    await createDoctor('ThS. Lê Ngọc Liên', 'Sản phụ khoa', 'Bác sĩ CKI', id, 160000);
    await createDoctor('ThS. Đoàn Thị Kim Tuyền', 'Sơ sinh học', 'Bác sĩ CKI', id, 160000);
    await createDoctor('BS. Trần Thị Thanh Huyền', 'Sản phụ khoa', 'Bác sĩ', id);
    await createDoctor('BS. Võ Thị Mỹ Dung', 'Sản phụ khoa', 'Bác sĩ', id);
    await createDoctor('BS. Huỳnh Thị Yến Nhi', 'Sơ sinh học', 'Bác sĩ', id);
    await createDoctor('BS. Nguyễn Thị Hoài Thu', 'Sản phụ khoa', 'Bác sĩ', id);
    await createDoctor('BS. Bùi Thị Kim Ngân', 'Sản phụ khoa', 'Bác sĩ', id);
    await createDoctor('BS. Cao Thị Diễm Hương', 'Sơ sinh học', 'Bác sĩ', id);
    await createNurse('CN. Nguyễn Thị Phương Thảo', 'Điều dưỡng trưởng', id);
    await createNurse('CN. Trần Thị Ngọc Trân', 'Điều dưỡng phó', id);
    await createNurse('CN. Lê Thị Thanh Hương', 'Điều dưỡng CKI', id);
    await createNurse('CN. Phạm Thị Tố Uyên', 'Điều dưỡng', id);
    await createNurse('CN. Đỗ Thị Thanh Thúy', 'Điều dưỡng', id);
    await createNurse('CN. Huỳnh Thị Lệ Quyên', 'Y tá', id);
    await createNurse('CN. Bùi Thị Xuân Lan', 'Y tá', id);
    await createNurse('CN. Mai Thị Ngọc Hiền', 'Y tá', id);
    await createNurse('CN. Cao Thị Mỹ Phụng', 'Y tá', id);
    await createNurse('CN. Dương Thị Hồng Vân', 'Hộ lý', id);
  }

  // ═══════════════════════════════════════════════════════
  // KHOA TIM MẠCH
  // ═══════════════════════════════════════════════════════
  if (D['Khoa Tim Mạch']) {
    console.log('\n🏥 Khoa Tim Mạch');
    const id = D['Khoa Tim Mạch'];
    await createDoctor('GS.TS. Đỗ Quốc Hùng', 'Tim mạch can thiệp', 'Trưởng khoa', id, 250000);
    await createDoctor('PGS.TS. Trần Thị Lệ Hằng', 'Tim mạch lâm sàng', 'Phó trưởng khoa', id, 200000);
    await createDoctor('TS. Nguyễn Văn Phú', 'Siêu âm tim', 'Bác sĩ CKII', id, 180000);
    await createDoctor('ThS. Lê Thị Mỹ Châu', 'Rối loạn nhịp tim', 'Bác sĩ CKI', id, 160000);
    await createDoctor('ThS. Phạm Văn Bình', 'Tim mạch can thiệp', 'Bác sĩ CKI', id, 160000);
    await createDoctor('BS. Hoàng Thị Kim Liên', 'Tim mạch lâm sàng', 'Bác sĩ', id);
    await createDoctor('BS. Vũ Văn Tuấn', 'Tim mạch lâm sàng', 'Bác sĩ', id);
    await createDoctor('BS. Đặng Thị Ngọc Bảo', 'Siêu âm tim', 'Bác sĩ', id);
    await createDoctor('BS. Trương Văn Duy', 'Tim mạch lâm sàng', 'Bác sĩ', id);
    await createDoctor('BS. Ngô Thị Hồng Nhung', 'Tim mạch lâm sàng', 'Bác sĩ', id);
    await createNurse('CN. Trần Thị Kim Loan', 'Điều dưỡng trưởng', id);
    await createNurse('CN. Nguyễn Thị Cẩm Nhung', 'Điều dưỡng phó', id);
    await createNurse('CN. Lê Thị Ánh Tuyết', 'Điều dưỡng CKI', id);
    await createNurse('CN. Phạm Thị Diệu Huyền', 'Điều dưỡng', id);
    await createNurse('CN. Đỗ Văn Phúc', 'Điều dưỡng', id);
    await createNurse('CN. Hoàng Thị Kim Oanh', 'Y tá', id);
    await createNurse('CN. Bùi Thị Ngọc Mai', 'Y tá', id);
    await createNurse('CN. Võ Văn Thành', 'Y tá', id);
    await createNurse('CN. Lý Thị Bảo Châu', 'Y tá', id);
    await createNurse('CN. Cao Thị Thu Hà', 'Hộ lý', id);
  }

  // ═══════════════════════════════════════════════════════
  // KHOA THẦN KINH
  // ═══════════════════════════════════════════════════════
  if (D['Khoa Thần Kinh']) {
    console.log('\n🏥 Khoa Thần Kinh');
    const id = D['Khoa Thần Kinh'];
    await createDoctor('PGS.TS. Lê Văn Thọ', 'Thần kinh học', 'Trưởng khoa', id, 200000);
    await createDoctor('TS. Nguyễn Thị Ngọc Hà', 'Đột quỵ não', 'Phó trưởng khoa', id, 180000);
    await createDoctor('ThS. Trần Văn Minh', 'Parkinson', 'Bác sĩ CKI', id, 160000);
    await createDoctor('ThS. Phạm Thị Lan Hương', 'Động kinh', 'Bác sĩ CKI', id, 160000);
    await createDoctor('BS. Lê Thị Thu Trang', 'Thần kinh học', 'Bác sĩ', id);
    await createDoctor('BS. Đinh Văn Hải', 'Đột quỵ não', 'Bác sĩ', id);
    await createDoctor('BS. Võ Thị Mỹ Tiên', 'Thần kinh học', 'Bác sĩ', id);
    await createDoctor('BS. Huỳnh Văn Phát', 'Thần kinh ngoại biên', 'Bác sĩ', id);
    await createDoctor('BS. Trương Thị Mỹ Dung', 'Thần kinh học', 'Bác sĩ', id);
    await createDoctor('BS. Đoàn Văn Kiên', 'Động kinh', 'Bác sĩ', id);
    await createNurse('CN. Nguyễn Thị Bích Phượng', 'Điều dưỡng trưởng', id);
    await createNurse('CN. Trần Thị Thanh Nhàn', 'Điều dưỡng phó', id);
    await createNurse('CN. Lê Thị Kim Oanh', 'Điều dưỡng CKI', id);
    await createNurse('CN. Phạm Văn Quang', 'Điều dưỡng', id);
    await createNurse('CN. Đặng Thị Nguyệt Hằng', 'Điều dưỡng', id);
    await createNurse('CN. Hồ Thị Bảo Ngọc', 'Y tá', id);
    await createNurse('CN. Vũ Văn Nhân', 'Y tá', id);
    await createNurse('CN. Châu Thị Mỹ Hằng', 'Y tá', id);
    await createNurse('CN. Bùi Văn Thắng', 'Y tá', id);
    await createNurse('CN. Lý Thị Thu Hồng', 'Hộ lý', id);
  }

  // ═══════════════════════════════════════════════════════
  // KHOA HÔ HẤP
  // ═══════════════════════════════════════════════════════
  if (D['Khoa Hô Hấp']) {
    console.log('\n🏥 Khoa Hô Hấp');
    const id = D['Khoa Hô Hấp'];
    await createDoctor('TS. Phan Thị Thanh Bình', 'Hô hấp học', 'Trưởng khoa', id, 200000);
    await createDoctor('ThS. Nguyễn Văn Cường', 'Hen phế quản', 'Phó trưởng khoa', id, 160000);
    await createDoctor('ThS. Lê Thị Hồng Thắm', 'COPD', 'Bác sĩ CKI', id, 160000);
    await createDoctor('BS. Trần Văn Dũng', 'Hô hấp học', 'Bác sĩ', id);
    await createDoctor('BS. Phạm Thị Lan Chi', 'Hen phế quản', 'Bác sĩ', id);
    await createDoctor('BS. Đỗ Văn Quân', 'COPD', 'Bác sĩ', id);
    await createDoctor('BS. Võ Thị Thanh Trúc', 'Hô hấp học', 'Bác sĩ', id);
    await createDoctor('BS. Hoàng Văn Tâm', 'Hô hấp học', 'Bác sĩ', id);
    await createDoctor('BS. Lưu Thị Kim Oanh', 'COPD', 'Bác sĩ', id);
    await createDoctor('BS. Đinh Thị Hồng Hoa', 'Hô hấp học', 'Bác sĩ', id);
    await createNurse('CN. Nguyễn Thị Mỹ Hạnh', 'Điều dưỡng trưởng', id);
    await createNurse('CN. Trần Văn Tín', 'Điều dưỡng phó', id);
    await createNurse('CN. Lê Thị Thu Trang', 'Điều dưỡng', id);
    await createNurse('CN. Phạm Thị Ngọc Lan', 'Điều dưỡng', id);
    await createNurse('CN. Đặng Thị Bích Ngân', 'Y tá', id);
    await createNurse('CN. Hồ Văn Đức', 'Y tá', id);
    await createNurse('CN. Bùi Thị Thanh Tuyền', 'Y tá', id);
    await createNurse('CN. Châu Thị Kim Hoa', 'Y tá', id);
    await createNurse('CN. Vũ Thị Hồng Hạnh', 'Hộ lý', id);
  }

  // ═══════════════════════════════════════════════════════
  // KHOA TIÊU HÓA
  // ═══════════════════════════════════════════════════════
  if (D['Khoa Tiêu Hóa']) {
    console.log('\n🏥 Khoa Tiêu Hóa');
    const id = D['Khoa Tiêu Hóa'];
    await createDoctor('PGS.TS. Vũ Văn Khoa', 'Tiêu hóa học', 'Trưởng khoa', id, 200000);
    await createDoctor('TS. Trần Thị Ngọc Dung', 'Nội soi tiêu hóa', 'Phó trưởng khoa', id, 180000);
    await createDoctor('ThS. Lê Văn Phong', 'Gan mật', 'Bác sĩ CKI', id, 160000);
    await createDoctor('ThS. Nguyễn Thị Kim Yến', 'Đại tràng', 'Bác sĩ CKI', id, 160000);
    await createDoctor('BS. Phạm Văn Thành', 'Tiêu hóa học', 'Bác sĩ', id);
    await createDoctor('BS. Đỗ Thị Thanh Lan', 'Nội soi tiêu hóa', 'Bác sĩ', id);
    await createDoctor('BS. Hoàng Văn Minh', 'Gan mật', 'Bác sĩ', id);
    await createDoctor('BS. Võ Thị Bảo Trân', 'Tiêu hóa học', 'Bác sĩ', id);
    await createDoctor('BS. Đinh Văn Tuấn', 'Tiêu hóa học', 'Bác sĩ', id);
    await createDoctor('BS. Lưu Thị Thu Hằng', 'Đại tràng', 'Bác sĩ', id);
    await createNurse('CN. Nguyễn Thị Ngọc Bích', 'Điều dưỡng trưởng', id);
    await createNurse('CN. Trần Văn Huy', 'Điều dưỡng phó', id);
    await createNurse('CN. Lê Thị Kim Phương', 'Điều dưỡng', id);
    await createNurse('CN. Phạm Thị Bảo Ngọc', 'Điều dưỡng', id);
    await createNurse('CN. Bùi Thị Thùy Linh', 'Y tá', id);
    await createNurse('CN. Vũ Văn Khôi', 'Y tá', id);
    await createNurse('CN. Đặng Thị Kim Ngân', 'Y tá', id);
    await createNurse('CN. Hồ Thị Ánh Hồng', 'Y tá', id);
    await createNurse('CN. Cao Thị Ngọc Huyền', 'Hộ lý', id);
  }

  // ═══════════════════════════════════════════════════════
  // KHOA TIÊU HÓA - GAN MẬT TỤY
  // ═══════════════════════════════════════════════════════
  if (D['Khoa Tiêu Hóa - Gan Mật Tụy']) {
    console.log('\n🏥 Khoa Tiêu Hóa - Gan Mật Tụy');
    const id = D['Khoa Tiêu Hóa - Gan Mật Tụy'];
    await createDoctor('TS. Lê Quang Trường', 'Gan mật tụy', 'Trưởng khoa', id, 200000);
    await createDoctor('ThS. Nguyễn Thị Hồng Nhân', 'Xơ gan', 'Phó trưởng khoa', id, 160000);
    await createDoctor('BS. Trần Văn Lộc', 'Gan mật tụy', 'Bác sĩ CKI', id, 160000);
    await createDoctor('BS. Phạm Thị Thu Hiền', 'Viêm gan', 'Bác sĩ', id);
    await createDoctor('BS. Đỗ Văn Tài', 'Gan mật tụy', 'Bác sĩ', id);
    await createDoctor('BS. Lê Thị Mỹ Hương', 'Mật - Tụy', 'Bác sĩ', id);
    await createDoctor('BS. Hoàng Văn Dũng', 'Gan mật tụy', 'Bác sĩ', id);
    await createDoctor('BS. Trương Thị Kim Yến', 'Viêm gan', 'Bác sĩ', id);
    await createNurse('CN. Nguyễn Thị Thanh Thơ', 'Điều dưỡng trưởng', id);
    await createNurse('CN. Trần Thị Bảo Châu', 'Điều dưỡng phó', id);
    await createNurse('CN. Lê Văn Đạt', 'Điều dưỡng', id);
    await createNurse('CN. Phạm Thị Thanh Vân', 'Y tá', id);
    await createNurse('CN. Đặng Văn Lợi', 'Y tá', id);
    await createNurse('CN. Bùi Thị Thu Hà', 'Y tá', id);
    await createNurse('CN. Hồ Thị Kim Liên', 'Hộ lý', id);
  }

  // ═══════════════════════════════════════════════════════
  // KHOA THẬN - TIẾT NIỆU
  // ═══════════════════════════════════════════════════════
  if (D['Khoa Thận - Tiết Niệu']) {
    console.log('\n🏥 Khoa Thận - Tiết Niệu');
    const id = D['Khoa Thận - Tiết Niệu'];
    await createDoctor('TS. Nguyễn Hữu Phú', 'Thận học', 'Trưởng khoa', id, 200000);
    await createDoctor('ThS. Trần Thị Thu Hà', 'Lọc máu', 'Phó trưởng khoa', id, 160000);
    await createDoctor('ThS. Lê Văn Trung Hiếu', 'Thận học', 'Bác sĩ CKI', id, 160000);
    await createDoctor('BS. Phạm Thị Diệu Phương', 'Lọc máu chu kỳ', 'Bác sĩ', id);
    await createDoctor('BS. Đỗ Văn Hào', 'Thận học', 'Bác sĩ', id);
    await createDoctor('BS. Võ Thị Kim Ngân', 'Thận học', 'Bác sĩ', id);
    await createDoctor('BS. Hoàng Văn Nghĩa', 'Lọc máu', 'Bác sĩ', id);
    await createDoctor('BS. Trương Thị Thanh Hà', 'Thận học', 'Bác sĩ', id);
    await createNurse('CN. Nguyễn Thị Thu Giang', 'Điều dưỡng trưởng', id);
    await createNurse('CN. Trần Văn Tâm', 'Điều dưỡng phó', id);
    await createNurse('CN. Lê Thị Hồng Nhung', 'Điều dưỡng', id);
    await createNurse('CN. Phạm Thị Ngọc Trúc', 'Điều dưỡng', id);
    await createNurse('CN. Đặng Thị Mỹ Châu', 'Y tá', id);
    await createNurse('CN. Bùi Văn Khánh', 'Y tá', id);
    await createNurse('CN. Hồ Thị Phương Thúy', 'Y tá', id);
    await createNurse('CN. Vũ Thị Hồng Diệp', 'Hộ lý', id);
  }

  // ═══════════════════════════════════════════════════════
  // KHOA NỘI TIẾT
  // ═══════════════════════════════════════════════════════
  if (D['Khoa Nội Tiết']) {
    console.log('\n🏥 Khoa Nội Tiết');
    const id = D['Khoa Nội Tiết'];
    await createDoctor('PGS.TS. Đặng Thị Thu Hương', 'Đái tháo đường', 'Trưởng khoa', id, 200000);
    await createDoctor('TS. Nguyễn Văn Tịnh', 'Tuyến giáp', 'Phó trưởng khoa', id, 180000);
    await createDoctor('ThS. Trần Thị Lan Phương', 'Nội tiết học', 'Bác sĩ CKI', id, 160000);
    await createDoctor('BS. Lê Văn Chánh', 'Đái tháo đường', 'Bác sĩ', id);
    await createDoctor('BS. Phạm Thị Hồng Nga', 'Tuyến giáp', 'Bác sĩ', id);
    await createDoctor('BS. Đỗ Thị Kim Hoa', 'Nội tiết học', 'Bác sĩ', id);
    await createDoctor('BS. Hoàng Văn Toàn', 'Đái tháo đường', 'Bác sĩ', id);
    await createDoctor('BS. Võ Thị Thanh Xuân', 'Tuyến giáp', 'Bác sĩ', id);
    await createNurse('CN. Nguyễn Thị Kiều Oanh', 'Điều dưỡng trưởng', id);
    await createNurse('CN. Trần Văn Nghĩa', 'Điều dưỡng phó', id);
    await createNurse('CN. Lê Thị Ánh Nguyệt', 'Điều dưỡng', id);
    await createNurse('CN. Phạm Thị Hà Giang', 'Y tá', id);
    await createNurse('CN. Đặng Văn Hùng', 'Y tá', id);
    await createNurse('CN. Bùi Thị Mỹ Hạnh', 'Y tá', id);
    await createNurse('CN. Hồ Thị Diệu Linh', 'Hộ lý', id);
  }

  // ═══════════════════════════════════════════════════════
  // KHOA HUYẾT HỌC
  // ═══════════════════════════════════════════════════════
  if (D['Khoa Huyết Học']) {
    console.log('\n🏥 Khoa Huyết Học');
    const id = D['Khoa Huyết Học'];
    await createDoctor('TS. Nguyễn Thị Bích Phước', 'Huyết học', 'Trưởng khoa', id, 200000);
    await createDoctor('ThS. Trần Văn Long', 'Truyền máu', 'Phó trưởng khoa', id, 160000);
    await createDoctor('ThS. Lê Thị Thanh Thuận', 'Ung huyết học', 'Bác sĩ CKI', id, 160000);
    await createDoctor('BS. Phạm Văn Hoàng', 'Huyết học', 'Bác sĩ', id);
    await createDoctor('BS. Đỗ Thị Mỹ Linh', 'Truyền máu', 'Bác sĩ', id);
    await createDoctor('BS. Võ Văn Bình', 'Huyết học', 'Bác sĩ', id);
    await createDoctor('BS. Hoàng Thị Thanh Tuyền', 'Ung huyết học', 'Bác sĩ', id);
    await createDoctor('BS. Lưu Văn Tài', 'Huyết học', 'Bác sĩ', id);
    await createNurse('CN. Nguyễn Thị Thùy An', 'Điều dưỡng trưởng', id);
    await createNurse('CN. Trần Thị Bảo Ngân', 'Điều dưỡng phó', id);
    await createNurse('CN. Lê Văn Tuấn', 'Điều dưỡng', id);
    await createNurse('CN. Phạm Thị Ngọc Dung', 'Y tá', id);
    await createNurse('CN. Đặng Thị Bích Hằng', 'Y tá', id);
    await createNurse('CN. Bùi Văn Đức', 'Y tá', id);
    await createNurse('CN. Hồ Thị Thanh Hương', 'Hộ lý', id);
  }

  // ═══════════════════════════════════════════════════════
  // KHOA UNG BƯỚU
  // ═══════════════════════════════════════════════════════
  if (D['Khoa Ung Bướu']) {
    console.log('\n🏥 Khoa Ung Bướu');
    const id = D['Khoa Ung Bướu'];
    await createDoctor('GS.TS. Phạm Xuân Dũng', 'Ung thư học', 'Trưởng khoa', id, 300000);
    await createDoctor('PGS.TS. Nguyễn Thị Thanh Bình', 'Xạ trị ung thư', 'Phó trưởng khoa', id, 250000);
    await createDoctor('TS. Lê Văn Bảo', 'Hóa trị liệu', 'Bác sĩ CKII', id, 220000);
    await createDoctor('ThS. Trần Thị Phương Anh', 'Ung thư phụ khoa', 'Bác sĩ CKI', id, 180000);
    await createDoctor('ThS. Đỗ Văn Lâm', 'Ung thư tiêu hóa', 'Bác sĩ CKI', id, 180000);
    await createDoctor('BS. Phạm Thị Kim Chi', 'Ung thư học', 'Bác sĩ', id);
    await createDoctor('BS. Hoàng Văn Linh', 'Hóa trị liệu', 'Bác sĩ', id);
    await createDoctor('BS. Võ Thị Ngọc Hân', 'Ung thư học', 'Bác sĩ', id);
    await createDoctor('BS. Lưu Văn Quân', 'Xạ trị ung thư', 'Bác sĩ', id);
    await createDoctor('BS. Châu Thị Mỹ Dung', 'Ung thư học', 'Bác sĩ', id);
    await createNurse('CN. Nguyễn Thị Hồng Loan', 'Điều dưỡng trưởng', id);
    await createNurse('CN. Trần Thị Thanh Ngân', 'Điều dưỡng phó', id);
    await createNurse('CN. Lê Thị Bảo Trân', 'Điều dưỡng CKI', id);
    await createNurse('CN. Phạm Văn Thắng', 'Điều dưỡng', id);
    await createNurse('CN. Đặng Thị Thùy Dương', 'Điều dưỡng', id);
    await createNurse('CN. Hồ Thị Ngọc Hạnh', 'Y tá', id);
    await createNurse('CN. Bùi Thị Xuân Hương', 'Y tá', id);
    await createNurse('CN. Vũ Văn Tùng', 'Y tá', id);
    await createNurse('CN. Lý Thị Thanh Mai', 'Y tá', id);
    await createNurse('CN. Cao Thị Ánh Nguyệt', 'Hộ lý', id);
  }

  // ═══════════════════════════════════════════════════════
  // KHOA GAY MÊ HỒI SỨC
  // ═══════════════════════════════════════════════════════
  if (D['Khoa Gây Mê Hồi Sức']) {
    console.log('\n🏥 Khoa Gây Mê Hồi Sức');
    const id = D['Khoa Gây Mê Hồi Sức'];
    await createDoctor('PGS.TS. Trần Văn Tuấn', 'Gây mê hồi sức', 'Trưởng khoa', id, 250000);
    await createDoctor('TS. Nguyễn Thị Lan Anh', 'Gây mê nhi', 'Phó trưởng khoa', id, 200000);
    await createDoctor('ThS. Lê Văn Hùng', 'Hồi sức sau mổ', 'Bác sĩ CKI', id, 180000);
    await createDoctor('ThS. Phạm Thị Kim Trang', 'Gây mê tim mạch', 'Bác sĩ CKI', id, 180000);
    await createDoctor('BS. Đỗ Văn Minh Triết', 'Gây mê hồi sức', 'Bác sĩ', id);
    await createDoctor('BS. Hoàng Thị Ngọc Trúc', 'Gây mê hồi sức', 'Bác sĩ', id);
    await createDoctor('BS. Võ Văn Thịnh', 'Hồi sức sau mổ', 'Bác sĩ', id);
    await createDoctor('BS. Trương Thị Bảo Hân', 'Gây mê hồi sức', 'Bác sĩ', id);
    await createDoctor('BS. Lưu Văn Đạt', 'Gây mê hồi sức', 'Bác sĩ', id);
    await createNurse('CN. Nguyễn Thị Thu Cúc', 'Điều dưỡng trưởng', id);
    await createNurse('CN. Trần Văn Hào', 'Điều dưỡng phó', id);
    await createNurse('CN. Lê Thị Thu Tuyền', 'Điều dưỡng', id);
    await createNurse('CN. Phạm Văn Phú', 'Điều dưỡng', id);
    await createNurse('CN. Đặng Thị Hồng Ngọc', 'Y tá', id);
    await createNurse('CN. Bùi Thị Kim Dung', 'Y tá', id);
    await createNurse('CN. Hồ Văn Minh', 'Y tá', id);
    await createNurse('CN. Vũ Thị Tú Anh', 'Y tá', id);
    await createNurse('CN. Châu Văn Hiếu', 'Hộ lý', id);
  }

  // ═══════════════════════════════════════════════════════
  // KHOA HỒI SỨC TÍCH CỰC (ICU)
  // ═══════════════════════════════════════════════════════
  if (D['Khoa Hồi Sức Tích Cực (ICU)']) {
    console.log('\n🏥 Khoa Hồi Sức Tích Cực (ICU)');
    const id = D['Khoa Hồi Sức Tích Cực (ICU)'];
    await createDoctor('TS. Vũ Văn Dương', 'Hồi sức tích cực', 'Trưởng khoa', id, 250000);
    await createDoctor('ThS. Nguyễn Thị Hải Yến', 'Hồi sức nội khoa', 'Phó trưởng khoa', id, 200000);
    await createDoctor('ThS. Trần Văn Quý', 'Hồi sức tích cực', 'Bác sĩ CKI', id, 180000);
    await createDoctor('BS. Lê Thị Mỹ Khánh', 'Hồi sức tích cực', 'Bác sĩ', id);
    await createDoctor('BS. Phạm Văn Thịnh', 'Hồi sức nội khoa', 'Bác sĩ', id);
    await createDoctor('BS. Đỗ Thị Thanh Trà', 'Hồi sức tích cực', 'Bác sĩ', id);
    await createDoctor('BS. Hoàng Văn Trọng', 'Hồi sức tích cực', 'Bác sĩ', id);
    await createDoctor('BS. Võ Thị Kim Chi', 'Hồi sức tích cực', 'Bác sĩ', id);
    await createNurse('CN. Nguyễn Văn Phương Đông', 'Điều dưỡng trưởng', id);
    await createNurse('CN. Trần Thị Kim Loan', 'Điều dưỡng phó', id);
    await createNurse('CN. Lê Văn Trung', 'Điều dưỡng', id);
    await createNurse('CN. Phạm Thị Thanh Tâm', 'Điều dưỡng', id);
    await createNurse('CN. Đặng Thị Ngọc Lan', 'Y tá', id);
    await createNurse('CN. Bùi Văn Mạnh', 'Y tá', id);
    await createNurse('CN. Hồ Thị Bảo Yến', 'Y tá', id);
    await createNurse('CN. Vũ Thị Ngọc Bích', 'Y tá', id);
    await createNurse('CN. Châu Thị Thanh Loan', 'Hộ lý', id);
  }

  // ═══════════════════════════════════════════════════════
  // KHOA HỒI SỨC TÍCH CỰC NHI (PICU)
  // ═══════════════════════════════════════════════════════
  if (D['Khoa Hồi Sức Tích Cực Nhi (PICU)']) {
    console.log('\n🏥 Khoa PICU');
    const id = D['Khoa Hồi Sức Tích Cực Nhi (PICU)'];
    await createDoctor('TS. Nguyễn Thị Thanh Nga', 'Hồi sức nhi', 'Trưởng khoa', id, 200000);
    await createDoctor('ThS. Lê Văn Tiến', 'Hồi sức sơ sinh', 'Phó trưởng khoa', id, 180000);
    await createDoctor('BS. Trần Thị Bảo Trân', 'Hồi sức nhi', 'Bác sĩ CKI', id, 160000);
    await createDoctor('BS. Phạm Văn An', 'Hồi sức nhi', 'Bác sĩ', id);
    await createDoctor('BS. Đỗ Thị Thu Thảo', 'Hồi sức sơ sinh', 'Bác sĩ', id);
    await createDoctor('BS. Hoàng Thị Diệu Thúy', 'Hồi sức nhi', 'Bác sĩ', id);
    await createNurse('CN. Nguyễn Thị Mỹ Trang', 'Điều dưỡng trưởng', id);
    await createNurse('CN. Trần Thị Kiều My', 'Điều dưỡng', id);
    await createNurse('CN. Lê Thị Thanh Phương', 'Điều dưỡng', id);
    await createNurse('CN. Phạm Thị Ngọc Hiếu', 'Y tá', id);
    await createNurse('CN. Đặng Văn Huy', 'Y tá', id);
    await createNurse('CN. Bùi Thị Thu Phương', 'Y tá', id);
    await createNurse('CN. Hồ Thị Diệu Thúy', 'Hộ lý', id);
  }

  // ═══════════════════════════════════════════════════════
  // KHOA TAI MŨI HỌNG
  // ═══════════════════════════════════════════════════════
  if (D['Khoa Tai Mũi Họng']) {
    console.log('\n🏥 Khoa Tai Mũi Họng');
    const id = D['Khoa Tai Mũi Họng'];
    await createDoctor('TS. Phạm Văn Quý', 'Tai mũi họng', 'Trưởng khoa', id, 200000);
    await createDoctor('ThS. Nguyễn Thị Bảo Linh', 'Thính học', 'Phó trưởng khoa', id, 160000);
    await createDoctor('ThS. Lê Văn Đức Anh', 'Tai mũi họng', 'Bác sĩ CKI', id, 160000);
    await createDoctor('BS. Trần Thị Thanh Xuân', 'Tai mũi họng', 'Bác sĩ', id);
    await createDoctor('BS. Phạm Văn Lâm', 'Thính học', 'Bác sĩ', id);
    await createDoctor('BS. Đỗ Thị Kim Ngân', 'Tai mũi họng', 'Bác sĩ', id);
    await createDoctor('BS. Hoàng Văn Thịnh', 'Tai mũi họng', 'Bác sĩ', id);
    await createDoctor('BS. Võ Thị Thu Hiền', 'Tai mũi họng', 'Bác sĩ', id);
    await createNurse('CN. Nguyễn Thị Phước Nguyên', 'Điều dưỡng trưởng', id);
    await createNurse('CN. Trần Văn Đức', 'Điều dưỡng phó', id);
    await createNurse('CN. Lê Thị Ngọc Mai', 'Điều dưỡng', id);
    await createNurse('CN. Phạm Thị Thu Uyên', 'Y tá', id);
    await createNurse('CN. Đặng Văn Phú', 'Y tá', id);
    await createNurse('CN. Bùi Thị Hồng Đào', 'Y tá', id);
    await createNurse('CN. Hồ Thị Kim Anh', 'Hộ lý', id);
  }

  // ═══════════════════════════════════════════════════════
  // KHOA MẮT (NHÃN)
  // ═══════════════════════════════════════════════════════
  for (const eyeDeptName of ['Khoa Mắt', 'Khoa Nhãn']) {
    if (D[eyeDeptName]) {
      console.log(`\n🏥 ${eyeDeptName}`);
      const id = D[eyeDeptName];
      await createDoctor('PGS.TS. Trần Thị Phương Khanh', 'Nhãn khoa', 'Trưởng khoa', id, 200000);
      await createDoctor('ThS. Nguyễn Văn Hải Nam', 'Phẫu thuật mắt', 'Phó trưởng khoa', id, 160000);
      await createDoctor('ThS. Lê Thị Ngọc Khánh', 'Nhãn khoa', 'Bác sĩ CKI', id, 160000);
      await createDoctor('BS. Phạm Thị Bảo Châu', 'Nhãn khoa', 'Bác sĩ', id);
      await createDoctor('BS. Đỗ Văn Nhân', 'Phẫu thuật mắt', 'Bác sĩ', id);
      await createDoctor('BS. Hoàng Thị Mỹ Ngọc', 'Nhãn khoa', 'Bác sĩ', id);
      await createNurse('CN. Nguyễn Thị Thu Trà', 'Điều dưỡng trưởng', id);
      await createNurse('CN. Trần Thị Ánh Nguyệt', 'Điều dưỡng', id);
      await createNurse('CN. Lê Thị Kim Dung', 'Điều dưỡng', id);
      await createNurse('CN. Phạm Văn Bảo', 'Y tá', id);
      await createNurse('CN. Đặng Thị Thanh Thủy', 'Y tá', id);
      await createNurse('CN. Bùi Thị Ngọc Trâm', 'Hộ lý', id);
    }
  }

  // ═══════════════════════════════════════════════════════
  // KHOA RĂNG HÀM MẶT
  // ═══════════════════════════════════════════════════════
  if (D['Khoa Răng Hàm Mặt']) {
    console.log('\n🏥 Khoa Răng Hàm Mặt');
    const id = D['Khoa Răng Hàm Mặt'];
    await createDoctor('TS. Lê Quang Hưng', 'Răng hàm mặt', 'Trưởng khoa', id, 200000);
    await createDoctor('ThS. Nguyễn Thị Thanh Ngọc', 'Phẫu thuật hàm mặt', 'Phó trưởng khoa', id, 160000);
    await createDoctor('ThS. Trần Văn Hảo', 'Nha chu', 'Bác sĩ CKI', id, 160000);
    await createDoctor('BS. Phạm Thị Quỳnh Như', 'Răng hàm mặt', 'Bác sĩ', id);
    await createDoctor('BS. Đỗ Văn Tùng', 'Phục hình răng', 'Bác sĩ', id);
    await createDoctor('BS. Hoàng Thị Kim Phụng', 'Răng hàm mặt', 'Bác sĩ', id);
    await createDoctor('BS. Võ Văn Trung', 'Nha chu', 'Bác sĩ', id);
    await createDoctor('BS. Lưu Thị Ngọc Hân', 'Răng hàm mặt', 'Bác sĩ', id);
    await createNurse('CN. Nguyễn Thị Bích Châu', 'Điều dưỡng trưởng', id);
    await createNurse('CN. Trần Thị Khánh Linh', 'Điều dưỡng phó', id);
    await createNurse('CN. Lê Văn Khải', 'Điều dưỡng', id);
    await createNurse('CN. Phạm Thị Kim Thoa', 'Y tá', id);
    await createNurse('CN. Đặng Thị Hồng Ánh', 'Y tá', id);
    await createNurse('CN. Bùi Văn Tuấn', 'Y tá', id);
    await createNurse('CN. Hồ Thị Ngọc Trân', 'Hộ lý', id);
  }

  // ═══════════════════════════════════════════════════════
  // KHOA PHỤC HỒI CHỨC NĂNG
  // ═══════════════════════════════════════════════════════
  if (D['Khoa Phục Hồi Chức Năng']) {
    console.log('\n🏥 Khoa Phục Hồi Chức Năng');
    const id = D['Khoa Phục Hồi Chức Năng'];
    await createDoctor('TS. Nguyễn Thị Thu Hà', 'Phục hồi chức năng', 'Trưởng khoa', id, 180000);
    await createDoctor('ThS. Trần Văn Phúc', 'Vật lý trị liệu', 'Phó trưởng khoa', id, 160000);
    await createDoctor('BS. Lê Thị Diệu Linh', 'Phục hồi chức năng', 'Bác sĩ CKI', id, 150000);
    await createDoctor('BS. Phạm Văn Kiên', 'Vật lý trị liệu', 'Bác sĩ', id);
    await createDoctor('BS. Đỗ Thị Thanh Tuyền', 'Phục hồi chức năng', 'Bác sĩ', id);
    await createDoctor('BS. Hoàng Văn Đồng', 'Phục hồi chức năng', 'Bác sĩ', id);
    await createNurse('CN. Nguyễn Thị Thanh Tú', 'Điều dưỡng trưởng', id);
    await createNurse('CN. Trần Thị Bảo Dung', 'Kỹ thuật viên', id);
    await createNurse('CN. Lê Thị Thu Vân', 'Kỹ thuật viên', id);
    await createNurse('CN. Phạm Văn Hoan', 'Kỹ thuật viên', id);
    await createNurse('CN. Đặng Thị Kiều Hoa', 'Y tá', id);
    await createNurse('CN. Bùi Thị Ngọc Tuyền', 'Y tá', id);
    await createNurse('CN. Hồ Văn Hiếu', 'Hộ lý', id);
  }

  // ═══════════════════════════════════════════════════════
  // KHOA Y HỌC CỔ TRUYỀN
  // ═══════════════════════════════════════════════════════
  if (D['Khoa Y Học Cổ Truyền']) {
    console.log('\n🏥 Khoa Y Học Cổ Truyền');
    const id = D['Khoa Y Học Cổ Truyền'];
    await createDoctor('TS. Lê Thị Minh Nguyệt', 'Y học cổ truyền', 'Trưởng khoa', id, 180000);
    await createDoctor('ThS. Nguyễn Văn Chinh', 'Châm cứu', 'Phó trưởng khoa', id, 160000);
    await createDoctor('ThS. Trần Thị Thu Hằng', 'Y học cổ truyền', 'Bác sĩ CKI', id, 150000);
    await createDoctor('BS. Phạm Thị Hà Anh', 'Châm cứu', 'Bác sĩ', id);
    await createDoctor('BS. Đỗ Văn Hòa', 'Vật lý y học cổ truyền', 'Bác sĩ', id);
    await createDoctor('BS. Hoàng Thị Ánh Nguyệt', 'Y học cổ truyền', 'Bác sĩ', id);
    await createDoctor('BS. Võ Văn Chiến', 'Châm cứu', 'Bác sĩ', id);
    await createNurse('CN. Nguyễn Thị Bích Liên', 'Điều dưỡng trưởng', id);
    await createNurse('CN. Trần Văn Hải', 'Kỹ thuật viên', id);
    await createNurse('CN. Lê Thị Kim Liên', 'Kỹ thuật viên', id);
    await createNurse('CN. Phạm Thị Tuyết Nhung', 'Y tá', id);
    await createNurse('CN. Đặng Văn Thịnh', 'Y tá', id);
    await createNurse('CN. Bùi Thị Thu Huyền', 'Hộ lý', id);
  }

  // ═══════════════════════════════════════════════════════
  // KHOA TRUYỀN NHIỄM
  // ═══════════════════════════════════════════════════════
  if (D['Khoa Truyền Nhiễm']) {
    console.log('\n🏥 Khoa Truyền Nhiễm');
    const id = D['Khoa Truyền Nhiễm'];
    await createDoctor('TS. Nguyễn Văn Hà', 'Truyền nhiễm', 'Trưởng khoa', id, 200000);
    await createDoctor('ThS. Trần Thị Ngọc Anh', 'HIV/AIDS', 'Phó trưởng khoa', id, 160000);
    await createDoctor('ThS. Lê Văn Phúc Bình', 'Truyền nhiễm', 'Bác sĩ CKI', id, 160000);
    await createDoctor('BS. Phạm Thị Thu Nga', 'Truyền nhiễm', 'Bác sĩ', id);
    await createDoctor('BS. Đỗ Văn Thọ', 'Truyền nhiễm', 'Bác sĩ', id);
    await createDoctor('BS. Hoàng Thị Kim Oanh', 'HIV/AIDS', 'Bác sĩ', id);
    await createDoctor('BS. Võ Văn Nghĩa', 'Truyền nhiễm', 'Bác sĩ', id);
    await createNurse('CN. Nguyễn Thị Hồng Hoa', 'Điều dưỡng trưởng', id);
    await createNurse('CN. Trần Văn Hoàng', 'Điều dưỡng phó', id);
    await createNurse('CN. Lê Thị Ánh Kim', 'Điều dưỡng', id);
    await createNurse('CN. Phạm Thị Thanh Thúy', 'Y tá', id);
    await createNurse('CN. Đặng Thị Ngọc Trinh', 'Y tá', id);
    await createNurse('CN. Bùi Văn Lực', 'Y tá', id);
    await createNurse('CN. Hồ Thị Diệu Hương', 'Hộ lý', id);
  }

  // ═══════════════════════════════════════════════════════
  // KHOA PHẪU THUẬT LỒNG NGỰC + MẠCH MÁU
  // ═══════════════════════════════════════════════════════
  for (const deptName of ['Khoa Phẫu Thuật Lồng Ngực', 'Khoa Phẫu Thuật Mạch']) {
    if (D[deptName]) {
      console.log(`\n🏥 ${deptName}`);
      const id = D[deptName];
      await createDoctor('TS. Trần Minh Toàn', 'Phẫu thuật lồng ngực', 'Trưởng khoa', id, 300000);
      await createDoctor('ThS. Nguyễn Thị Tuyết Mai', 'Phẫu thuật tim hở', 'Phó trưởng khoa', id, 250000);
      await createDoctor('ThS. Lê Văn Hào Kiệt', 'Phẫu thuật mạch máu', 'Bác sĩ CKI', id, 200000);
      await createDoctor('BS. Phạm Văn Duy Khang', 'Phẫu thuật lồng ngực', 'Bác sĩ', id);
      await createDoctor('BS. Đỗ Thị Mỹ Trinh', 'Phẫu thuật tim hở', 'Bác sĩ', id);
      await createDoctor('BS. Hoàng Văn Phước', 'Phẫu thuật lồng ngực', 'Bác sĩ', id);
      await createNurse('CN. Nguyễn Thị Kim Nguyên', 'Điều dưỡng trưởng', id);
      await createNurse('CN. Trần Thị Thanh Trúc', 'Điều dưỡng', id);
      await createNurse('CN. Lê Văn Hùng Phát', 'Điều dưỡng', id);
      await createNurse('CN. Phạm Thị Hồng Cúc', 'Y tá', id);
      await createNurse('CN. Đặng Thị Kim Trang', 'Y tá', id);
      await createNurse('CN. Bùi Thị Mỹ Tuyền', 'Hộ lý', id);
    }
  }

  // ═══════════════════════════════════════════════════════
  // KHOA TIẾT NIỆU - NAM KHOA
  // ═══════════════════════════════════════════════════════
  if (D['Khoa Tiết Niệu - Nam Khoa']) {
    console.log('\n🏥 Khoa Tiết Niệu - Nam Khoa');
    const id = D['Khoa Tiết Niệu - Nam Khoa'];
    await createDoctor('TS. Lê Văn Phong Nhã', 'Tiết niệu học', 'Trưởng khoa', id, 200000);
    await createDoctor('ThS. Nguyễn Thị Mỹ Phượng', 'Nam khoa', 'Phó trưởng khoa', id, 160000);
    await createDoctor('BS. Trần Văn Hào', 'Tiết niệu học', 'Bác sĩ CKI', id, 160000);
    await createDoctor('BS. Phạm Thị Hồng Loan', 'Tiết niệu học', 'Bác sĩ', id);
    await createDoctor('BS. Đỗ Văn Thịnh', 'Nam khoa', 'Bác sĩ', id);
    await createDoctor('BS. Hoàng Văn Hiệp', 'Tiết niệu học', 'Bác sĩ', id);
    await createNurse('CN. Nguyễn Thị Thủy Tiên', 'Điều dưỡng trưởng', id);
    await createNurse('CN. Trần Văn Khoa', 'Điều dưỡng', id);
    await createNurse('CN. Lê Thị Bảo Khánh', 'Điều dưỡng', id);
    await createNurse('CN. Phạm Thị Kim Oanh', 'Y tá', id);
    await createNurse('CN. Đặng Văn Tín', 'Y tá', id);
    await createNurse('CN. Bùi Thị Ngọc Hân', 'Hộ lý', id);
  }

  // ═══════════════════════════════════════════════════════
  // KHOA PHÁP Y
  // ═══════════════════════════════════════════════════════
  if (D['Khoa Pháp Y - Giám Định Tư Pháp']) {
    console.log('\n🏥 Khoa Pháp Y');
    const id = D['Khoa Pháp Y - Giám Định Tư Pháp'];
    await createDoctor('TS. Nguyễn Văn Đại', 'Pháp y', 'Trưởng khoa', id, 200000);
    await createDoctor('ThS. Trần Thị Bảo Hân', 'Giám định thương tật', 'Phó trưởng khoa', id, 160000);
    await createDoctor('BS. Lê Văn Quân', 'Pháp y', 'Bác sĩ CKI', id, 150000);
    await createDoctor('BS. Phạm Thị Kim Phượng', 'Pháp y', 'Bác sĩ', id);
    await createDoctor('BS. Đỗ Văn Trường', 'Giám định thương tật', 'Bác sĩ', id);
    await createNurse('CN. Nguyễn Thị Thanh Nga', 'Điều dưỡng trưởng', id);
    await createNurse('CN. Trần Văn Lợi', 'Kỹ thuật viên', id);
    await createNurse('CN. Lê Thị Cẩm Tú', 'Kỹ thuật viên', id);
    await createNurse('CN. Phạm Thị Thu Nhi', 'Hỗ trợ pháp y', id);
  }

  // ═══════════════════════════════════════════════════════
  // KHOA SIÊU ÂM CHẨN ĐOÁN
  // ═══════════════════════════════════════════════════════
  if (D['Khoa Siêu Âm Chẩn Đoán']) {
    console.log('\n🏥 Khoa Siêu Âm Chẩn Đoán');
    const id = D['Khoa Siêu Âm Chẩn Đoán'];
    await createDoctor('ThS. Nguyễn Thị Tuyết Phương', 'Siêu âm chẩn đoán', 'Trưởng khoa', id, 180000);
    await createDoctor('ThS. Trần Văn Thái', 'Siêu âm can thiệp', 'Phó trưởng khoa', id, 160000);
    await createDoctor('BS. Lê Thị Kim Duyên', 'Siêu âm chẩn đoán', 'Bác sĩ CKI', id, 150000);
    await createDoctor('BS. Phạm Văn Lộc', 'Siêu âm chẩn đoán', 'Bác sĩ', id);
    await createDoctor('BS. Đỗ Thị Ngọc Anh', 'Siêu âm can thiệp', 'Bác sĩ', id);
    await createNurse('CN. Nguyễn Thị Ngọc Hương', 'Kỹ thuật viên trưởng', id);
    await createNurse('CN. Trần Văn Bảo', 'Kỹ thuật viên', id);
    await createNurse('CN. Lê Thị Thu Diệu', 'Kỹ thuật viên', id);
    await createNurse('CN. Phạm Thị Minh Trang', 'Điều dưỡng', id);
    await createNurse('CN. Đặng Văn Hiếu Nghĩa', 'Điều dưỡng', id);
  }

  // ═══════════════════════════════════════════════════════
  // KHOA XÉT NGHIỆM
  // ═══════════════════════════════════════════════════════
  if (D['Khoa Xét Nghiệm']) {
    console.log('\n🏥 Khoa Xét Nghiệm');
    const id = D['Khoa Xét Nghiệm'];
    await createDoctor('TS. Trần Thị Kim Loan', 'Xét nghiệm lâm sàng', 'Trưởng khoa', id, 180000);
    await createDoctor('ThS. Nguyễn Văn Thọ', 'Vi sinh lâm sàng', 'Phó trưởng khoa', id, 160000);
    await createDoctor('BS. Lê Thị Thúy Anh', 'Xét nghiệm lâm sàng', 'Bác sĩ', id);
    await createDoctor('BS. Phạm Văn Quang Trung', 'Sinh hóa lâm sàng', 'Bác sĩ', id);
    await createNurse('CN. Trần Thị Mỹ Ngọc', 'Kỹ thuật viên trưởng', id);
    await createNurse('CN. Nguyễn Văn Phúc', 'Kỹ thuật viên', id);
    await createNurse('CN. Lê Thị Thanh Trúc', 'Kỹ thuật viên', id);
    await createNurse('CN. Phạm Thị Diệu Hoa', 'Kỹ thuật viên', id);
    await createNurse('CN. Đặng Thị Ngọc Kim', 'Kỹ thuật viên', id);
    await createNurse('CN. Bùi Văn Hiếu', 'Điều dưỡng', id);
    await createNurse('CN. Hồ Thị Phương Mai', 'Hỗ trợ kỹ thuật', id);
  }

  // ═══════════════════════════════════════════════════════
  // KHOA TAM THẦN - TÂM LÝ (phân biệt với Khoa Tâm Thần)
  // ═══════════════════════════════════════════════════════
  if (D['Khoa Tâm Thần - Tâm Lý']) {
    console.log('\n🏥 Khoa Tâm Thần - Tâm Lý');
    const id = D['Khoa Tâm Thần - Tâm Lý'];
    await createDoctor('PGS.TS. Lê Thị Cẩm Vân', 'Tâm lý học lâm sàng', 'Trưởng khoa', id, 200000);
    await createDoctor('TS. Nguyễn Văn Phương', 'Tâm lý trị liệu', 'Phó trưởng khoa', id, 180000);
    await createDoctor('ThS. Trần Thị Kim Cương', 'Rối loạn lo âu', 'Bác sĩ CKI', id, 160000);
    await createDoctor('BS. Phạm Văn Trực', 'Tâm lý học lâm sàng', 'Bác sĩ', id);
    await createDoctor('BS. Đỗ Thị Hải Yến', 'Tâm lý trẻ em', 'Bác sĩ', id);
    await createDoctor('BS. Hoàng Văn Hào', 'Tâm thần học', 'Bác sĩ', id);
    await createNurse('CN. Nguyễn Thị Thu Nguyệt', 'Điều dưỡng trưởng', id);
    await createNurse('CN. Trần Thị Ngọc Hân', 'Điều dưỡng', id);
    await createNurse('CN. Lê Văn Phong', 'Điều dưỡng', id);
    await createNurse('CN. Phạm Thị Hồng Hạnh', 'Y tá', id);
    await createNurse('CN. Đặng Văn Hưng', 'Y tá', id);
    await createNurse('CN. Bùi Thị Bích Thuỷ', 'Hộ lý', id);
  }

  // ═══════════════════════════════════════════════════════
  // KHOA NHI HÔ HẤP
  // ═══════════════════════════════════════════════════════
  if (D['Khoa Nhi Hô Hấp']) {
    console.log('\n🏥 Khoa Nhi Hô Hấp');
    const id = D['Khoa Nhi Hô Hấp'];
    await createDoctor('TS. Nguyễn Thị Bảo Khanh', 'Nhi hô hấp', 'Trưởng khoa', id, 180000);
    await createDoctor('ThS. Trần Văn Quốc', 'Hen phế quản trẻ em', 'Phó trưởng khoa', id, 160000);
    await createDoctor('BS. Lê Thị Cẩm Nhung', 'Nhi hô hấp', 'Bác sĩ', id);
    await createDoctor('BS. Phạm Văn An Bình', 'Nhi hô hấp', 'Bác sĩ', id);
    await createDoctor('BS. Đỗ Thị Kim Lan', 'Hen phế quản trẻ em', 'Bác sĩ', id);
    await createNurse('CN. Nguyễn Thị Mỹ Châu', 'Điều dưỡng trưởng', id);
    await createNurse('CN. Trần Thị Ngọc Linh', 'Điều dưỡng', id);
    await createNurse('CN. Lê Văn Bình', 'Điều dưỡng', id);
    await createNurse('CN. Phạm Thị Thanh Vân', 'Y tá', id);
    await createNurse('CN. Đặng Thị Kim Hoa', 'Y tá', id);
    await createNurse('CN. Bùi Thị Thu Ngân', 'Hộ lý', id);
  }

  // ═══════════════════════════════════════════════════════
  // KHOA NGOẠI TỔNG HỢP + NỘI TỔNG HỢP
  // ═══════════════════════════════════════════════════════
  for (const deptName of ['Khoa Ngoại Tổng Hợp', 'Khoa Nội Tổng Hợp']) {
    if (D[deptName]) {
      console.log(`\n🏥 ${deptName}`);
      const id = D[deptName];
      await createDoctor('ThS. Phạm Thị Bích Liên', deptName.includes('Nội') ? 'Nội tổng quát' : 'Ngoại tổng quát', 'Trưởng khoa', id, 180000);
      await createDoctor('ThS. Hoàng Văn Nghĩa', deptName.includes('Nội') ? 'Nội tổng quát' : 'Ngoại tổng quát', 'Phó trưởng khoa', id, 160000);
      await createDoctor('BS. Nguyễn Thị Thu Minh', deptName.includes('Nội') ? 'Nội tổng quát' : 'Ngoại tổng quát', 'Bác sĩ', id);
      await createDoctor('BS. Trần Văn Khang', deptName.includes('Nội') ? 'Nội tổng quát' : 'Ngoại tổng quát', 'Bác sĩ', id);
      await createDoctor('BS. Lê Thị Ngọc Bảo', deptName.includes('Nội') ? 'Nội tổng quát' : 'Ngoại tổng quát', 'Bác sĩ', id);
      await createNurse('CN. Nguyễn Thị Ngọc Lan', 'Điều dưỡng trưởng', id);
      await createNurse('CN. Trần Thị Kim Oanh', 'Điều dưỡng', id);
      await createNurse('CN. Lê Văn Huy', 'Điều dưỡng', id);
      await createNurse('CN. Phạm Thị Thanh Hoa', 'Y tá', id);
      await createNurse('CN. Đặng Văn Hùng Phúc', 'Y tá', id);
      await createNurse('CN. Bùi Thị Hồng Loan', 'Hộ lý', id);
    }
  }

  // ═══════════════════════════════════════════════════════
  // PHÒNG BAN CÒN THIẾU NHÂN SỰ
  // ═══════════════════════════════════════════════════════
  console.log('\n\n🏢 Bổ sung nhân sự phòng ban còn thiếu...');

  // Phòng Dinh Dưỡng
  if (D['Phòng Dinh Dưỡng']) {
    await createStaff('ThS. Nguyễn Thị Cẩm Hương', 'huongnt.dinhdung@bvhungloi.vn', 'STAFF', 'Trưởng phòng Dinh dưỡng');
    await createStaff('CN. Trần Thị Bích Lan', 'lant.dinhdung@bvhungloi.vn', 'STAFF', 'Chuyên viên Dinh dưỡng');
    await createStaff('CN. Lê Văn Minh Tuấn', 'tuanlvm.dinhdung@bvhungloi.vn', 'STAFF', 'Kỹ thuật viên Dinh dưỡng');
  }
  // Phòng Đào Tạo
  if (D['Phòng Đào Tạo - Nghiên Cứu Khoa Học']) {
    await createStaff('TS. Phạm Thị Minh Hoa', 'hoaptm.daotao@bvhungloi.vn', 'STAFF', 'Trưởng phòng Đào tạo');
    await createStaff('ThS. Nguyễn Văn Thắng Lợi', 'loinvt.daotao@bvhungloi.vn', 'STAFF', 'Chuyên viên Nghiên cứu');
    await createStaff('CN. Trần Thị Phương Thảo', 'thaott.daotao@bvhungloi.vn', 'STAFF', 'Chuyên viên Đào tạo');
  }
  // Phòng Quản Lý Chất Lượng
  if (D['Phòng Quản Lý Chất Lượng']) {
    await createStaff('ThS. Lê Thị Thu Hường', 'huongltt.chatluong@bvhungloi.vn', 'STAFF', 'Trưởng phòng QLCL');
    await createStaff('CN. Nguyễn Văn Hoàng', 'hoangnv.chatluong@bvhungloi.vn', 'STAFF', 'Chuyên viên QLCL');
    await createStaff('CN. Trần Thị Kim Chi', 'chitrk.chatluong@bvhungloi.vn', 'STAFF', 'Chuyên viên kiểm soát nhiễm khuẩn');
  }
  // Phòng Vệ Sinh
  if (D['Phòng Vệ Sinh - Khám Chữa Bệnh']) {
    await createStaff('CN. Nguyễn Văn Tài', 'tainv.vesinh@bvhungloi.vn', 'STAFF', 'Trưởng bộ phận vệ sinh');
    await createStaff('CN. Trần Thị Kim Hoa', 'hoattk.vesinh@bvhungloi.vn', 'STAFF', 'Nhân viên vệ sinh');
  }
  // Phòng Phòng Chống Bệnh Tật
  if (D['Khoa Phòng Chống Bệnh Tật']) {
    await createDoctor('TS. Đặng Thị Hồng Nga', 'Y tế công cộng', 'Trưởng khoa', D['Khoa Phòng Chống Bệnh Tật'], 150000);
    await createDoctor('ThS. Lê Văn Chiến Thắng', 'Dịch tễ học', 'Phó trưởng khoa', D['Khoa Phòng Chống Bệnh Tật'], 140000);
    await createDoctor('BS. Nguyễn Thị Mỹ Linh', 'Y tế công cộng', 'Bác sĩ', D['Khoa Phòng Chống Bệnh Tật']);
    await createNurse('CN. Trần Thị Ngọc Yến', 'Điều dưỡng', D['Khoa Phòng Chống Bệnh Tật']);
    await createNurse('CN. Phạm Văn Long', 'Y tế cộng đồng', D['Khoa Phòng Chống Bệnh Tật']);
  }

  console.log('\n\n' + '═'.repeat(55));
  const totalDoctors = await prisma.doctor.count();
  const totalNurses  = await prisma.nurse.count();
  const totalAll     = await prisma.user.count({ where: { role: { not: 'PATIENT' } } });
  console.log('✅ HOÀN TẤT BỔ SUNG!');
  console.log(`   👨‍⚕️ Tổng bác sĩ: ${totalDoctors}`);
  console.log(`   👩‍⚕️ Tổng y tá/điều dưỡng: ${totalNurses}`);
  console.log(`   📊 Tổng nhân sự: ${totalAll}`);
  console.log('═'.repeat(55));
}

main().catch(console.error).finally(() => prisma.$disconnect());
