import { prisma } from '../src/lib/prisma.ts';
import bcrypt from 'bcryptjs';

// ===================== HELPER: NAME GENERATION =====================
const surNames = [
  'Nguyen', 'Tran', 'Le', 'Pham', 'Hoang', 'Phan', 'Vu', 'Dang',
  'Bui', 'Do', 'Ho', 'Ngo', 'Duong', 'Ly', 'Dinh', 'To',
  'Trinh', 'Cao', 'Lam', 'Tang', 'Ha', 'Chau', 'Mai', 'Tu',
];
const surNamesVN = [
  'Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Phan', 'Vũ', 'Đặng',
  'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý', 'Đinh', 'Tô',
  'Trịnh', 'Cao', 'Lâm', 'Tăng', 'Hà', 'Châu', 'Mai', 'Từ',
];
const midMale   = ['Văn', 'Hữu', 'Quốc', 'Minh', 'Đức', 'Thành', 'Xuân', 'Anh', 'Trọng', 'Thanh'];
const midFemale = ['Thị', 'Ngọc', 'Thu', 'Thúy', 'Kim', 'Bích', 'Mỹ'];
const givenMale = [
  'An', 'Bình', 'Cường', 'Dũng', 'Đạt', 'Hùng', 'Khoa', 'Long', 'Mạnh', 'Nam',
  'Phong', 'Quân', 'Sơn', 'Thắng', 'Tuấn', 'Vinh', 'Hải', 'Thịnh', 'Tài', 'Trí',
  'Tâm', 'Khải', 'Lộc', 'Phúc', 'Quý', 'Thọ', 'Tiến', 'Dương', 'Hiếu', 'Khánh',
];
const givenFemale = [
  'Anh', 'Chi', 'Dung', 'Hà', 'Hương', 'Lan', 'Linh', 'Mai', 'Nga', 'Nhung',
  'Thảo', 'Thu', 'Trang', 'Uyên', 'Yến', 'Hạnh', 'Phương', 'Nhi', 'Vân', 'Thanh',
  'Châu', 'Diễm', 'Hiền', 'Loan', 'Phượng',
];

function genName(idx: number, female = false): string {
  const s = surNamesVN[idx % surNamesVN.length];
  if (female) {
    const m = midFemale[Math.floor(idx / surNamesVN.length) % midFemale.length];
    const g = givenFemale[Math.floor(idx / (surNamesVN.length * midFemale.length)) % givenFemale.length];
    return `${s} ${m} ${g}`;
  }
  const m = midMale[Math.floor(idx / surNamesVN.length) % midMale.length];
  const g = givenMale[Math.floor(idx / (surNamesVN.length * midMale.length)) % givenMale.length];
  return `${s} ${m} ${g}`;
}

type DoctorSlot = { title: string; position: string; fee: number };

function getDoctorSlot(posInDept: number, deptIdx: number): DoctorSlot {
  if (posInDept === 0) {
    const t = deptIdx % 3 === 0 ? 'GS.TS.BS' : deptIdx % 3 === 1 ? 'PGS.TS.BS' : 'TS.BSCKII';
    return { title: t, position: 'Trưởng khoa', fee: t.startsWith('GS') ? 500000 : 400000 };
  }
  if (posInDept === 1) {
    const t = deptIdx % 2 === 0 ? 'PGS.TS.BS' : 'TS.BSCKII';
    return { title: t, position: 'Phó trưởng khoa', fee: 350000 };
  }
  if (posInDept === 2) return { title: 'TS.BS', position: 'Phó trưởng khoa', fee: 300000 };
  if (posInDept <= 4)  return { title: 'TS.BS', position: '', fee: 280000 };
  if (posInDept <= 8)  return { title: 'BSCKII', position: '', fee: 250000 };
  if (posInDept <= 18) return { title: 'BSCKI', position: '', fee: 200000 };
  const t = posInDept % 2 === 0 ? 'ThS.BS' : 'BS';
  return { title: t, position: '', fee: t === 'ThS.BS' ? 180000 : 150000 };
}

async function main() {
  console.log('Starting seed...');
  const hashedPwd = await bcrypt.hash('Hospital@2024', 10);

  const allDepts = [
    'Khoa Khám bệnh','Khoa Khám theo yêu cầu / VIP / Chuyên gia',
    'Khoa Cấp cứu & Chống độc','Khoa Cấp cứu lưu',
    'Khoa Nội tổng hợp','Khoa Nội Tim mạch & Can thiệp mạch',
    'Khoa Nội Tiêu hóa - Gan mật','Khoa Nội Tiết',
    'Khoa Thận nhân tạo','Khoa Thận - Tiết niệu','Khoa Hô hấp',
    'Khoa Cơ - Xương - Khớp','Khoa Thần kinh & Đơn vị Đột quỵ',
    'Khoa Bệnh Nhiệt đới & Truyền nhiễm',
    'Khoa Y học cổ truyền & Phục hồi chức năng',
    'Khoa Lão khoa & Chăm sóc giảm nhẹ','Khoa Ngoại tổng hợp',
    'Khoa Ngoại Gan - Mật - Tụy','Khoa Ngoại Thần kinh',
    'Khoa Ngoại Lồng ngực - Mạch máu','Khoa Ngoại Tiết niệu',
    'Khoa Chấn thương chỉnh hình','Khoa Bỏng & Tạo hình thẩm mỹ',
    'Khoa Phẫu thuật - Gây mê hồi sức','Khoa Hồi sức tích cực (ICU)',
    'Khoa Ung bướu & Xạ trị','Khoa Phụ sản','Khoa Nhi & Sơ sinh (NICU)',
    'Khoa Mắt','Khoa Tai - Mũi - Họng','Khoa Răng - Hàm - Mặt',
    'Khoa Da liễu','Khoa Y học hạt nhân','Khoa Xét nghiệm',
    'Khoa Giải phẫu bệnh','Khoa Chẩn đoán hình ảnh',
    'Khoa Nội soi & Thăm dò chức năng','Khoa Huyết học truyền máu',
    'Đơn nguyên Ghép tạng','Khoa Dược','Khoa Kiểm soát nhiễm khuẩn',
    'Khoa Dinh dưỡng - Tiết chế','Phòng Kế hoạch Tổng hợp',
    'Phòng Tài chính - Kế toán','Phòng Tổ chức Cán bộ',
    'Phòng Vật tư - Thiết bị y tế','Phòng Điều dưỡng',
    'Phòng Công nghệ thông tin',
    'Phòng Quản lý chất lượng & Chăm sóc khách hàng',
    'Trung tâm Đào tạo & Chỉ đạo tuyến',
  ];

  const deptMap: Record<string, string> = {};
  for (const name of allDepts) {
    const dept = await prisma.department.create({ data: { name } });
    deptMap[name] = dept.id;
  }
  console.log(`Created ${allDepts.length} departments`);

  const medicalDepts = allDepts.filter(d => !d.startsWith('Phong') && !d.startsWith('Trung tam') && !d.startsWith('Phòng') && !d.startsWith('Trung tâm'));

  // Director
  const dirUser = await prisma.user.create({
    data: { email: 'director@bvhungloi.vn', password: hashedPwd, name: 'Trịnh Hưng Lợi', role: 'ADMIN', phone: '0901000000' },
  });
  await prisma.doctor.create({
    data: { userId: dirUser.id, specialty: 'Quản lý Y tế - Nội khoa', departmentId: deptMap['Khoa Khám bệnh'], consultationFee: 600000, licenseNo: 'GS-001', bio: 'GS.TS. Giám đốc Bệnh viện Đa khoa Hưng Lợi' },
  });
  console.log('Created director');

  let docIdx = 0;
  for (let di = 0; di < medicalDepts.length; di++) {
    const deptName = medicalDepts[di];
    const deptId = deptMap[deptName];
    const specialty = deptName.replace(/^Khoa\s+/, '').replace(/^Đơn nguyên\s+/, '');
    for (let pos = 0; pos < 30; pos++) {
      const isFemale = docIdx % 3 === 0;
      const baseName = genName(docIdx, isFemale);
      const slot = getDoctorSlot(pos, di);
      const u = await prisma.user.create({
        data: { email: `doc${docIdx + 1}@bvhungloi.vn`, password: hashedPwd, name: `${slot.title}. ${baseName}`, role: 'DOCTOR', phone: `09${String(10000000 + docIdx).slice(-8)}` },
      });
      await prisma.doctor.create({
        data: { userId: u.id, specialty, departmentId: deptId, consultationFee: slot.fee, licenseNo: `BS-${String(docIdx + 2).padStart(5, '0')}`, bio: slot.position ? `${slot.title}. ${slot.position} ${deptName}` : `${slot.title}. Bác sĩ ${specialty}` },
      });
      docIdx++;
    }
    if ((di + 1) % 5 === 0) console.log(`  Doctors: done ${di + 1}/${medicalDepts.length} depts`);
  }
  console.log(`Created ${docIdx} doctors`);

  let nurseIdx = 0;
  for (let di = 0; di < medicalDepts.length; di++) {
    const deptName = medicalDepts[di];
    const deptId = deptMap[deptName];
    for (let pos = 0; pos < 40; pos++) {
      let position = 'Điều dưỡng';
      if (pos === 0) position = 'Điều dưỡng trưởng';
      else if (pos <= 2) position = 'Điều dưỡng phó';
      const isFemale = nurseIdx % 4 !== 0;
      const u = await prisma.user.create({
        data: { email: `nurse${nurseIdx + 1}@bvhungloi.vn`, password: hashedPwd, name: `ĐD. ${genName(nurseIdx + 5000, isFemale)}`, role: 'NURSE', phone: `08${String(10000000 + nurseIdx).slice(-8)}` },
      });
      await prisma.nurse.create({ data: { userId: u.id, departmentId: deptId, position } });
      nurseIdx++;
    }
    if ((di + 1) % 5 === 0) console.log(`  Nurses: done ${di + 1}/${medicalDepts.length} depts`);
  }
  console.log(`Created ${nurseIdx} nurses (${medicalDepts.length} depts x 40)`);

  const adminDepts = allDepts.filter(d => d.startsWith('Phong') || d.startsWith('Trung tam') || d.startsWith('Phòng') || d.startsWith('Trung tâm'));
  let adminStaffIdx = 0;
  for (const deptName of adminDepts) {
    const deptId = deptMap[deptName];
    // Create 15 staff members per admin department
    for (let pos = 0; pos < 15; pos++) {
      let position = 'Nhân viên';
      if (pos === 0) position = 'Trưởng phòng';
      else if (pos <= 2) position = 'Phó phòng';
      
      const isFemale = adminStaffIdx % 2 !== 0;
      let userRole = 'ADMIN';
      if (deptName.includes('Kế toán') || deptName.includes('Tài chính')) userRole = 'ACCOUNTANT';
      
      const u = await prisma.user.create({
        data: { email: `staff${adminStaffIdx + 1}@bvhungloi.vn`, password: hashedPwd, name: `${genName(adminStaffIdx + 8000, isFemale)}`, role: userRole, phone: `09${String(20000000 + adminStaffIdx).slice(-8)}` },
      });
      // Use Nurse table to store admin staff as per the UI workaround
      await prisma.nurse.create({ data: { userId: u.id, departmentId: deptId, position } });
      adminStaffIdx++;
    }
  }
  console.log(`Created ${adminStaffIdx} administrative staff`);

  const medicines = [
    { name: 'Amoxicillin 500mg', activeIngredient: 'Amoxicillin', unit: 'Viên', category: 'ANTIBIOTICS', price: 5000, inventory: 500 },
    { name: 'Cephalexin 500mg', activeIngredient: 'Cephalexin', unit: 'Viên', category: 'ANTIBIOTICS', price: 8000, inventory: 300 },
    { name: 'Azithromycin 250mg', activeIngredient: 'Azithromycin', unit: 'Viên', category: 'ANTIBIOTICS', price: 7000, inventory: 250 },
    { name: 'Ciprofloxacin 500mg', activeIngredient: 'Ciprofloxacin', unit: 'Viên', category: 'ANTIBIOTICS', price: 9000, inventory: 200 },
    { name: 'Ceftriaxone 1g', activeIngredient: 'Ceftriaxone', unit: 'Ống', category: 'ANTIBIOTICS', price: 15000, inventory: 100 },
    { name: 'Ibuprofen 400mg', activeIngredient: 'Ibuprofen', unit: 'Viên', category: 'PAIN', price: 3000, inventory: 800 },
    { name: 'Paracetamol 500mg', activeIngredient: 'Paracetamol', unit: 'Viên', category: 'PAIN', price: 2000, inventory: 1000 },
    { name: 'Aspirin 500mg', activeIngredient: 'Acetylsalicylic acid', unit: 'Viên', category: 'PAIN', price: 2500, inventory: 600 },
    { name: 'Naproxen 250mg', activeIngredient: 'Naproxen', unit: 'Viên', category: 'PAIN', price: 4000, inventory: 400 },
    { name: 'Tramadol 50mg', activeIngredient: 'Tramadol', unit: 'Viên', category: 'PAIN', price: 6000, inventory: 200 },
    { name: 'Acetaminophen 500mg', activeIngredient: 'Acetaminophen', unit: 'Viên', category: 'FEVER', price: 2500, inventory: 700 },
    { name: 'Ibuprofen 200mg', activeIngredient: 'Ibuprofen', unit: 'Viên', category: 'FEVER', price: 2000, inventory: 900 },
    { name: 'Metamizole 500mg', activeIngredient: 'Metamizole', unit: 'Viên', category: 'FEVER', price: 3000, inventory: 500 },
    { name: 'Paracetamol Syrup', activeIngredient: 'Paracetamol', unit: 'Lọ', category: 'FEVER', price: 12000, inventory: 150 },
    { name: 'Cetirizine 10mg', activeIngredient: 'Cetirizine', unit: 'Viên', category: 'ALLERGY', price: 4000, inventory: 400 },
    { name: 'Loratadine 10mg', activeIngredient: 'Loratadine', unit: 'Viên', category: 'ALLERGY', price: 4500, inventory: 350 },
    { name: 'Chlorpheniramine 4mg', activeIngredient: 'Chlorpheniramine', unit: 'Viên', category: 'ALLERGY', price: 3500, inventory: 450 },
    { name: 'Fexofenadine 180mg', activeIngredient: 'Fexofenadine', unit: 'Viên', category: 'ALLERGY', price: 5000, inventory: 300 },
    { name: 'Omeprazole 20mg', activeIngredient: 'Omeprazole', unit: 'Viên', category: 'DIGESTIVE', price: 7000, inventory: 300 },
    { name: 'Ranitidine 150mg', activeIngredient: 'Ranitidine', unit: 'Viên', category: 'DIGESTIVE', price: 5000, inventory: 250 },
    { name: 'Metoclopramide 10mg', activeIngredient: 'Metoclopramide', unit: 'Viên', category: 'DIGESTIVE', price: 3000, inventory: 400 },
    { name: 'Loperamide 2mg', activeIngredient: 'Loperamide', unit: 'Viên', category: 'DIGESTIVE', price: 2500, inventory: 350 },
    { name: 'Simethicone 80mg', activeIngredient: 'Simethicone', unit: 'Viên', category: 'DIGESTIVE', price: 3500, inventory: 500 },
    { name: 'Dextromethorphan 15mg', activeIngredient: 'Dextromethorphan', unit: 'Viên', category: 'RESPIRATORY', price: 4000, inventory: 500 },
    { name: 'Diphenhydramine 25mg', activeIngredient: 'Diphenhydramine', unit: 'Viên', category: 'RESPIRATORY', price: 3500, inventory: 400 },
    { name: 'Pseudoephedrine 60mg', activeIngredient: 'Pseudoephedrine', unit: 'Viên', category: 'RESPIRATORY', price: 5000, inventory: 300 },
    { name: 'Vitamin C 1000mg', activeIngredient: 'Ascorbic acid', unit: 'Viên', category: 'VITAMIN', price: 3000, inventory: 800 },
    { name: 'Vitamin B Complex', activeIngredient: 'B Vitamins', unit: 'Viên', category: 'VITAMIN', price: 4000, inventory: 600 },
    { name: 'Vitamin D 1000IU', activeIngredient: 'Cholecalciferol', unit: 'Viên', category: 'VITAMIN', price: 5000, inventory: 400 },
    { name: 'Iron Supplement', activeIngredient: 'Ferrous sulfate', unit: 'Viên', category: 'VITAMIN', price: 6000, inventory: 300 },
    { name: 'Calcium Carbonate 600mg', activeIngredient: 'Calcium', unit: 'Viên', category: 'VITAMIN', price: 5500, inventory: 350 },
    { name: 'Metformin 500mg', activeIngredient: 'Metformin', unit: 'Viên', category: 'DIABETES', price: 8000, inventory: 400 },
    { name: 'Glibenclamide 5mg', activeIngredient: 'Glibenclamide', unit: 'Viên', category: 'DIABETES', price: 6000, inventory: 250 },
    { name: 'Lisinopril 10mg', activeIngredient: 'Lisinopril', unit: 'Viên', category: 'CARDIO', price: 7000, inventory: 350 },
    { name: 'Amlodipine 5mg', activeIngredient: 'Amlodipine', unit: 'Viên', category: 'CARDIO', price: 8000, inventory: 300 },
    { name: 'Atenolol 50mg', activeIngredient: 'Atenolol', unit: 'Viên', category: 'CARDIO', price: 7500, inventory: 280 },
    { name: 'Atorvastatin 20mg', activeIngredient: 'Atorvastatin', unit: 'Viên', category: 'CARDIO', price: 9000, inventory: 250 },
    { name: 'Simvastatin 20mg', activeIngredient: 'Simvastatin', unit: 'Viên', category: 'CARDIO', price: 8500, inventory: 200 },
  ];
  for (const m of medicines) await prisma.medicine.create({ data: m });
  console.log(`Created ${medicines.length} medicines`);

  const supplies = [
    { name: 'Gauze Pad 4x4"', unit: 'Gói', category: 'BANDAGE', price: 5000, inventory: 500 },
    { name: 'Gauze Pad 2x2"', unit: 'Gói', category: 'BANDAGE', price: 2000, inventory: 800 },
    { name: 'Elastic Bandage 5cm', unit: 'Cuộn', category: 'BANDAGE', price: 8000, inventory: 200 },
    { name: 'Elastic Bandage 10cm', unit: 'Cuộn', category: 'BANDAGE', price: 12000, inventory: 150 },
    { name: 'Syringe 3ml', unit: 'Cái', category: 'NEEDLE', price: 1500, inventory: 2000 },
    { name: 'Syringe 5ml', unit: 'Cái', category: 'NEEDLE', price: 2000, inventory: 1500 },
    { name: 'Syringe 10ml', unit: 'Cái', category: 'NEEDLE', price: 2500, inventory: 1000 },
    { name: 'Needle 25G', unit: 'Cái', category: 'NEEDLE', price: 500, inventory: 5000 },
    { name: 'IV Catheter 18G', unit: 'Cái', category: 'NEEDLE', price: 8000, inventory: 300 },
    { name: 'IV Catheter 20G', unit: 'Cái', category: 'NEEDLE', price: 7000, inventory: 350 },
    { name: 'Latex Glove (S)', unit: 'Gói', category: 'GLOVE', price: 3000, inventory: 500 },
    { name: 'Latex Glove (M)', unit: 'Gói', category: 'GLOVE', price: 3000, inventory: 600 },
    { name: 'Latex Glove (L)', unit: 'Gói', category: 'GLOVE', price: 3000, inventory: 500 },
    { name: 'Nitrile Glove (M)', unit: 'Gói', category: 'GLOVE', price: 4000, inventory: 400 },
    { name: 'Cotton Ball', unit: 'Gói', category: 'COTTON', price: 2000, inventory: 800 },
    { name: 'Alcohol Prep Pad', unit: 'Gói', category: 'COTTON', price: 3000, inventory: 600 },
    { name: 'Betadine Solution', unit: 'Lọ', category: 'DISINFECTANT', price: 15000, inventory: 100 },
    { name: 'Hydrogen Peroxide 3%', unit: 'Lọ', category: 'DISINFECTANT', price: 10000, inventory: 150 },
    { name: 'Alcohol 70%', unit: 'Lọ', category: 'DISINFECTANT', price: 8000, inventory: 200 },
    { name: 'Surgical Mask', unit: 'Gói', category: 'MASK', price: 5000, inventory: 500 },
    { name: 'N95 Mask', unit: 'Gói', category: 'MASK', price: 12000, inventory: 200 },
    { name: 'Digital Thermometer', unit: 'Cái', category: 'EQUIPMENT', price: 25000, inventory: 50 },
    { name: 'Blood Pressure Cuff', unit: 'Cái', category: 'EQUIPMENT', price: 85000, inventory: 30 },
    { name: 'Pulse Oximeter', unit: 'Cái', category: 'EQUIPMENT', price: 120000, inventory: 20 },
    { name: 'Stethoscope', unit: 'Cái', category: 'EQUIPMENT', price: 200000, inventory: 15 },
  ];
  for (const s of supplies) await prisma.medicalSupply.create({ data: s });
  console.log(`Created ${supplies.length} supplies`);

  // Tạo ~3000 giường (chia ra các loại phòng)
  const rooms: any[] = [];
  console.log('Creating ~3000 beds across ~820 rooms... this may take a moment.');
  
  // 500 Phòng Thường (NORMAL) - 5 giường/phòng = 2500 giường
  for (let i = 1; i <= 500; i++) {
    const floor = Math.floor((i - 1) / 50) + 1; // 50 phòng/tầng
    const beds = Array.from({ length: 5 }, (_, idx) => ({ bedNumber: `Giường ${idx + 1}`, status: 'AVAILABLE' }));
    rooms.push({ name: `Phòng Thường ${floor}-${i}`, type: 'NORMAL', floor, ratePerDay: 150000, capacity: 5, beds });
  }
  
  // 250 Phòng Dịch Vụ (SERVICE) - 2 giường/phòng = 500 giường
  for (let i = 1; i <= 250; i++) {
    const floor = Math.floor((i - 1) / 50) + 1;
    const beds = Array.from({ length: 2 }, (_, idx) => ({ bedNumber: `Giường DV-${idx + 1}`, status: 'AVAILABLE' }));
    rooms.push({ name: `Phòng Dịch Vụ ${floor}-${i}`, type: 'SERVICE', floor, ratePerDay: 300000, capacity: 2, beds });
  }

  // 50 Phòng VIP - 1 giường/phòng = 50 giường
  for (let i = 1; i <= 50; i++) {
    const floor = Math.floor((i - 1) / 25) + 6; // VIP ở tầng cao
    const beds = [{ bedNumber: `Giường VIP`, status: 'AVAILABLE' }];
    rooms.push({ name: `Phòng VIP ${floor}-${i}`, type: 'VIP', floor, ratePerDay: 800000, capacity: 1, beds });
  }

  // 20 Phòng ICU - 1 giường/phòng = 20 giường
  for (let i = 1; i <= 20; i++) {
    const beds = [{ bedNumber: `Giường Hồi Sức`, status: 'AVAILABLE' }];
    rooms.push({ name: `Phòng ICU ${i}`, type: 'ICU', floor: 2, ratePerDay: 1200000, capacity: 1, beds });
  }

  // 10 Phòng Phẫu thuật
  for (let i = 1; i <= 10; i++) {
    const beds = [{ bedNumber: `Bàn mổ ${i}`, status: 'AVAILABLE' }];
    rooms.push({ name: `Phòng Phẫu Thuật ${i}`, type: 'SURGERY', floor: 3, ratePerDay: 2000000, capacity: 1, beds });
  }

  const chunk = 50;
  let createdRooms = 0;
  for (let i = 0; i < rooms.length; i += chunk) {
    const batch = rooms.slice(i, i + chunk);
    await Promise.all(batch.map(async (r) => {
      const { beds, ...rest } = r;
      const room = await prisma.room.create({
        data: { ...rest, status: 'AVAILABLE', description: `Phòng ${r.type} - Tầng ${r.floor}`, beds: { create: beds } },
      });
      // Add services to VIP or SERVICE rooms
      if (r.type === 'VIP' || r.type === 'SERVICE') {
        const services = [{ name: 'Điều hòa', price: 20000 }, { name: 'Internet WiFi', price: 10000 }];
        if (r.type === 'VIP') services.push({ name: 'Truyền hình cáp', price: 15000 }, { name: 'Tủ lạnh mini', price: 30000 });
        for (const svc of services) {
          await prisma.roomService.create({ data: { ...svc, roomId: room.id, description: `${svc.name} - ${room.name}` } });
        }
      }
    }));
    createdRooms += batch.length;
    console.log(`  Rooms: done ${createdRooms}/${rooms.length}`);
  }
  console.log(`Created ${createdRooms} rooms with ~3080 beds total`);

  console.log('\nSeed complete!');
  console.log(`Total: ${allDepts.length} depts, ${docIdx + 1} doctors, 40 nurses`);
  console.log('Password for all: Hospital@2024');
  console.log('Director: director@bvhungloi.vn');
  console.log('Doctors: doc1@bvhungloi.vn ... docN@bvhungloi.vn');
  console.log('Nurses: nurse1@bvhungloi.vn ... nurse40@bvhungloi.vn');
}

main().catch(console.error).finally(() => prisma.$disconnect());
