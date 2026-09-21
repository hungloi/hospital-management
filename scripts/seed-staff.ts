/**
 * Script tạo lại toàn bộ nhân sự bệnh viện Hưng Lợi
 * Chạy: npx tsx scripts/seed-staff.ts
 */
import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

// ─── Passwords (computed inside main) ─────────────────────────────────────────
let PASS_DOCTOR   = '';
let PASS_DIRECTOR = '';
let PASS_NURSE    = '';
let PASS_STAFF    = '';
let PASS_ACCOUNT  = '';

async function main() {
  PASS_DOCTOR   = await bcrypt.hash('bacsi123', 10);
  PASS_DIRECTOR = await bcrypt.hash('giamdoc123', 10);
  PASS_NURSE    = await bcrypt.hash('yta123', 10);
  PASS_STAFF    = await bcrypt.hash('nhansu123', 10);
  PASS_ACCOUNT  = await bcrypt.hash('ketoan123', 10);

  console.log('🔄 Bắt đầu seed nhân sự bệnh viện Hưng Lợi...\n');

  // ── 1. Xoá toàn bộ nhân sự cũ (giữ lại ADMIN và PATIENT) ──────────────────
  console.log('🗑  Xoá nhân sự cũ...');
  
  // Delete related records first
  await prisma.staffShift.deleteMany({});
  await prisma.medicalOrder.deleteMany({});
  await prisma.prescription.deleteMany({});
  await prisma.labOrder.deleteMany({});
  await prisma.surgeryOrder.deleteMany({});
  await prisma.inpatientRecord.deleteMany({});
  await prisma.clinicRecord.deleteMany({});
  await prisma.medicalRecord.deleteMany({});
  await prisma.appointment.deleteMany({});
  await prisma.clinicAppointment.deleteMany({});
  
  await prisma.doctor.deleteMany({});
  await prisma.nurse.deleteMany({});
  
  await prisma.user.deleteMany({
    where: { role: { in: ['DOCTOR', 'NURSE', 'DIRECTOR', 'PHARMACIST', 'ACCOUNTANT', 'STAFF', 'LAB', 'IT'] } }
  });
  
  console.log('✅ Đã xoá nhân sự cũ\n');

  // ── 2. Lấy danh sách khoa ────────────────────────────────────────────────────
  const departments = await prisma.department.findMany({ orderBy: { name: 'asc' } });
  if (departments.length === 0) {
    console.error('❌ Chưa có khoa phòng! Hãy tạo khoa trước.');
    return;
  }
  console.log(`📋 Tìm thấy ${departments.length} khoa:\n`);
  departments.forEach(d => console.log(`   - ${d.name} (${d.id})`));
  console.log('');

  const deptMap: Record<string, string> = {};
  departments.forEach(d => { deptMap[d.name] = d.id; });

  // ── 3. Ban Giám Đốc ──────────────────────────────────────────────────────────
  console.log('👔 Tạo Ban Giám Đốc...');
  const directors = [
    { name: 'GS.TS. Trịnh Hưng Lợi',       email: 'trinhhungloi@bvhungloi.vn',   title: 'Giám đốc Bệnh viện',       role: 'DIRECTOR', pass: PASS_DIRECTOR },
    { name: 'PGS.TS. Nguyễn Minh Châu',    email: 'nguyenminhchau@bvhungloi.vn', title: 'Phó Giám đốc Y khoa',      role: 'DIRECTOR', pass: PASS_DIRECTOR },
    { name: 'TS. Lê Thị Phương Linh',      email: 'lethiphuonglinh@bvhungloi.vn',title: 'Phó Giám đốc Kinh doanh', role: 'DIRECTOR', pass: PASS_DIRECTOR },
    { name: 'ThS. Phạm Quốc Hùng',         email: 'phamquochung@bvhungloi.vn',   title: 'Phó Giám đốc Hành chính', role: 'DIRECTOR', pass: PASS_DIRECTOR },
  ];
  for (const d of directors) {
    await prisma.user.upsert({
      where: { email: d.email },
      update: { password: d.pass, role: d.role, name: d.name, phone: randomPhone() },
      create: { email: d.email, password: d.pass, name: d.name, role: d.role, phone: randomPhone(), address: 'TP. Hồ Chí Minh', gender: 'MALE' }
    });
    console.log(`   ✓ ${d.title}: ${d.name}`);
  }

  // ── 4. Bác sĩ theo từng khoa ─────────────────────────────────────────────────
  console.log('\n👨‍⚕️ Tạo bác sĩ theo khoa...');

  const doctorsByDept: Record<string, { name: string; specialty: string; title: string; licenseNo: string }[]> = {
    'Khoa Nội': [
      { name: 'PGS.TS. Trần Văn Nam',     specialty: 'Nội tim mạch',       title: 'Trưởng khoa',    licenseNo: 'BV-001' },
      { name: 'TS. Nguyễn Thị Hương',     specialty: 'Nội tiêu hóa',       title: 'Phó trưởng khoa',licenseNo: 'BV-002' },
      { name: 'ThS. Lê Quang Minh',       specialty: 'Nội thần kinh',      title: 'Bác sĩ CKI',     licenseNo: 'BV-003' },
      { name: 'ThS. Phạm Thị Lan',        specialty: 'Nội hô hấp',         title: 'Bác sĩ CKI',     licenseNo: 'BV-004' },
      { name: 'BS. Hoàng Văn Đức',        specialty: 'Nội thận',           title: 'Bác sĩ',          licenseNo: 'BV-005' },
      { name: 'BS. Nguyễn Thị Mai Anh',   specialty: 'Nội tiết',           title: 'Bác sĩ',          licenseNo: 'BV-006' },
      { name: 'BS. Trần Minh Tuấn',       specialty: 'Nội tim mạch',       title: 'Bác sĩ',          licenseNo: 'BV-007' },
      { name: 'BS. Vũ Thị Thu Hà',        specialty: 'Nội tiêu hóa',       title: 'Bác sĩ',          licenseNo: 'BV-008' },
      { name: 'BS. Bùi Văn Khoa',         specialty: 'Nội hô hấp',         title: 'Bác sĩ',          licenseNo: 'BV-009' },
      { name: 'BS. Đỗ Thị Ngọc',         specialty: 'Nội thần kinh',      title: 'Bác sĩ',          licenseNo: 'BV-010' },
    ],
    'Khoa Ngoại': [
      { name: 'GS.TS. Võ Văn Thành',      specialty: 'Phẫu thuật tiêu hóa',title: 'Trưởng khoa',    licenseNo: 'BV-011' },
      { name: 'TS. Dương Thị Kim Oanh',   specialty: 'Phẫu thuật tổng quát',title:'Phó trưởng khoa',licenseNo: 'BV-012' },
      { name: 'ThS. Lý Văn Tùng',         specialty: 'Phẫu thuật lồng ngực',title:'Bác sĩ CKII',    licenseNo: 'BV-013' },
      { name: 'ThS. Trịnh Thị Bích',      specialty: 'Phẫu thuật tiết niệu',title:'Bác sĩ CKI',     licenseNo: 'BV-014' },
      { name: 'BS. Đặng Văn Hải',         specialty: 'Phẫu thuật chỉnh hình',title:'Bác sĩ',        licenseNo: 'BV-015' },
      { name: 'BS. Phan Thị Kiều',        specialty: 'Phẫu thuật tổng quát',title:'Bác sĩ',         licenseNo: 'BV-016' },
      { name: 'BS. Ngô Văn Bình',         specialty: 'Phẫu thuật tiêu hóa',title:'Bác sĩ',          licenseNo: 'BV-017' },
      { name: 'BS. Lưu Thị Mỹ Hoa',      specialty: 'Phẫu thuật lồng ngực',title:'Bác sĩ',         licenseNo: 'BV-018' },
      { name: 'BS. Hà Văn Phong',         specialty: 'Phẫu thuật tiết niệu',title:'Bác sĩ',         licenseNo: 'BV-019' },
      { name: 'BS. Trương Thị Ngọc Trân', specialty: 'Phẫu thuật tổng quát',title:'Bác sĩ',         licenseNo: 'BV-020' },
    ],
    'Khoa Sản': [
      { name: 'PGS.TS. Nguyễn Thị Bích Ngọc', specialty: 'Sản phụ khoa',  title: 'Trưởng khoa',    licenseNo: 'BV-021' },
      { name: 'TS. Phạm Thị Thúy Vân',    specialty: 'Sản phụ khoa',       title: 'Phó trưởng khoa',licenseNo: 'BV-022' },
      { name: 'ThS. Lê Ngọc Liên',        specialty: 'Sản phụ khoa',       title: 'Bác sĩ CKI',     licenseNo: 'BV-023' },
      { name: 'ThS. Đoàn Thị Kim Tuyền',  specialty: 'Sơ sinh',            title: 'Bác sĩ CKI',     licenseNo: 'BV-024' },
      { name: 'BS. Trần Thị Thanh Huyền', specialty: 'Sản phụ khoa',       title: 'Bác sĩ',          licenseNo: 'BV-025' },
      { name: 'BS. Võ Thị Mỹ Dung',       specialty: 'Sản phụ khoa',       title: 'Bác sĩ',          licenseNo: 'BV-026' },
      { name: 'BS. Huỳnh Thị Yến',        specialty: 'Sơ sinh',            title: 'Bác sĩ',          licenseNo: 'BV-027' },
      { name: 'BS. Nguyễn Thị Hoài Thu',  specialty: 'Sản phụ khoa',       title: 'Bác sĩ',          licenseNo: 'BV-028' },
      { name: 'BS. Bùi Thị Kim Ngân',     specialty: 'Sản phụ khoa',       title: 'Bác sĩ',          licenseNo: 'BV-029' },
      { name: 'BS. Cao Thị Diễm Hương',   specialty: 'Sơ sinh',            title: 'Bác sĩ',          licenseNo: 'BV-030' },
    ],
    'Khoa Nhi': [
      { name: 'TS. Lâm Văn Hùng',         specialty: 'Nhi tổng quát',      title: 'Trưởng khoa',    licenseNo: 'BV-031' },
      { name: 'ThS. Nguyễn Thị Bảo Châu', specialty: 'Nhi tim mạch',       title: 'Phó trưởng khoa',licenseNo: 'BV-032' },
      { name: 'ThS. Trần Văn Quân',       specialty: 'Nhi hô hấp',         title: 'Bác sĩ CKI',     licenseNo: 'BV-033' },
      { name: 'BS. Phạm Thị Ánh Tuyết',   specialty: 'Nhi tiêu hóa',       title: 'Bác sĩ',          licenseNo: 'BV-034' },
      { name: 'BS. Lê Đức Thịnh',         specialty: 'Nhi thần kinh',      title: 'Bác sĩ',          licenseNo: 'BV-035' },
      { name: 'BS. Ngô Thị Thanh Thảo',   specialty: 'Nhi tổng quát',      title: 'Bác sĩ',          licenseNo: 'BV-036' },
      { name: 'BS. Đinh Văn Khải',        specialty: 'Nhi hô hấp',         title: 'Bác sĩ',          licenseNo: 'BV-037' },
      { name: 'BS. Vương Thị Hạnh',       specialty: 'Nhi tim mạch',       title: 'Bác sĩ',          licenseNo: 'BV-038' },
      { name: 'BS. Lý Văn Đạt',           specialty: 'Nhi tiêu hóa',       title: 'Bác sĩ',          licenseNo: 'BV-039' },
      { name: 'BS. Trần Thị Thanh Loan',  specialty: 'Nhi tổng quát',      title: 'Bác sĩ',          licenseNo: 'BV-040' },
    ],
    'Khoa Cấp Cứu': [
      { name: 'TS. Đỗ Văn Kiên',          specialty: 'Cấp cứu hồi sức',   title: 'Trưởng khoa',    licenseNo: 'BV-041' },
      { name: 'ThS. Hoàng Thị Lan Anh',   specialty: 'Cấp cứu nội khoa',  title: 'Phó trưởng khoa',licenseNo: 'BV-042' },
      { name: 'ThS. Phan Văn Dũng',       specialty: 'Hồi sức tích cực',  title: 'Bác sĩ CKI',     licenseNo: 'BV-043' },
      { name: 'BS. Nguyễn Hữu Đạt',       specialty: 'Cấp cứu hồi sức',   title: 'Bác sĩ',          licenseNo: 'BV-044' },
      { name: 'BS. Lê Thị Kim Cúc',       specialty: 'Cấp cứu ngoại khoa',title: 'Bác sĩ',          licenseNo: 'BV-045' },
      { name: 'BS. Trương Văn Thi',       specialty: 'Hồi sức tích cực',  title: 'Bác sĩ',          licenseNo: 'BV-046' },
      { name: 'BS. Mai Thị Quỳnh Như',    specialty: 'Cấp cứu hồi sức',   title: 'Bác sĩ',          licenseNo: 'BV-047' },
      { name: 'BS. Dương Văn Lực',        specialty: 'Cấp cứu nội khoa',  title: 'Bác sĩ',          licenseNo: 'BV-048' },
      { name: 'BS. Bạch Thị Nguyệt',      specialty: 'Hồi sức tích cực',  title: 'Bác sĩ',          licenseNo: 'BV-049' },
      { name: 'BS. Đặng Minh Nghĩa',      specialty: 'Cấp cứu hồi sức',   title: 'Bác sĩ',          licenseNo: 'BV-050' },
    ],
    'Khoa Da Liễu - Thẩm Mỹ': [
      { name: 'PGS.TS. Vũ Thị Phương',    specialty: 'Da liễu thẩm mỹ',   title: 'Trưởng khoa',    licenseNo: 'BV-051' },
      { name: 'ThS. Châu Văn Sơn',        specialty: 'Da liễu lâm sàng',  title: 'Phó trưởng khoa',licenseNo: 'BV-052' },
      { name: 'ThS. Trần Ngọc Hân',       specialty: 'Da liễu thẩm mỹ',   title: 'Bác sĩ CKI',     licenseNo: 'BV-053' },
      { name: 'BS. Nguyễn Thị Quỳnh Mai', specialty: 'Da liễu lâm sàng',  title: 'Bác sĩ',          licenseNo: 'BV-054' },
      { name: 'BS. Lý Thị Mỹ Huyền',     specialty: 'Thẩm mỹ da',        title: 'Bác sĩ',          licenseNo: 'BV-055' },
      { name: 'BS. Hồ Văn Phúc',          specialty: 'Da liễu lâm sàng',  title: 'Bác sĩ',          licenseNo: 'BV-056' },
      { name: 'BS. Đinh Thị Như Ngọc',    specialty: 'Da liễu thẩm mỹ',   title: 'Bác sĩ',          licenseNo: 'BV-057' },
      { name: 'BS. Phan Thành Long',       specialty: 'Da liễu lâm sàng',  title: 'Bác sĩ',          licenseNo: 'BV-058' },
      { name: 'BS. Trương Thị Bảo Ngọc',  specialty: 'Thẩm mỹ da',        title: 'Bác sĩ',          licenseNo: 'BV-059' },
      { name: 'BS. Lê Hoàng Nam',         specialty: 'Da liễu thẩm mỹ',   title: 'Bác sĩ',          licenseNo: 'BV-060' },
    ],
    'Khoa Chẩn Đoán Hình Ảnh': [
      { name: 'TS. Nguyễn Văn Tâm',       specialty: 'Chẩn đoán hình ảnh',title: 'Trưởng khoa',    licenseNo: 'BV-061' },
      { name: 'ThS. Lê Thị Hồng Nhung',   specialty: 'Siêu âm can thiệp',  title: 'Phó trưởng khoa',licenseNo: 'BV-062' },
      { name: 'ThS. Phạm Văn Hải',        specialty: 'CT Scanner',          title: 'Bác sĩ CKI',     licenseNo: 'BV-063' },
      { name: 'BS. Trần Thanh Phong',      specialty: 'MRI',                 title: 'Bác sĩ',          licenseNo: 'BV-064' },
      { name: 'BS. Đỗ Thị Thu Trang',     specialty: 'Siêu âm',            title: 'Bác sĩ',          licenseNo: 'BV-065' },
      { name: 'BS. Hoàng Văn Kiệt',       specialty: 'X-Quang',            title: 'Bác sĩ',          licenseNo: 'BV-066' },
      { name: 'BS. Nguyễn Thị Phượng',    specialty: 'Chẩn đoán hình ảnh',title: 'Bác sĩ',          licenseNo: 'BV-067' },
      { name: 'BS. Võ Minh Đức',          specialty: 'CT Scanner',          title: 'Bác sĩ',          licenseNo: 'BV-068' },
      { name: 'BS. Lâm Thị Kim Loan',     specialty: 'Siêu âm',            title: 'Bác sĩ',          licenseNo: 'BV-069' },
      { name: 'BS. Bùi Văn Hướng',        specialty: 'MRI',                 title: 'Bác sĩ',          licenseNo: 'BV-070' },
    ],
    'Khoa Chấn Thương Chỉnh Hình': [
      { name: 'TS. Trần Đại Nghĩa',       specialty: 'Chấn thương chỉnh hình', title: 'Trưởng khoa', licenseNo: 'BV-071' },
      { name: 'ThS. Nguyễn Phước Lộc',    specialty: 'Phẫu thuật cột sống',title: 'Phó trưởng khoa',licenseNo: 'BV-072' },
      { name: 'ThS. Lê Văn Tú',           specialty: 'Chấn thương khớp',   title: 'Bác sĩ CKI',     licenseNo: 'BV-073' },
      { name: 'BS. Phạm Thị Nhung',       specialty: 'Chỉnh hình tay',     title: 'Bác sĩ',          licenseNo: 'BV-074' },
      { name: 'BS. Dương Quốc Toàn',      specialty: 'Chấn thương chỉnh hình',title: 'Bác sĩ',       licenseNo: 'BV-075' },
      { name: 'BS. Hồ Thị Ngân Hà',       specialty: 'Chấn thương khớp',   title: 'Bác sĩ',          licenseNo: 'BV-076' },
      { name: 'BS. Châu Văn Định',        specialty: 'Phẫu thuật cột sống',title: 'Bác sĩ',          licenseNo: 'BV-077' },
      { name: 'BS. Trương Thị Diệu',      specialty: 'Chỉnh hình chân',    title: 'Bác sĩ',          licenseNo: 'BV-078' },
      { name: 'BS. Đinh Văn Nghĩa',       specialty: 'Chấn thương chỉnh hình',title: 'Bác sĩ',       licenseNo: 'BV-079' },
      { name: 'BS. Vương Minh Tuấn',      specialty: 'Chấn thương khớp',   title: 'Bác sĩ',          licenseNo: 'BV-080' },
    ],
    'Khoa Cơ Xương Khớp': [
      { name: 'PGS.TS. Huỳnh Ngọc Bảo',  specialty: 'Cơ xương khớp',     title: 'Trưởng khoa',    licenseNo: 'BV-081' },
      { name: 'TS. Trần Thị Cẩm Giang',  specialty: 'Thấp khớp',          title: 'Phó trưởng khoa',licenseNo: 'BV-082' },
      { name: 'ThS. Lê Hoàng Phong',      specialty: 'Loãng xương',         title: 'Bác sĩ CKI',     licenseNo: 'BV-083' },
      { name: 'BS. Nguyễn Thị Hạnh Dung', specialty: 'Cơ xương khớp',     title: 'Bác sĩ',          licenseNo: 'BV-084' },
      { name: 'BS. Đặng Văn Phúc',        specialty: 'Thấp khớp',          title: 'Bác sĩ',          licenseNo: 'BV-085' },
      { name: 'BS. Phan Thị Thu Thủy',    specialty: 'Cơ xương khớp',     title: 'Bác sĩ',          licenseNo: 'BV-086' },
      { name: 'BS. Bùi Minh Khoa',        specialty: 'Loãng xương',         title: 'Bác sĩ',          licenseNo: 'BV-087' },
      { name: 'BS. Võ Thị Minh Tâm',     specialty: 'Cơ xương khớp',     title: 'Bác sĩ',          licenseNo: 'BV-088' },
      { name: 'BS. Hà Văn Vinh',          specialty: 'Thấp khớp',          title: 'Bác sĩ',          licenseNo: 'BV-089' },
      { name: 'BS. Lý Thị Minh Châu',    specialty: 'Cơ xương khớp',     title: 'Bác sĩ',          licenseNo: 'BV-090' },
    ],
    'Khoa Tâm Thần': [
      { name: 'TS. Ngô Thị Thanh Bình',   specialty: 'Tâm thần học',       title: 'Trưởng khoa',    licenseNo: 'BV-091' },
      { name: 'ThS. Phạm Quang Vinh',     specialty: 'Tâm lý trị liệu',    title: 'Phó trưởng khoa',licenseNo: 'BV-092' },
      { name: 'ThS. Lưu Thị Ánh Nguyệt',  specialty: 'Tâm thần nhi',       title: 'Bác sĩ CKI',     licenseNo: 'BV-093' },
      { name: 'BS. Trần Nguyễn Bảo Trâm', specialty: 'Tâm thần học',       title: 'Bác sĩ',          licenseNo: 'BV-094' },
      { name: 'BS. Nguyễn Hồng Phong',    specialty: 'Tâm lý trị liệu',    title: 'Bác sĩ',          licenseNo: 'BV-095' },
      { name: 'BS. Đoàn Thị Bích Ngọc',   specialty: 'Tâm thần học',       title: 'Bác sĩ',          licenseNo: 'BV-096' },
      { name: 'BS. Cao Văn Thắng',         specialty: 'Tâm thần nhi',       title: 'Bác sĩ',          licenseNo: 'BV-097' },
      { name: 'BS. Vũ Thị Thanh Ngân',    specialty: 'Tâm lý trị liệu',    title: 'Bác sĩ',          licenseNo: 'BV-098' },
      { name: 'BS. Lê Quốc Thịnh',        specialty: 'Tâm thần học',       title: 'Bác sĩ',          licenseNo: 'BV-099' },
      { name: 'BS. Trương Văn An',         specialty: 'Tâm thần học',       title: 'Bác sĩ',          licenseNo: 'BV-100' },
    ],
    'Khoa Điện Não': [
      { name: 'TS. Nguyễn Thế Anh',       specialty: 'Thần kinh điện não', title: 'Trưởng khoa',    licenseNo: 'BV-101' },
      { name: 'ThS. Phạm Thị Oanh',       specialty: 'Điện não đồ',        title: 'Phó trưởng khoa',licenseNo: 'BV-102' },
      { name: 'BS. Lê Văn Hiếu',          specialty: 'Thần kinh',          title: 'Bác sĩ CKI',     licenseNo: 'BV-103' },
      { name: 'BS. Trần Thị Ngọc Hà',     specialty: 'Điện não đồ',        title: 'Bác sĩ',          licenseNo: 'BV-104' },
      { name: 'BS. Hoàng Minh Dũng',       specialty: 'Thần kinh điện não', title: 'Bác sĩ',          licenseNo: 'BV-105' },
      { name: 'BS. Võ Thị Hồng Liên',     specialty: 'Điện não đồ',        title: 'Bác sĩ',          licenseNo: 'BV-106' },
      { name: 'BS. Đặng Quang Khải',      specialty: 'Thần kinh',          title: 'Bác sĩ',          licenseNo: 'BV-107' },
      { name: 'BS. Ngô Thị Ngọc Trâm',    specialty: 'Thần kinh điện não', title: 'Bác sĩ',          licenseNo: 'BV-108' },
    ],
  };

  // ── 5. Y tá theo từng khoa ────────────────────────────────────────────────────
  const nursesByDept: Record<string, { name: string; position: string }[]> = {
    'Khoa Nội': [
      { name: 'CN. Nguyễn Thị Thùy Dung',  position: 'Điều dưỡng trưởng' },
      { name: 'CN. Lê Thị Bích Hằng',      position: 'Điều dưỡng phó' },
      { name: 'CN. Phạm Thị Ngọc Hoa',     position: 'Điều dưỡng CKI' },
      { name: 'CN. Trần Thị Thanh Vân',    position: 'Điều dưỡng' },
      { name: 'CN. Vũ Thị Minh Thư',       position: 'Điều dưỡng' },
      { name: 'CN. Đặng Thị Hoa',           position: 'Y tá' },
      { name: 'CN. Hoàng Thị Yến',          position: 'Y tá' },
      { name: 'CN. Lý Thị Bích Phượng',    position: 'Y tá' },
      { name: 'CN. Bùi Thị Ngọc Linh',     position: 'Y tá' },
      { name: 'CN. Cao Thị Ánh Tuyết',     position: 'Y tá' },
      { name: 'CN. Dương Thị Mỹ Duyên',   position: 'Hộ lý' },
    ],
    'Khoa Ngoại': [
      { name: 'CN. Trần Thị Kim Phụng',    position: 'Điều dưỡng trưởng' },
      { name: 'CN. Nguyễn Thị Thanh Mai',  position: 'Điều dưỡng phó' },
      { name: 'CN. Lê Thị Hồng Hoa',      position: 'Điều dưỡng CKI' },
      { name: 'CN. Phạm Thị Diệu Linh',   position: 'Điều dưỡng' },
      { name: 'CN. Đinh Thị Ánh Nguyệt',  position: 'Điều dưỡng' },
      { name: 'CN. Võ Thị Bảo Châu',       position: 'Y tá' },
      { name: 'CN. Hồ Thị Mỹ Linh',       position: 'Y tá' },
      { name: 'CN. Đoàn Thị Thảo',         position: 'Y tá' },
      { name: 'CN. Phan Thị Hạnh Nguyên',  position: 'Y tá' },
      { name: 'CN. Châu Thị Ngọc Bảo',    position: 'Y tá' },
      { name: 'CN. Lưu Thị Kim Quyên',    position: 'Hộ lý' },
    ],
    'Khoa Sản': [
      { name: 'CN. Nguyễn Thị Phương Thảo',position: 'Điều dưỡng trưởng' },
      { name: 'CN. Trần Thị Ngọc Trân',   position: 'Điều dưỡng phó' },
      { name: 'CN. Lê Thị Thanh Hương',   position: 'Điều dưỡng CKI' },
      { name: 'CN. Phạm Thị Tố Uyên',     position: 'Điều dưỡng' },
      { name: 'CN. Đỗ Thị Thanh Thúy',   position: 'Điều dưỡng' },
      { name: 'CN. Huỳnh Thị Lệ Quyên',  position: 'Y tá' },
      { name: 'CN. Bùi Thị Xuân Lan',     position: 'Y tá' },
      { name: 'CN. Mai Thị Ngọc Hiền',    position: 'Y tá' },
      { name: 'CN. Cao Thị Mỹ Phụng',    position: 'Y tá' },
      { name: 'CN. Dương Thị Hồng Vân',  position: 'Hộ lý' },
    ],
    'Khoa Nhi': [
      { name: 'CN. Trần Thị Thanh Thủy',  position: 'Điều dưỡng trưởng' },
      { name: 'CN. Lê Thị Kim Chi',       position: 'Điều dưỡng phó' },
      { name: 'CN. Nguyễn Thị Bảo Trân',  position: 'Điều dưỡng CKI' },
      { name: 'CN. Phạm Thị Lan Anh',     position: 'Điều dưỡng' },
      { name: 'CN. Võ Thị Thùy Linh',    position: 'Điều dưỡng' },
      { name: 'CN. Hồ Thị Tú Anh',       position: 'Y tá' },
      { name: 'CN. Đặng Thị Bảo Ngọc',   position: 'Y tá' },
      { name: 'CN. Lý Thị Kim Hoa',       position: 'Y tá' },
      { name: 'CN. Huỳnh Thị Như Ý',     position: 'Y tá' },
      { name: 'CN. Châu Thị Ngọc Huyền', position: 'Hộ lý' },
    ],
    'Khoa Cấp Cứu': [
      { name: 'CN. Bùi Thị Thanh Loan',   position: 'Điều dưỡng trưởng' },
      { name: 'CN. Nguyễn Văn Tuấn',      position: 'Điều dưỡng phó' },
      { name: 'CN. Trần Thị Ngọc Bảo',    position: 'Điều dưỡng CKI' },
      { name: 'CN. Lê Văn Thịnh',         position: 'Điều dưỡng' },
      { name: 'CN. Phạm Thị Thu Hà',      position: 'Điều dưỡng' },
      { name: 'CN. Đỗ Văn Đức',           position: 'Y tá' },
      { name: 'CN. Hoàng Thị Mỹ Duyên',  position: 'Y tá' },
      { name: 'CN. Đinh Thị Thu Sương',   position: 'Y tá' },
      { name: 'CN. Vũ Văn Kiên',          position: 'Y tá' },
      { name: 'CN. Trương Thị Hồng Hà',  position: 'Y tá' },
      { name: 'CN. Lưu Thị Bích Liên',   position: 'Hộ lý' },
    ],
    'Khoa Da Liễu - Thẩm Mỹ': [
      { name: 'CN. Nguyễn Thị Cẩm Nhung', position: 'Điều dưỡng trưởng' },
      { name: 'CN. Lê Thị Phú Quý',       position: 'Điều dưỡng phó' },
      { name: 'CN. Trần Thị Hồng Ân',    position: 'Điều dưỡng' },
      { name: 'CN. Phạm Ngọc Trâm',       position: 'Điều dưỡng' },
      { name: 'CN. Võ Thị Thu Trang',     position: 'Y tá' },
      { name: 'CN. Đặng Thị Mỹ Trinh',   position: 'Y tá' },
      { name: 'CN. Hồ Thị Diệu Hiền',    position: 'Y tá' },
      { name: 'CN. Bùi Thị Kiều Trang',  position: 'Y tá' },
      { name: 'CN. Lý Thị Ngọc Anh',     position: 'Y tá' },
      { name: 'CN. Cao Thị Bảo Nhi',     position: 'Hộ lý' },
    ],
    'Khoa Chẩn Đoán Hình Ảnh': [
      { name: 'CN. Trần Thị Kim Cương',   position: 'Kỹ thuật viên trưởng' },
      { name: 'CN. Nguyễn Thị Xuân Thu',  position: 'Kỹ thuật viên' },
      { name: 'CN. Lê Văn Thành',         position: 'Kỹ thuật viên' },
      { name: 'CN. Phạm Thị Diệu Huyền',  position: 'Kỹ thuật viên' },
      { name: 'CN. Đỗ Thị Kim Anh',       position: 'Kỹ thuật viên' },
      { name: 'CN. Hoàng Văn Phong',      position: 'Điều dưỡng' },
      { name: 'CN. Võ Thị Thanh Tuyền',  position: 'Điều dưỡng' },
      { name: 'CN. Trương Thị Bảo Trân',  position: 'Điều dưỡng' },
      { name: 'CN. Lưu Văn Hùng',         position: 'Kỹ thuật viên' },
      { name: 'CN. Đặng Thị Kim Phương',  position: 'Điều dưỡng' },
    ],
    'Khoa Chấn Thương Chỉnh Hình': [
      { name: 'CN. Nguyễn Thị Trúc Linh', position: 'Điều dưỡng trưởng' },
      { name: 'CN. Trần Văn Bình',         position: 'Điều dưỡng phó' },
      { name: 'CN. Lê Thị Như Quỳnh',    position: 'Điều dưỡng CKI' },
      { name: 'CN. Phạm Thị Tuyết Mai',   position: 'Điều dưỡng' },
      { name: 'CN. Đỗ Văn Hùng',          position: 'Điều dưỡng' },
      { name: 'CN. Võ Thị Thu Hương',     position: 'Y tá' },
      { name: 'CN. Hoàng Thị Nhung',      position: 'Y tá' },
      { name: 'CN. Đinh Thị Ngọc Tuyền',  position: 'Y tá' },
      { name: 'CN. Bùi Văn Tài',          position: 'Y tá' },
      { name: 'CN. Lý Thị Phương Trinh',  position: 'Hộ lý' },
    ],
    'Khoa Cơ Xương Khớp': [
      { name: 'CN. Trần Thị Ánh Hồng',    position: 'Điều dưỡng trưởng' },
      { name: 'CN. Nguyễn Văn Minh',      position: 'Điều dưỡng phó' },
      { name: 'CN. Lê Thị Mỹ Lan',       position: 'Điều dưỡng CKI' },
      { name: 'CN. Phạm Văn Khoa',        position: 'Điều dưỡng' },
      { name: 'CN. Đặng Thị Oanh',        position: 'Điều dưỡng' },
      { name: 'CN. Hồ Thị Kim Ngân',      position: 'Y tá' },
      { name: 'CN. Vũ Thị Diễm',         position: 'Y tá' },
      { name: 'CN. Châu Văn Lợi',         position: 'Y tá' },
      { name: 'CN. Đoàn Thị Thùy Trang',  position: 'Y tá' },
      { name: 'CN. Bùi Thị Ngân Hà',     position: 'Hộ lý' },
    ],
    'Khoa Tâm Thần': [
      { name: 'CN. Nguyễn Thị Hải Yến',  position: 'Điều dưỡng trưởng' },
      { name: 'CN. Lê Thị Bảo Châu',     position: 'Điều dưỡng phó' },
      { name: 'CN. Trần Thị Kim Ngân',    position: 'Điều dưỡng' },
      { name: 'CN. Phạm Thị Thu Nguyệt', position: 'Điều dưỡng' },
      { name: 'CN. Đỗ Thị Hoài Thu',     position: 'Y tá' },
      { name: 'CN. Hoàng Văn Phúc',      position: 'Y tá' },
      { name: 'CN. Võ Thị Ngọc Mai',     position: 'Y tá' },
      { name: 'CN. Đinh Thị Thanh Hà',   position: 'Y tá' },
      { name: 'CN. Lý Thị Như Hoa',      position: 'Y tá' },
      { name: 'CN. Bùi Thị Thúy An',     position: 'Hộ lý' },
    ],
    'Khoa Điện Não': [
      { name: 'CN. Trần Thị Ngọc Điểm',  position: 'Kỹ thuật viên trưởng' },
      { name: 'CN. Nguyễn Thị Cẩm Tú',   position: 'Kỹ thuật viên' },
      { name: 'CN. Lê Văn Dũng',          position: 'Kỹ thuật viên' },
      { name: 'CN. Phạm Thị Kim Phụng',  position: 'Kỹ thuật viên' },
      { name: 'CN. Đặng Văn Tú',          position: 'Điều dưỡng' },
      { name: 'CN. Hồ Thị Bích Loan',    position: 'Điều dưỡng' },
      { name: 'CN. Vũ Thị Thu Hương',    position: 'Điều dưỡng' },
      { name: 'CN. Châu Thị Hồng Hạnh',  position: 'Y tá' },
    ],
  };

  // ── 6. Tạo bác sĩ ────────────────────────────────────────────────────────────
  let totalDoctors = 0;
  for (const [deptName, doctorList] of Object.entries(doctorsByDept)) {
    const deptId = deptMap[deptName];
    if (!deptId) {
      console.log(`⚠️  Bỏ qua ${deptName} (không tìm thấy trong DB)`);
      continue;
    }
    console.log(`\n   Khoa: ${deptName} — ${doctorList.length} bác sĩ`);
    for (const doc of doctorList) {
      const email = toEmail(doc.name) + '@bvhungloi.vn';
      const user = await prisma.user.upsert({
        where: { email },
        update: { password: PASS_DOCTOR, role: 'DOCTOR', name: doc.name, phone: randomPhone() },
        create: {
          email,
          password: PASS_DOCTOR,
          name: doc.name,
          role: 'DOCTOR',
          phone: randomPhone(),
          address: 'TP. Hồ Chí Minh',
          gender: doc.name.includes('Thị') || doc.name.includes('Bích') || doc.name.includes('Oanh') ? 'FEMALE' : 'MALE',
        }
      });
      await prisma.doctor.upsert({
        where: { userId: user.id },
        update: { specialty: doc.specialty, licenseNo: doc.licenseNo, departmentId: deptId, consultationFee: 150000, bio: `${doc.title} - ${doc.specialty}. Phụ trách ${deptName}.` },
        create: {
          specialty: doc.specialty,
          licenseNo: doc.licenseNo,
          departmentId: deptId,
          userId: user.id,
          consultationFee: 150000,
          bio: `${doc.title} - ${doc.specialty}. Phụ trách ${deptName}.`
        }
      });
      totalDoctors++;
      process.stdout.write('.');
    }
  }
  console.log(`\n\n✅ Đã tạo ${totalDoctors} bác sĩ`);

  // ── 7. Tạo y tá ───────────────────────────────────────────────────────────────
  let totalNurses = 0;
  for (const [deptName, nurseList] of Object.entries(nursesByDept)) {
    const deptId = deptMap[deptName];
    if (!deptId) continue;
    for (const nurse of nurseList) {
      const email = toEmail(nurse.name) + '@bvhungloi.vn';
      const user = await prisma.user.upsert({
        where: { email },
        update: { password: PASS_NURSE, role: 'NURSE', name: nurse.name, phone: randomPhone() },
        create: {
          email,
          password: PASS_NURSE,
          name: nurse.name,
          role: 'NURSE',
          phone: randomPhone(),
          address: 'TP. Hồ Chí Minh',
          gender: 'FEMALE',
        }
      });
      await prisma.nurse.upsert({
        where: { userId: user.id },
        update: { position: nurse.position, departmentId: deptId },
        create: { position: nurse.position, departmentId: deptId, userId: user.id }
      });
      totalNurses++;
      process.stdout.write('.');
    }
  }
  console.log(`\n✅ Đã tạo ${totalNurses} y tá\n`);

  // ── 8. Nhân sự các phòng ban ──────────────────────────────────────────────────
  console.log('🏢 Tạo nhân sự các phòng ban...');

  const officeStaff = [
    // Phòng Kế toán
    { name: 'Nguyễn Văn Thắng',    email: 'nguyenvanthang.kt@bvhungloi.vn',   role: 'ACCOUNTANT', pass: PASS_ACCOUNT, title: 'Kế toán trưởng',       phone: randomPhone() },
    { name: 'Trần Thị Minh Nguyệt',email: 'tranthiminhnguyetkt@bvhungloi.vn', role: 'ACCOUNTANT', pass: PASS_ACCOUNT, title: 'Kế toán phó',           phone: randomPhone() },
    { name: 'Lê Thị Thu Hằng',     email: 'lethithuhang.kt@bvhungloi.vn',     role: 'ACCOUNTANT', pass: PASS_ACCOUNT, title: 'Kế toán ngân sách',     phone: randomPhone() },
    { name: 'Phạm Văn Long',        email: 'phamvanlong.kt@bvhungloi.vn',       role: 'ACCOUNTANT', pass: PASS_ACCOUNT, title: 'Kế toán chi phí',       phone: randomPhone() },
    { name: 'Đỗ Thị Bảo Ngọc',    email: 'dothibaongoc.kt@bvhungloi.vn',      role: 'ACCOUNTANT', pass: PASS_ACCOUNT, title: 'Kế toán BHYT',          phone: randomPhone() },
    // Phòng CNTT
    { name: 'Hoàng Đức Minh',      email: 'hoangducminh.it@bvhungloi.vn',     role: 'STAFF', pass: PASS_STAFF, title: 'Trưởng phòng CNTT',    phone: randomPhone() },
    { name: 'Vũ Văn Hùng',         email: 'vuvanhung.it@bvhungloi.vn',         role: 'STAFF', pass: PASS_STAFF, title: 'Kỹ sư phần mềm',       phone: randomPhone() },
    { name: 'Lý Thanh Hải',        email: 'lythanhhai.it@bvhungloi.vn',        role: 'STAFF', pass: PASS_STAFF, title: 'Kỹ sư hệ thống',       phone: randomPhone() },
    { name: 'Đặng Thị Ngọc Ánh',   email: 'dangthingocanh.it@bvhungloi.vn',   role: 'STAFF', pass: PASS_STAFF, title: 'Kỹ sư mạng',            phone: randomPhone() },
    { name: 'Trần Văn Khoa',        email: 'tranvankhoa.it@bvhungloi.vn',       role: 'STAFF', pass: PASS_STAFF, title: 'Kỹ sư bảo mật',        phone: randomPhone() },
    // Phòng Nhân sự
    { name: 'Nguyễn Thị Hồng Vân', email: 'nguyenthihongvan.hr@bvhungloi.vn', role: 'STAFF', pass: PASS_STAFF, title: 'Trưởng phòng Nhân sự',  phone: randomPhone() },
    { name: 'Lê Văn Toàn',         email: 'levantoan.hr@bvhungloi.vn',         role: 'STAFF', pass: PASS_STAFF, title: 'Chuyên viên nhân sự',   phone: randomPhone() },
    { name: 'Phạm Thị Thu Thảo',   email: 'phamthithuthao.hr@bvhungloi.vn',   role: 'STAFF', pass: PASS_STAFF, title: 'Chuyên viên đào tạo',   phone: randomPhone() },
    // Phòng Hành chính
    { name: 'Bùi Thị Lan Anh',     email: 'buithilananh.hc@bvhungloi.vn',     role: 'STAFF', pass: PASS_STAFF, title: 'Chánh văn phòng',       phone: randomPhone() },
    { name: 'Đinh Văn Tú',          email: 'dinhvantu.hc@bvhungloi.vn',         role: 'STAFF', pass: PASS_STAFF, title: 'Hành chính tổng hợp',   phone: randomPhone() },
    // Phòng Dược
    { name: 'TS. Nguyễn Thị Bảo Dung', email: 'nguyenthibaodung.duoc@bvhungloi.vn', role: 'PHARMACIST', pass: PASS_STAFF, title: 'Trưởng khoa Dược', phone: randomPhone() },
    { name: 'ThS. Lê Văn Trung',    email: 'levantrung.duoc@bvhungloi.vn',     role: 'PHARMACIST', pass: PASS_STAFF, title: 'Dược sĩ',              phone: randomPhone() },
    { name: 'ThS. Trần Thị Hoa Mai',email: 'tranthiboamai.duoc@bvhungloi.vn',  role: 'PHARMACIST', pass: PASS_STAFF, title: 'Dược sĩ',              phone: randomPhone() },
    { name: 'DS. Phạm Thị Kim Tuyền',email: 'phamthikimtuyen.duoc@bvhungloi.vn',role: 'PHARMACIST', pass: PASS_STAFF,title: 'Dược sĩ pha chế',    phone: randomPhone() },
    // Phòng Xét nghiệm
    { name: 'TS. Hoàng Văn Tú',     email: 'hoangvantu.xn@bvhungloi.vn',       role: 'STAFF', pass: PASS_STAFF, title: 'Trưởng khoa Xét nghiệm',phone: randomPhone() },
    { name: 'ThS. Trần Thị Ngọc Bích',email: 'tranthingocbich.xn@bvhungloi.vn',role: 'STAFF', pass: PASS_STAFF,title: 'Kỹ thuật viên',         phone: randomPhone() },
    { name: 'CN. Lê Thị Phương Chi',email: 'lethiphuongchi.xn@bvhungloi.vn',   role: 'STAFF', pass: PASS_STAFF, title: 'Kỹ thuật viên',          phone: randomPhone() },
    // Phòng Lễ tân
    { name: 'Nguyễn Thị Hà My',    email: 'nguyenthihamy.lt@bvhungloi.vn',    role: 'STAFF', pass: PASS_STAFF, title: 'Trưởng bộ phận lễ tân', phone: randomPhone() },
    { name: 'Trần Thị Diễm My',    email: 'tranthidiemmy.lt@bvhungloi.vn',    role: 'STAFF', pass: PASS_STAFF, title: 'Nhân viên lễ tân',       phone: randomPhone() },
    { name: 'Phạm Thị Kim Ngân',   email: 'phamthikimngan.lt@bvhungloi.vn',   role: 'STAFF', pass: PASS_STAFF, title: 'Nhân viên lễ tân',       phone: randomPhone() },
  ];

  for (const staff of officeStaff) {
    await prisma.user.upsert({
      where: { email: staff.email },
      update: { password: staff.pass, role: staff.role, name: staff.name, phone: staff.phone },
      create: {
        email: staff.email,
        password: staff.pass,
        name: staff.name,
        role: staff.role,
        phone: staff.phone,
        address: 'TP. Hồ Chí Minh',
      }
    });
    process.stdout.write('.');
  }
  console.log(`\n✅ Đã tạo ${officeStaff.length} nhân sự phòng ban\n`);

  // ── 9. Tổng kết ───────────────────────────────────────────────────────────────
  const total = await prisma.user.count({ where: { role: { not: 'PATIENT' } } });
  console.log('═══════════════════════════════════════════════');
  console.log('✅ HOÀN TẤT! Tổng kết nhân sự bệnh viện:');
  console.log(`   👔 Ban giám đốc: ${directors.length} người`);
  console.log(`   👨‍⚕️ Bác sĩ: ${totalDoctors} người`);
  console.log(`   👩‍⚕️ Y tá/Điều dưỡng: ${totalNurses} người`);
  console.log(`   🏢 Nhân sự phòng ban: ${officeStaff.length} người`);
  console.log(`   📊 Tổng nhân sự (không tính bệnh nhân): ${total}`);
  console.log('═══════════════════════════════════════════════\n');
  console.log('🔑 Mật khẩu:');
  console.log('   Giám đốc: giamdoc123');
  console.log('   Bác sĩ: bacsi123');
  console.log('   Y tá: yta123');
  console.log('   Nhân sự/Kế toán: nhansu123/ketoan123');
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function randomPhone(): string {
  const prefixes = ['0901', '0903', '0905', '0907', '0908', '0909', '0912', '0913', '0938', '0939'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = Math.floor(100000 + Math.random() * 900000).toString();
  return prefix + suffix;
}

function toEmail(fullName: string): string {
  // Remove titles: GS.TS., PGS.TS., TS., ThS., BS., CN., DS.
  let name = fullName.replace(/^(GS\.TS\.|PGS\.TS\.|TS\.|ThS\.|BS\.|CN\.|DS\.|PGS\.)\s+/i, '');
  const parts = name.trim().toLowerCase().split(/\s+/);
  const firstName = parts[parts.length - 1];
  const middleNames = parts.slice(0, -1).map(p => p[0]).join('');
  return (firstName + middleNames)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .replace(/[^a-z0-9]/gi, '');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
