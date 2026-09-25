/**
 * SEED SCRIPT — Bệnh viện Đa khoa Hùng Lợi
 * Chạy: node prisma/seed.mjs
 * Xóa toàn bộ data cũ và tạo lại data mẫu đầy đủ.
 */
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { randomUUID } from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, '../dev.db');
const db = new Database(dbPath);

// Bật WAL mode & foreign keys
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

const now = new Date().toISOString();
const uid = () => randomUUID();

// ===== HELPERS =====
function d(offsetDays, offsetHours = 0) {
  const dt = new Date();
  dt.setDate(dt.getDate() + offsetDays);
  dt.setHours(dt.getHours() + offsetHours);
  return dt.toISOString();
}
function hash(pw) { return bcrypt.hashSync(pw, 10); }

// ===== XÓA DATA CŨ theo thứ tự FK =====
console.log('🗑️  Xóa dữ liệu cũ...');
const tables = [
  'MedicalOrder','SurgeryOrder','InvoiceItem','Payment','Invoice',
  'PrescriptionItem','Prescription','LabOrder','ClinicRecord','MedicalRecord',
  'ClinicAppointment','Appointment','InpatientRecord',
  'MedicineInventoryLog','SupplierMedicineBatch',
  'SupplyInventoryLog','SupplierSupplyBatch',
  'RoomService','RoomBed','Room',
  'StaffShift','Nurse','Doctor',
  'Medicine','MedicalSupply','Supplier','ServiceCombo','Article',
  'User','Department',
];
for (const t of tables) {
  try { db.prepare(`DELETE FROM "${t}"`).run(); } catch { /* ignore */ }
}

// ===== DEPARTMENTS =====
console.log('🏥  Tạo Khoa/Phòng...');
const depts = [
  { id: uid(), name: 'Nội tổng hợp',      description: 'Khoa Nội – Điều trị các bệnh nội khoa',        floor: 'Tầng 2' },
  { id: uid(), name: 'Ngoại tổng hợp',    description: 'Khoa Ngoại – Phẫu thuật và điều trị ngoại',     floor: 'Tầng 3' },
  { id: uid(), name: 'Nhi khoa',           description: 'Khoa Nhi – Chăm sóc bệnh nhi',                 floor: 'Tầng 2' },
  { id: uid(), name: 'Sản phụ khoa',       description: 'Khoa Sản – Theo dõi thai sản và phụ khoa',      floor: 'Tầng 4' },
  { id: uid(), name: 'Tim mạch',           description: 'Khoa Tim Mạch – Điều trị bệnh tim mạch',        floor: 'Tầng 3' },
  { id: uid(), name: 'Thần kinh',          description: 'Khoa Thần Kinh – Điều trị các bệnh thần kinh', floor: 'Tầng 4' },
  { id: uid(), name: 'Tai Mũi Họng',       description: 'Khoa TMH – Điều trị các bệnh tai mũi họng',    floor: 'Tầng 2' },
  { id: uid(), name: 'Mắt',                description: 'Khoa Mắt – Điều trị các bệnh về mắt',          floor: 'Tầng 2' },
  { id: uid(), name: 'Da liễu',            description: 'Khoa Da liễu – Điều trị các bệnh da',          floor: 'Tầng 1' },
  { id: uid(), name: 'Cấp cứu',            description: 'Khoa Cấp Cứu – Tiếp nhận bệnh nhân cấp cứu',  floor: 'Tầng 1' },
  { id: uid(), name: 'Xét nghiệm',         description: 'Phòng Xét Nghiệm – CLS',                       floor: 'Tầng 1' },
  { id: uid(), name: 'Chẩn đoán hình ảnh', description: 'Phòng X-quang, Siêu âm, CT-scan',              floor: 'Tầng 1' },
];
const insD = db.prepare(`INSERT INTO Department(id,name,description,floor,createdAt,updatedAt) VALUES(?,?,?,?,?,?)`);
for (const d of depts) insD.run(d.id, d.name, d.description, d.floor, now, now);
const dept = Object.fromEntries(depts.map(d => [d.name, d.id]));

// ===== USERS: ADMIN =====
console.log('👤  Tạo tài khoản nhân sự...');
const insU = db.prepare(`INSERT INTO User(id,email,password,name,role,phone,address,dob,gender,createdAt,updatedAt) VALUES(?,?,?,?,?,?,?,?,?,?,?)`);

// -- ADMIN --
const adminId = uid();
insU.run(adminId,'admin@bvhungloi.vn',hash('Admin@123'),'Nguyễn Minh Tuấn','ADMIN','0901 234 567','123 Lê Duẩn, Q.1, TP.HCM','1975-03-15T00:00:00.000Z','MALE',now,now);

const accountantId = uid();
insU.run(accountantId,'ketoan@bvhungloi.vn',hash('Ketoan@123'),'Trần Thị Mai Lan','ACCOUNTANT','0902 345 678','45 Nguyễn Trãi, Q.5, TP.HCM','1985-07-22T00:00:00.000Z','FEMALE',now,now);

const pharma1Id = uid();
insU.run(pharma1Id,'duoc1@bvhungloi.vn',hash('Duoc@123'),'Lê Thị Hoa','PHARMACIST','0903 456 789','78 Điện Biên Phủ, Q.3, TP.HCM','1988-11-10T00:00:00.000Z','FEMALE',now,now);

const pharma2Id = uid();
insU.run(pharma2Id,'duoc2@bvhungloi.vn',hash('Duoc@123'),'Phạm Văn Dũng','PHARMACIST','0904 567 890','12 Cách Mạng Tháng 8, Q.10, TP.HCM','1990-04-05T00:00:00.000Z','MALE',now,now);

// -- DOCTORS --
const doctors = [
  // Nội tổng hợp
  { id: uid(), email:'bs.anhtuan@bvhungloi.vn', name:'BS. Nguyễn Anh Tuấn',   specialty:'Nội tổng hợp',  dept:'Nội tổng hợp',  fee:150000, phone:'0911 001 001', dob:'1970-01-15T00:00:00.000Z', gender:'MALE',   license:'VN-NOI-001', bio:'15 năm kinh nghiệm điều trị bệnh nội khoa.' },
  { id: uid(), email:'bs.thanhhuong@bvhungloi.vn', name:'BS. Trần Thị Thanh Hương', specialty:'Nội tổng hợp', dept:'Nội tổng hợp', fee:120000, phone:'0911 002 002', dob:'1978-06-20T00:00:00.000Z', gender:'FEMALE', license:'VN-NOI-002', bio:'Chuyên điều trị các bệnh mãn tính.' },
  // Ngoại
  { id: uid(), email:'bs.quocan@bvhungloi.vn', name:'BS. Lê Quốc Ân',         specialty:'Ngoại tổng hợp', dept:'Ngoại tổng hợp', fee:200000, phone:'0912 001 001', dob:'1968-09-30T00:00:00.000Z', gender:'MALE',   license:'VN-NGO-001', bio:'Chuyên phẫu thuật nội soi và phẫu thuật tổng quát.' },
  { id: uid(), email:'bs.thuylinh@bvhungloi.vn', name:'BS. Phạm Thị Thùy Linh', specialty:'Ngoại tổng hợp', dept:'Ngoại tổng hợp', fee:180000, phone:'0912 002 002', dob:'1980-02-14T00:00:00.000Z', gender:'FEMALE', license:'VN-NGO-002', bio:'Chuyên ngoại tiêu hóa.' },
  // Nhi
  { id: uid(), email:'bs.minhkhoa@bvhungloi.vn', name:'BS. Hoàng Minh Khoa',   specialty:'Nhi khoa',      dept:'Nhi khoa',       fee:130000, phone:'0913 001 001', dob:'1982-04-25T00:00:00.000Z', gender:'MALE',   license:'VN-NHI-001', bio:'Bác sĩ nhi khoa, yêu trẻ em.' },
  { id: uid(), email:'bs.bichvan@bvhungloi.vn', name:'BS. Võ Thị Bích Vân',    specialty:'Nhi khoa',      dept:'Nhi khoa',       fee:120000, phone:'0913 002 002', dob:'1985-08-18T00:00:00.000Z', gender:'FEMALE', license:'VN-NHI-002', bio:'Chuyên sơ sinh và bệnh lý nhi.' },
  // Sản
  { id: uid(), email:'bs.tranthao@bvhungloi.vn', name:'BS. Nguyễn Trân Thảo',   specialty:'Sản phụ khoa',  dept:'Sản phụ khoa',   fee:160000, phone:'0914 001 001', dob:'1975-12-01T00:00:00.000Z', gender:'FEMALE', license:'VN-SAN-001', bio:'Chuyên khoa sản, theo dõi thai kỳ và sinh thường/mổ.' },
  { id: uid(), email:'bs.ducmanh@bvhungloi.vn', name:'BS. Bùi Đức Mạnh',       specialty:'Sản phụ khoa',  dept:'Sản phụ khoa',   fee:150000, phone:'0914 002 002', dob:'1979-07-07T00:00:00.000Z', gender:'MALE',   license:'VN-SAN-002', bio:'Phụ khoa ung thư và điều trị vô sinh.' },
  // Tim mạch
  { id: uid(), email:'bs.vinhlong@bvhungloi.vn', name:'BS. Đặng Vĩnh Long',     specialty:'Tim mạch',      dept:'Tim mạch',       fee:200000, phone:'0915 001 001', dob:'1966-03-10T00:00:00.000Z', gender:'MALE',   license:'VN-TIM-001', bio:'Chuyên can thiệp tim mạch, đặt stent.' },
  { id: uid(), email:'bs.bichngoc@bvhungloi.vn', name:'BS. Lý Thị Bích Ngọc',   specialty:'Tim mạch',      dept:'Tim mạch',       fee:170000, phone:'0915 002 002', dob:'1982-09-25T00:00:00.000Z', gender:'FEMALE', license:'VN-TIM-002', bio:'Điện tâm đồ và siêu âm tim.' },
  // Thần kinh
  { id: uid(), email:'bs.thanhtam@bvhungloi.vn', name:'BS. Trương Thanh Tâm',    specialty:'Thần kinh',     dept:'Thần kinh',      fee:180000, phone:'0916 001 001', dob:'1974-05-20T00:00:00.000Z', gender:'MALE',   license:'VN-TK-001', bio:'Chuyên đột quỵ và bệnh Parkinson.' },
  // TMH
  { id: uid(), email:'bs.kimchi@bvhungloi.vn', name:'BS. Ngô Thị Kim Chi',     specialty:'Tai Mũi Họng',  dept:'Tai Mũi Họng',   fee:130000, phone:'0917 001 001', dob:'1984-11-30T00:00:00.000Z', gender:'FEMALE', license:'VN-TMH-001', bio:'Điều trị viêm xoang, amidan và bệnh tai.' },
  // Mắt
  { id: uid(), email:'bs.quangbien@bvhungloi.vn', name:'BS. Phan Quang Biên',   specialty:'Nhãn khoa',     dept:'Mắt',            fee:140000, phone:'0918 001 001', dob:'1977-02-28T00:00:00.000Z', gender:'MALE',   license:'VN-MAT-001', bio:'Phẫu thuật đục thủy tinh thể, điều chỉnh khúc xạ.' },
  // Da liễu
  { id: uid(), email:'bs.xuan@bvhungloi.vn', name:'BS. Mai Thị Xuân',         specialty:'Da liễu',       dept:'Da liễu',        fee:120000, phone:'0919 001 001', dob:'1986-06-15T00:00:00.000Z', gender:'FEMALE', license:'VN-DA-001', bio:'Điều trị mụn trứng cá, bệnh da mãn tính.' },
  // Cấp cứu
  { id: uid(), email:'bs.truongson@bvhungloi.vn', name:'BS. Đinh Trường Sơn',  specialty:'Cấp cứu',       dept:'Cấp cứu',        fee:100000, phone:'0920 001 001', dob:'1981-10-10T00:00:00.000Z', gender:'MALE',   license:'VN-CC-001', bio:'Bác sĩ cấp cứu, hồi sức tích cực.' },
];

const insDoc = db.prepare(`INSERT INTO Doctor(id,specialty,bio,licenseNo,userId,departmentId,consultationFee,createdAt,updatedAt) VALUES(?,?,?,?,?,?,?,?,?)`);
const doctorObjs = [];
for (const d of doctors) {
  const userId = uid();
  insU.run(userId, d.email, hash('Doctor@123'), d.name, 'DOCTOR', d.phone, null, d.dob, d.gender, now, now);
  const doctorId = uid();
  insDoc.run(doctorId, d.specialty, d.bio, d.license, userId, dept[d.dept], d.fee, now, now);
  doctorObjs.push({ ...d, doctorId, userId });
}
const docByDept = (deptName) => doctorObjs.filter(d => d.dept === deptName);
const anyDoc = () => doctorObjs[Math.floor(Math.random() * doctorObjs.length)];
const docNoi = docByDept('Nội tổng hợp');
const docNgoai = docByDept('Ngoại tổng hợp');
const docNhi = docByDept('Nhi khoa');
const docTim = docByDept('Tim mạch');
const docSan = docByDept('Sản phụ khoa');
const docCC = docByDept('Cấp cứu');

// -- NURSES --
const nurses = [
  { name:'Trần Thị Hồng Nhung',  dept:'Nội tổng hợp',  pos:'Trưởng Khoa Y Tá', dob:'1980-03-10T00:00:00.000Z', gender:'FEMALE' },
  { name:'Nguyễn Thị Lan Anh',   dept:'Nội tổng hợp',  pos:'Y Tá Senior',       dob:'1990-07-22T00:00:00.000Z', gender:'FEMALE' },
  { name:'Lê Thị Mỹ Linh',       dept:'Nội tổng hợp',  pos:'Y Tá',              dob:'1995-11-05T00:00:00.000Z', gender:'FEMALE' },
  { name:'Phạm Ngọc Bảo',        dept:'Ngoại tổng hợp',pos:'Trưởng Khoa Y Tá', dob:'1982-05-18T00:00:00.000Z', gender:'MALE'   },
  { name:'Hoàng Thị Thu Thảo',   dept:'Ngoại tổng hợp',pos:'Y Tá Senior',       dob:'1992-09-30T00:00:00.000Z', gender:'FEMALE' },
  { name:'Vũ Thị Kim Ngân',      dept:'Nhi khoa',      pos:'Trưởng Khoa Y Tá', dob:'1983-01-25T00:00:00.000Z', gender:'FEMALE' },
  { name:'Đặng Thị Thu Hà',      dept:'Nhi khoa',      pos:'Y Tá',              dob:'1996-08-12T00:00:00.000Z', gender:'FEMALE' },
  { name:'Bùi Thị Phương Thảo',  dept:'Sản phụ khoa',  pos:'Trưởng Khoa Y Tá', dob:'1978-06-14T00:00:00.000Z', gender:'FEMALE' },
  { name:'Lý Thị Hồng Hạnh',    dept:'Tim mạch',       pos:'Y Tá Senior',       dob:'1991-04-20T00:00:00.000Z', gender:'FEMALE' },
  { name:'Mai Văn Hùng',         dept:'Cấp cứu',       pos:'Y Tá Senior',       dob:'1988-12-03T00:00:00.000Z', gender:'MALE'   },
  { name:'Ngô Thị Kiều Oanh',    dept:'Cấp cứu',       pos:'Y Tá',              dob:'1994-02-28T00:00:00.000Z', gender:'FEMALE' },
  { name:'Trương Thị Bích Thủy', dept:'Thần kinh',     pos:'Y Tá',              dob:'1993-10-10T00:00:00.000Z', gender:'FEMALE' },
];

const insNurse = db.prepare(`INSERT INTO Nurse(id,userId,departmentId,position,createdAt,updatedAt) VALUES(?,?,?,?,?,?)`);
let ni = 0;
for (const n of nurses) {
  const email = `yta${++ni}@bvhungloi.vn`;
  const userId = uid();
  insU.run(userId, email, hash('Nurse@123'), n.name, 'NURSE', null, null, n.dob, n.gender, now, now);
  const nurseId = uid();
  insNurse.run(nurseId, userId, dept[n.dept], n.pos, now, now);
}

// ===== ROOMS & BEDS =====
console.log('🛏️  Tạo phòng và giường...');
const insRoom = db.prepare(`INSERT INTO Room(id,name,type,status,floor,capacity,ratePerDay,description,departmentId,createdAt,updatedAt) VALUES(?,?,?,?,?,?,?,?,?,?,?)`);
const insBed = db.prepare(`INSERT INTO RoomBed(id,bedNumber,status,roomId,createdAt,updatedAt) VALUES(?,?,?,?,?,?)`);
const rooms = [];
const beds = [];
const roomDefs = [
  { name:'Phòng Nội 201', type:'NORMAL', floor:2, cap:4, rate:200000, dept:'Nội tổng hợp', beds:['01','02','03','04'] },
  { name:'Phòng Nội 202', type:'NORMAL', floor:2, cap:4, rate:200000, dept:'Nội tổng hợp', beds:['01','02','03','04'] },
  { name:'Phòng Nội VIP 210', type:'VIP', floor:2, cap:1, rate:800000, dept:'Nội tổng hợp', beds:['01'] },
  { name:'Phòng Ngoại 301', type:'NORMAL', floor:3, cap:4, rate:200000, dept:'Ngoại tổng hợp', beds:['01','02','03','04'] },
  { name:'Phòng Ngoại ICU 310', type:'ICU', floor:3, cap:2, rate:1500000, dept:'Ngoại tổng hợp', beds:['01','02'] },
  { name:'Phòng Nhi 211', type:'NORMAL', floor:2, cap:6, rate:180000, dept:'Nhi khoa', beds:['01','02','03','04','05','06'] },
  { name:'Phòng Nhi VIP 215', type:'VIP', floor:2, cap:1, rate:700000, dept:'Nhi khoa', beds:['01'] },
  { name:'Phòng Sản 401', type:'NORMAL', floor:4, cap:4, rate:220000, dept:'Sản phụ khoa', beds:['01','02','03','04'] },
  { name:'Phòng Sản VIP 410', type:'VIP', floor:4, cap:1, rate:900000, dept:'Sản phụ khoa', beds:['01'] },
  { name:'Phòng Tim Mạch 305', type:'NORMAL', floor:3, cap:4, rate:250000, dept:'Tim mạch', beds:['01','02','03','04'] },
  { name:'Phòng Thần Kinh 405', type:'NORMAL', floor:4, cap:4, rate:230000, dept:'Thần kinh', beds:['01','02','03','04'] },
  { name:'Phòng Cấp Cứu CC01', type:'ICU', floor:1, cap:8, rate:1200000, dept:'Cấp cứu', beds:['01','02','03','04','05','06','07','08'] },
];
for (const r of roomDefs) {
  const roomId = uid();
  insRoom.run(roomId, r.name, r.type, 'AVAILABLE', r.floor, r.cap, r.rate, null, dept[r.dept], now, now);
  rooms.push({ id: roomId, ...r });
  for (const b of r.beds) {
    const bedId = uid();
    insBed.run(bedId, b, 'AVAILABLE', roomId, now, now);
    beds.push({ id: bedId, roomId, roomName: r.name, bedNumber: b });
  }
}

// ===== MEDICINES =====
console.log('💊  Tạo danh mục thuốc...');
const insMed = db.prepare(`INSERT INTO Medicine(id,name,activeIngredient,unit,category,description,inventory,price,costPrice,minStock,maxStock,status,createdAt,updatedAt) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
const medicines = [
  { name:'Paracetamol 500mg', ingredient:'Paracetamol', unit:'Viên', cat:'PAIN', inv:500, price:2000, cost:1200 },
  { name:'Amoxicillin 500mg', ingredient:'Amoxicillin', unit:'Viên', cat:'ANTIBIOTICS', inv:300, price:5000, cost:3000 },
  { name:'Azithromycin 250mg', ingredient:'Azithromycin', unit:'Viên', cat:'ANTIBIOTICS', inv:200, price:12000, cost:7500 },
  { name:'Ibuprofen 400mg', ingredient:'Ibuprofen', unit:'Viên', cat:'PAIN', inv:400, price:3500, cost:2000 },
  { name:'Cetirizine 10mg', ingredient:'Cetirizine hydrochloride', unit:'Viên', cat:'ALLERGY', inv:250, price:4000, cost:2200 },
  { name:'Omeprazole 20mg', ingredient:'Omeprazole', unit:'Viên', cat:'DIGESTIVE', inv:350, price:6000, cost:3500 },
  { name:'Metformin 500mg', ingredient:'Metformin HCl', unit:'Viên', cat:'GENERAL', inv:300, price:4500, cost:2500 },
  { name:'Amlodipine 5mg', ingredient:'Amlodipine besylate', unit:'Viên', cat:'CARDIO', inv:200, price:8000, cost:5000 },
  { name:'Atorvastatin 20mg', ingredient:'Atorvastatin calcium', unit:'Viên', cat:'CARDIO', inv:180, price:15000, cost:9000 },
  { name:'Vitamin C 1000mg', ingredient:'Ascorbic acid', unit:'Viên', cat:'VITAMIN', inv:600, price:3000, cost:1500 },
  { name:'Vitamin D3 2000IU', ingredient:'Cholecalciferol', unit:'Viên', cat:'VITAMIN', inv:250, price:8000, cost:4500 },
  { name:'Salbutamol 4mg', ingredient:'Salbutamol', unit:'Viên', cat:'RESPIRATORY', inv:150, price:5000, cost:3000 },
  { name:'Prednisolone 5mg', ingredient:'Prednisolone', unit:'Viên', cat:'GENERAL', inv:180, price:4000, cost:2200 },
  { name:'Losartan 50mg', ingredient:'Losartan potassium', unit:'Viên', cat:'CARDIO', inv:200, price:12000, cost:7000 },
  { name:'Clopidogrel 75mg', ingredient:'Clopidogrel bisulfate', unit:'Viên', cat:'CARDIO', inv:120, price:18000, cost:11000 },
  { name:'Dextromethorphan 15mg', ingredient:'Dextromethorphan HBr', unit:'Viên', cat:'RESPIRATORY', inv:200, price:4500, cost:2500 },
  { name:'Loperamide 2mg', ingredient:'Loperamide HCl', unit:'Viên', cat:'DIGESTIVE', inv:180, price:5000, cost:2800 },
  { name:'Folic Acid 5mg', ingredient:'Folic acid', unit:'Viên', cat:'VITAMIN', inv:400, price:2000, cost:1000 },
  { name:'Ambroxol 30mg', ingredient:'Ambroxol HCl', unit:'Viên', cat:'RESPIRATORY', inv:220, price:4000, cost:2200 },
  { name:'Ciprofloxacin 500mg', ingredient:'Ciprofloxacin HCl', unit:'Viên', cat:'ANTIBIOTICS', inv:160, price:9000, cost:5500 },
  { name:'Pantoprazole 40mg', ingredient:'Pantoprazole sodium', unit:'Viên', cat:'DIGESTIVE', inv:200, price:14000, cost:8500 },
  { name:'Furosemide 40mg', ingredient:'Furosemide', unit:'Viên', cat:'CARDIO', inv:150, price:3500, cost:2000 },
  { name:'Diazepam 5mg', ingredient:'Diazepam', unit:'Viên', cat:'GENERAL', inv:100, price:3000, cost:1800 },
  { name:'Metronidazole 250mg', ingredient:'Metronidazole', unit:'Viên', cat:'ANTIBIOTICS', inv:200, price:3500, cost:2000 },
  { name:'Nifedipine 10mg', ingredient:'Nifedipine', unit:'Viên', cat:'CARDIO', inv:130, price:5000, cost:3000 },
];
const medObjs = [];
for (const m of medicines) {
  const id = uid();
  insMed.run(id, m.name, m.ingredient, m.unit, m.cat, null, m.inv, m.price, m.cost, 20, 500, 'ACTIVE', now, now);
  medObjs.push({ id, ...m });
}

// ===== PATIENTS =====
console.log('🧑‍⚕️  Tạo tài khoản bệnh nhân...');
const patients = [
  { name:'Trần Văn Bình',       dob:'1985-04-12T00:00:00.000Z', gender:'MALE',   phone:'0931 111 001', addr:'23 Hoàng Diệu, Q.4, TP.HCM',    bhyt:'BN4020000000001' },
  { name:'Nguyễn Thị Cẩm Ly',  dob:'1992-08-25T00:00:00.000Z', gender:'FEMALE', phone:'0932 111 002', addr:'55 Nguyễn Huệ, Q.1, TP.HCM',     bhyt:'BN4020000000002' },
  { name:'Lê Hoàng Nam',        dob:'1978-01-30T00:00:00.000Z', gender:'MALE',   phone:'0933 111 003', addr:'88 Lý Thường Kiệt, Q.10, TP.HCM', bhyt:null },
  { name:'Phạm Thị Diễm Châu', dob:'1999-11-15T00:00:00.000Z', gender:'FEMALE', phone:'0934 111 004', addr:'12 Bạch Đằng, Bình Thạnh, TP.HCM', bhyt:'BN4020000000004' },
  { name:'Hoàng Văn Đức',       dob:'1965-06-07T00:00:00.000Z', gender:'MALE',   phone:'0935 111 005', addr:'99 Trần Hưng Đạo, Q.5, TP.HCM',   bhyt:'BN4020000000005' },
  { name:'Vũ Thị Hồng',         dob:'1988-09-18T00:00:00.000Z', gender:'FEMALE', phone:'0936 111 006', addr:'34 Cách Mạng T8, Q.3, TP.HCM',    bhyt:null },
  { name:'Đặng Quốc Khánh',     dob:'2005-02-20T00:00:00.000Z', gender:'MALE',   phone:'0937 111 007', addr:'7 Phan Đình Phùng, Phú Nhuận',    bhyt:'BN4020000000007' },
  { name:'Bùi Thị Mỹ Linh',    dob:'1972-12-03T00:00:00.000Z', gender:'FEMALE', phone:'0938 111 008', addr:'56 Nguyễn Thị Minh Khai, Q.3',     bhyt:'BN4020000000008' },
  { name:'Trương Văn Nghĩa',    dob:'1958-05-22T00:00:00.000Z', gender:'MALE',   phone:'0939 111 009', addr:'100 Đinh Tiên Hoàng, Bình Thạnh',  bhyt:'BN4020000000009' },
  { name:'Mai Thị Oanh',        dob:'1995-07-08T00:00:00.000Z', gender:'FEMALE', phone:'0940 111 010', addr:'8 Nguyễn Đình Chiểu, Q.1',          bhyt:null },
  { name:'Ngô Thanh Phong',     dob:'1982-03-14T00:00:00.000Z', gender:'MALE',   phone:'0941 111 011', addr:'33 Võ Văn Tần, Q.3, TP.HCM',        bhyt:'BN4020000000011' },
  { name:'Đinh Thị Quỳnh',      dob:'2010-10-30T00:00:00.000Z', gender:'FEMALE', phone:'0942 111 012', addr:'22 Lê Văn Sỹ, Q.3, TP.HCM',         bhyt:'BN4020000000012' },
  { name:'Cao Xuân Thịnh',      dob:'1968-07-04T00:00:00.000Z', gender:'MALE',   phone:'0943 111 013', addr:'67 Phạm Ngũ Lão, Q.1, TP.HCM',       bhyt:null },
  { name:'Lưu Thị Uyên',        dob:'1990-04-16T00:00:00.000Z', gender:'FEMALE', phone:'0944 111 014', addr:'14 Hai Bà Trưng, Q.1, TP.HCM',        bhyt:'BN4020000000014' },
  { name:'Phan Minh Vũ',        dob:'1975-11-11T00:00:00.000Z', gender:'MALE',   phone:'0945 111 015', addr:'41 Hùng Vương, Q.10, TP.HCM',         bhyt:'BN4020000000015' },
];

const patientObjs = [];
for (let i = 0; i < patients.length; i++) {
  const p = patients[i];
  const userId = uid();
  const email = `bn${String(i+1).padStart(2,'0')}@gmail.com`;
  insU.run(userId, email, hash('Patient@123'), p.name, 'PATIENT', p.phone, p.addr, p.dob, p.gender, now, now);
  patientObjs.push({ userId, email, ...p });
}

// ===== APPOINTMENTS + MEDICAL RECORDS + PRESCRIPTIONS + PAYMENTS =====
console.log('📋  Tạo lịch khám và bệnh án...');
const insAppt = db.prepare(`INSERT INTO Appointment(id,date,status,notes,symptoms,diagnosis,type,healthInsuranceNo,queueNumber,patientId,doctorId,createdAt,updatedAt) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)`);
const insMR = db.prepare(`INSERT INTO MedicalRecord(id,diagnosis,treatment,notes,patientId,appointmentId,createdAt,updatedAt) VALUES(?,?,?,?,?,?,?,?)`);
const insPres = db.prepare(`INSERT INTO Prescription(id,notes,status,appointmentId,createdAt,updatedAt) VALUES(?,?,?,?,?,?)`);
const insPI = db.prepare(`INSERT INTO PrescriptionItem(id,dosage,duration,instructions,quantity,medicineId,prescriptionId) VALUES(?,?,?,?,?,?,?)`);
const insLab = db.prepare(`INSERT INTO LabOrder(id,type,description,price,result,status,orderDate,completedDate,appointmentId,createdAt,updatedAt) VALUES(?,?,?,?,?,?,?,?,?,?,?)`);
const insInv = db.prepare(`INSERT INTO Invoice(id,invoiceNo,total,discount,finalTotal,status,dueDate,notes,appointmentId,createdAt,updatedAt) VALUES(?,?,?,?,?,?,?,?,?,?,?)`);
const insII = db.prepare(`INSERT INTO InvoiceItem(id,description,amount,quantity,invoiceId) VALUES(?,?,?,?,?)`);
const insPay = db.prepare(`INSERT INTO Payment(id,amount,status,method,txnRef,paidDate,appointmentId,createdAt,updatedAt) VALUES(?,?,?,?,?,?,?,?,?)`);

let invoiceCounter = 1;
const padInv = () => `INV-2025-${String(invoiceCounter++).padStart(5,'0')}`;

// Trường hợp khám mẫu
const cases = [
  { sym:'Sốt cao, ho, đau họng 3 ngày', diag:'Viêm họng cấp tính', treat:'Nghỉ ngơi, uống nhiều nước, dùng thuốc theo đơn', meds:[{i:0,dos:'2 viên/lần x 3 lần/ngày',dur:'5 ngày',ins:'Uống sau ăn',qty:2},{i:18,dos:'1 viên x 2 lần/ngày',dur:'5 ngày',ins:'Uống sau ăn',qty:1}], fee:150000, lab:null },
  { sym:'Đau bụng vùng thượng vị, buồn nôn', diag:'Viêm loét dạ dày tá tràng', treat:'Dùng thuốc kháng acid, tránh ăn cay nóng', meds:[{i:5,dos:'1 viên x 2 lần/ngày',dur:'4 tuần',ins:'Uống trước ăn 30 phút',qty:4},{i:3,dos:'1 viên x 3 lần/ngày',dur:'2 tuần',ins:'Uống sau ăn',qty:2}], fee:150000, lab:{type:'Nội soi dạ dày',price:450000,result:'Niêm mạc dạ dày xung huyết, có 1 vết loét nhỏ đường kính ~0.5cm tại antrum'} },
  { sym:'Đau ngực trái, khó thở khi gắng sức', diag:'Tăng huyết áp độ II, nghi ngờ bệnh mạch vành', treat:'Dùng thuốc hạ áp, nghỉ ngơi', meds:[{i:7,dos:'1 viên x 1 lần/ngày',dur:'30 ngày',ins:'Uống sáng',qty:1},{i:8,dos:'1 viên x 1 lần/ngày',dur:'30 ngày',ins:'Uống tối sau ăn',qty:1},{i:13,dos:'1 viên x 1 lần/ngày',dur:'30 ngày',ins:'Uống sáng',qty:1}], fee:200000, lab:{type:'Điện tâm đồ',price:120000,result:'Nhịp xoang đều, tần số 78 lần/phút, trục điện tim bình thường'} },
  { sym:'Trẻ sốt 38.5°C, chảy mũi, ho nhiều', diag:'Viêm đường hô hấp trên cấp tính', treat:'Nghỉ ngơi, theo dõi sốt, tái khám nếu không hạ sốt', meds:[{i:0,dos:'1 viên x 3 lần/ngày',dur:'3 ngày',ins:'Uống sau ăn',qty:1},{i:15,dos:'1 viên x 3 lần/ngày',dur:'3 ngày',ins:'Uống sau ăn',qty:1}], fee:130000, lab:null },
  { sym:'Phát ban ngứa toàn thân, nổi mề đay', diag:'Dị ứng da - mề đay cấp', treat:'Tránh tiếp xúc dị nguyên, dùng thuốc kháng histamine', meds:[{i:4,dos:'1 viên x 1 lần/ngày',dur:'7 ngày',ins:'Uống tối',qty:1},{i:12,dos:'1 viên x 2 lần/ngày',dur:'5 ngày',ins:'Uống sau ăn',qty:1}], fee:120000, lab:null },
  { sym:'Tiểu nhiều, khát nước, mệt mỏi', diag:'Đái tháo đường type 2 mới phát hiện', treat:'Kiểm soát chế độ ăn, tập thể dục, dùng Metformin', meds:[{i:6,dos:'1 viên x 2 lần/ngày',dur:'30 ngày',ins:'Uống trong bữa ăn',qty:2}], fee:150000, lab:{type:'Xét nghiệm đường huyết HbA1c',price:180000,result:'Glucose đói: 9.2 mmol/L; HbA1c: 7.8%'} },
  { sym:'Đau đầu, chóng mặt, tê tay', diag:'Thiếu máu não cục bộ thoáng qua (TIA)', treat:'Dùng thuốc chống đông, theo dõi chặt', meds:[{i:14,dos:'1 viên x 1 lần/ngày',dur:'30 ngày',ins:'Uống sáng',qty:1},{i:9,dos:'1 viên x 2 lần/ngày',dur:'30 ngày',ins:'Uống sau ăn',qty:2}], fee:180000, lab:{type:'CT-Scan não',price:800000,result:'Không thấy tổn thương xuất huyết; hình ảnh thiếu máu nhẹ tại thùy đỉnh trái'} },
  { sym:'Khó thở, thở khò khè', diag:'Hen phế quản cơn nhẹ', treat:'Dùng thuốc giãn phế quản, tránh khói bụi', meds:[{i:11,dos:'1 viên x 3 lần/ngày',dur:'7 ngày',ins:'Uống sau ăn',qty:1}], fee:130000, lab:{type:'Đo chức năng hô hấp',price:200000,result:'FEV1/FVC = 68% (hội chứng tắc nghẽn nhẹ)'} },
  { sym:'Đau tai phải, nghe kém', diag:'Viêm tai giữa cấp tính', treat:'Kháng sinh, thuốc nhỏ tai, tái khám sau 7 ngày', meds:[{i:1,dos:'1 viên x 3 lần/ngày',dur:'7 ngày',ins:'Uống sau ăn',qty:2},{i:3,dos:'1 viên x 3 lần/ngày',dur:'5 ngày',ins:'Uống sau ăn',qty:1}], fee:130000, lab:null },
  { sym:'Mờ mắt, nhức mắt khi nhìn lâu', diag:'Khúc xạ không chỉnh, cận thị độ 3.5', treat:'Đeo kính cận, tái khám định kỳ 6 tháng', meds:[], fee:140000, lab:{type:'Kiểm tra thị lực',price:80000,result:'OD: -3.5D, OS: -3.25D. Không có bệnh lý đáy mắt'} },
  { sym:'Mụn nhiều vùng mặt, ngực, lưng', diag:'Mụn trứng cá mức độ trung bình', treat:'Vệ sinh da đúng cách, dùng kem bôi', meds:[{i:12,dos:'1 viên x 1 lần/ngày',dur:'14 ngày',ins:'Uống sáng',qty:1}], fee:120000, lab:null },
  { sym:'Đau bụng dưới bên phải', diag:'Viêm ruột thừa cấp độ 2', treat:'Phẫu thuật cắt ruột thừa nội soi', meds:[{i:19,dos:'1 viên x 2 lần/ngày',dur:'7 ngày',ins:'Uống sau ăn',qty:2},{i:0,dos:'2 viên x 4 lần/ngày',dur:'5 ngày',ins:'Uống sau ăn',qty:2}], fee:200000, lab:{type:'Siêu âm bụng',price:280000,result:'Ruột thừa to 10mm, thành dày, không thấy vỡ'} },
  { sym:'Thai 28 tuần, phù chân, HA cao', diag:'Tiền sản giật nhẹ - theo dõi sát', treat:'Nghỉ ngơi, hạn chế muối, dùng thuốc hạ áp', meds:[{i:24,dos:'1 viên x 2 lần/ngày',dur:'14 ngày',ins:'Uống sáng và chiều',qty:2},{i:17,dos:'1 viên x 1 lần/ngày',dur:'30 ngày',ins:'Uống sáng',qty:1}], fee:160000, lab:{type:'Xét nghiệm nước tiểu',price:80000,result:'Protein niệu 2+, không có tế bào trụ'} },
];

let qNum = 1;
const apptIds = [];
for (let ci = 0; ci < 45; ci++) {
  const cas = cases[ci % cases.length];
  const pat = patientObjs[ci % patientObjs.length];
  const daysAgo = -(ci * 2 + Math.floor(Math.random() * 3));
  const docPool = ci % 5 === 0 ? docTim : ci % 4 === 0 ? docNhi : ci % 3 === 0 ? docNgoai : docNoi;
  const doc = docPool[Math.floor(Math.random() * docPool.length)] || docNoi[0];
  const status = ci < 5 ? 'PENDING' : ci < 10 ? 'CONFIRMED' : 'COMPLETED';
  const type = pat.bhyt ? (ci % 3 === 0 ? 'BHYT' : 'SERVICE') : 'SERVICE';
  const apptId = uid();
  const apptDate = d(daysAgo, 8 + (ci % 8));

  insAppt.run(apptId, apptDate, status, null, cas.sym, status === 'COMPLETED' ? cas.diag : null, type, type === 'BHYT' ? pat.bhyt : null, qNum++, pat.userId, doc.doctorId, apptDate, apptDate);
  apptIds.push(apptId);

  if (status === 'COMPLETED') {
    // Medical record
    const mrId = uid();
    insMR.run(mrId, cas.diag, cas.treat, null, pat.userId, apptId, apptDate, apptDate);

    // Lab order
    let labFee = 0;
    if (cas.lab) {
      const labId = uid();
      labFee = cas.lab.price;
      insLab.run(labId, cas.lab.type, null, cas.lab.price, cas.lab.result, 'DONE', apptDate, apptDate, apptId, apptDate, apptDate);
    }

    // Prescription
    if (cas.meds.length > 0) {
      const presId = uid();
      insPres.run(presId, 'Uống thuốc đúng giờ, tái khám nếu không giảm sau 3 ngày', 'DISPENSED', apptId, apptDate, apptDate);
      for (const mi of cas.meds) {
        insPI.run(uid(), mi.dos, mi.dur, mi.ins, mi.qty, medObjs[mi.i].id, presId);
      }
    }

    // Invoice + payment
    const fee = doc.fee || 150000;
    const total = fee + labFee;
    const invId = uid();
    const invNo = padInv();
    insInv.run(invId, invNo, total, 0, total, 'PAID', null, null, apptId, apptDate, apptDate);
    insII.run(uid(), 'Phí khám bệnh', fee, 1, invId);
    if (labFee > 0) insII.run(uid(), cas.lab.type, labFee, 1, invId);
    const method = ci % 4 === 0 ? 'BANK_TRANSFER' : ci % 3 === 0 ? 'VNPAY' : 'CASH';
    insPay.run(uid(), total, 'PAID', method, ci % 3 === 0 ? `TXN${Date.now()}${ci}` : null, apptDate, apptId, apptDate, apptDate);
  }
}

// ===== INPATIENT RECORDS =====
console.log('🏠  Tạo hồ sơ nội trú...');
const insIP = db.prepare(`INSERT INTO InpatientRecord(id,admissionDate,dischargeDate,reason,status,notes,patientId,doctorId,roomBedId,createdAt,updatedAt) VALUES(?,?,?,?,?,?,?,?,?,?,?)`);
const insMO = db.prepare(`INSERT INTO MedicalOrder(id,orderText,status,inpatientRecordId,doctorId,createdAt,updatedAt) VALUES(?,?,?,?,?,?,?)`);

const inpatientCases = [
  { reason:'Nhồi máu cơ tim cấp STEMI, nhập viện cấp cứu', status:'DISCHARGED', days:-15, doc: docTim[0], orders:['Aspirin 100mg/ngày','Heparin TM liều điều trị','Monitor liên tục điện tâm đồ','Theo dõi men tim mỗi 8h'] },
  { reason:'Viêm phổi nặng, suy hô hấp độ 2', status:'DISCHARGED', days:-10, doc: docNoi[0], orders:['Kháng sinh Levofloxacin TM 500mg/ngày','Thở oxy 3L/phút qua cannula','Vật lý trị liệu hô hấp 2 lần/ngày','Đo SpO2 mỗi 4h'] },
  { reason:'Đột quỵ thiếu máu não cấp, liệt nửa người phải', status:'ADMITTED', days:-5, doc: doctorObjs.find(d=>d.dept==='Thần kinh'), orders:['Alteplase TM (tiêu sợi huyết)','Monitor huyết áp liên tục','Tập phục hồi chức năng 2 lần/ngày','Chế độ ăn lỏng qua sonde'] },
  { reason:'Viêm ruột thừa cấp - hậu phẫu cắt RT nội soi', status:'DISCHARGED', days:-7, doc: docNgoai[0], orders:['Kháng sinh Ceftriaxone 2g/ngày sau mổ','Giảm đau Paracetamol TTM','Chăm sóc vết mổ hàng ngày','Chế độ ăn lỏng 24h đầu'] },
  { reason:'Tiểu đường biến chứng nhiễm toan ceton', status:'DISCHARGED', days:-20, doc: docNoi[1], orders:['Insulin regular TM','Bù dịch NaCl 0.9% 2L/4h','Theo dõi điện giải mỗi 4h','Đo đường huyết mỗi 2h'] },
  { reason:'Gãy xương đùi, phẫu thuật đóng đinh nội tuỷ', status:'ADMITTED', days:-3, doc: docNgoai[1] || docNgoai[0], orders:['Kháng đông Enoxaparin 40mg/ngày','Kháng sinh dự phòng Cefazolin 1g','Vật lý trị liệu phục hồi sau mổ','Giảm đau theo thang điểm VAS'] },
];

const ipBeds = beds.filter(b=>b.roomName.includes('Nội') || b.roomName.includes('Tim') || b.roomName.includes('Thần') || b.roomName.includes('Ngoại'));
for (let i = 0; i < inpatientCases.length; i++) {
  const cas = inpatientCases[i];
  const pat = patientObjs[(i * 3) % patientObjs.length];
  const doc = cas.doc || docNoi[0];
  const admDate = d(cas.days);
  const disDate = cas.status === 'DISCHARGED' ? d(cas.days + 5) : null;
  const bed = ipBeds[i % ipBeds.length];
  const ipId = uid();
  insIP.run(ipId, admDate, disDate, cas.reason, cas.status, null, pat.userId, doc.doctorId, bed?.id || null, admDate, admDate);

  for (const orderText of cas.orders) {
    insMO.run(uid(), orderText, cas.status === 'DISCHARGED' ? 'DONE' : 'PENDING', ipId, doc.doctorId, admDate, admDate);
  }

  if (cas.status === 'DISCHARGED') {
    const days = 5;
    const roomRate = 200000;
    const total = days * roomRate;
    const invId = uid();
    const invNo = padInv();
    insInv.run(invId, invNo, total, 0, total, 'PAID', null, 'Chi phí giường nội trú', null, admDate, admDate);
    insII.run(uid(), `Tiền giường ${days} ngày`, roomRate, days, invId);
    insPay.run(uid(), total, 'PAID', 'CASH', null, disDate, null, disDate, disDate);
  }
}

// ===== SURGERY ORDERS =====
console.log('🔪  Tạo phiếu phẫu thuật...');
const insSurg = db.prepare(`INSERT INTO SurgeryOrder(id,surgeryName,scheduledDate,diagnosisBefore,status,patientId,doctorId,createdAt,updatedAt) VALUES(?,?,?,?,?,?,?,?,?)`);
const surgeries = [
  { name:'Cắt ruột thừa nội soi', date:d(-7), diag:'Viêm ruột thừa cấp độ 2', status:'COMPLETED', docIdx:2 },
  { name:'Đóng đinh nội tuỷ xương đùi phải', date:d(-3), diag:'Gãy xương đùi 1/3 giữa', status:'COMPLETED', docIdx:3 },
  { name:'Phẫu thuật đục thủy tinh thể mắt phải', date:d(3), diag:'Đục thủy tinh thể độ 3 mắt phải', status:'PENDING', docIdx:12 },
  { name:'Mổ lấy thai (C-section)', date:d(5), diag:'Thai 38 tuần, vỡ ối sớm', status:'PENDING', docIdx:6 },
];
for (const s of surgeries) {
  const pat = patientObjs[surgeries.indexOf(s) * 2 % patientObjs.length];
  const doc = doctorObjs[s.docIdx] || docNgoai[0];
  insSurg.run(uid(), s.name, s.date, s.diag, s.status, pat.userId, doc.doctorId, now, now);
}

// ===== ARTICLES =====
console.log('📰  Tạo bài viết tin tức...');
const insArt = db.prepare(`INSERT INTO Article(id,title,slug,excerpt,content,category,viewCount,authorId,createdAt,updatedAt) VALUES(?,?,?,?,?,?,?,?,?,?)`);
const articles = [
  { title:'Phòng chống bệnh sốt xuất huyết mùa mưa', slug:'phong-chong-sxh-mua-mua', cat:'MEDICAL', excerpt:'Mùa mưa năm nay, số ca sốt xuất huyết tăng đột biến. Bệnh viện Hùng Lợi khuyến cáo người dân cần thực hiện các biện pháp phòng ngừa tích cực.', views:1240 },
  { title:'Bệnh viện Hùng Lợi khai trương khoa Tim mạch can thiệp', slug:'khai-truong-khoa-tim-mach', cat:'ANNOUNCEMENT', excerpt:'Ngày 01/09/2025, Bệnh viện Đa khoa Hùng Lợi chính thức khai trương Khoa Tim Mạch Can Thiệp với trang thiết bị hiện đại.', views:3560 },
  { title:'Hướng dẫn tự kiểm tra dấu hiệu đột quỵ tại nhà', slug:'kiem-tra-dau-hieu-dot-quy', cat:'MEDICAL', excerpt:'Đột quỵ là một trong những nguyên nhân gây tử vong hàng đầu. Học cách nhận biết sớm có thể cứu sống người thân bạn.', views:5820 },
  { title:'Thông báo lịch nghỉ Tết Nguyên Đán 2026', slug:'lich-nghi-tet-2026', cat:'ANNOUNCEMENT', excerpt:'Bệnh viện thông báo lịch làm việc trong dịp Tết Nguyên Đán 2026. Khoa cấp cứu hoạt động 24/7.', views:2100 },
  { title:'Những điều cần biết về bệnh tiểu đường type 2', slug:'benh-tieu-duong-type-2', cat:'MEDICAL', excerpt:'Tiểu đường type 2 đang ngày càng phổ biến ở Việt Nam. Tìm hiểu nguyên nhân, triệu chứng và cách phòng ngừa.', views:4200 },
];
for (const a of articles) {
  insArt.run(uid(), a.title, a.slug, a.excerpt, a.excerpt + ' [Nội dung đầy đủ]', a.cat, a.views, adminId, d(-30), d(-10));
}

// ===== SUPPLIERS =====
console.log('🏭  Tạo nhà cung cấp...');
const insSup = db.prepare(`INSERT INTO Supplier(id,name,contactPerson,phone,email,address,city,taxCode,status,createdAt,updatedAt) VALUES(?,?,?,?,?,?,?,?,?,?,?)`);
const supIds = [];
const supDefs = [
  { name:'Công ty TNHH Dược Phẩm Việt Nam', person:'Nguyễn Văn Hà', phone:'028 3822 1111', email:'info@duocvn.vn', addr:'45 Đinh Tiên Hoàng, Q.1', city:'TP.HCM', tax:'0301234567' },
  { name:'Công ty Cổ phần Imexpharm', person:'Trần Thị Lan', phone:'028 3829 2222', email:'sales@imexpharm.vn', addr:'4 Bến Nghé, Q.7', city:'TP.HCM', tax:'0302345678' },
  { name:'Traphaco Miền Nam', person:'Lê Quốc Hùng', phone:'028 3930 3333', email:'mn@traphaco.vn', addr:'123 Nguyễn Thị Nhỏ, Q.11', city:'TP.HCM', tax:'0303456789' },
];
for (const s of supDefs) {
  const sid = uid();
  insSup.run(sid, s.name, s.person, s.phone, s.email, s.addr, s.city, s.tax, 'ACTIVE', now, now);
  supIds.push(sid);
}

// ===== SERVICE COMBOS =====
const insSC = db.prepare(`INSERT INTO ServiceCombo(id,name,description,price,status,createdAt,updatedAt) VALUES(?,?,?,?,?,?,?)`);
insSC.run(uid(),'Gói khám sức khỏe cơ bản','Khám tổng quát + XN máu cơ bản + Siêu âm bụng',500000,'ACTIVE',now,now);
insSC.run(uid(),'Gói khám sức khỏe toàn diện','Khám tổng quát + XN máu đầy đủ + Siêu âm + X-quang + ECG + Tư vấn',1200000,'ACTIVE',now,now);
insSC.run(uid(),'Gói thai sản trọn gói','10 lần khám thai + siêu âm màu + xét nghiệm tiền sản',3500000,'ACTIVE',now,now);
insSC.run(uid(),'Gói khám tim mạch nâng cao','Khám + ECG + Siêu âm tim + Holter 24h + Tư vấn chuyên sâu',1500000,'ACTIVE',now,now);

db.close();
console.log('\n✅ SEED HOÀN THÀNH!');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('👑 Admin:        admin@bvhungloi.vn    | Admin@123');
console.log('💰 Kế toán:     ketoan@bvhungloi.vn   | Ketoan@123');
console.log('💊 Dược 1:      duoc1@bvhungloi.vn    | Duoc@123');
console.log('💊 Dược 2:      duoc2@bvhungloi.vn    | Duoc@123');
console.log('👨‍⚕️ Bác sĩ:     bs.[ten]@bvhungloi.vn | Doctor@123');
console.log('🤱 Y tá:        yta[1-12]@bvhungloi.vn| Nurse@123');
console.log('🧑‍💼 Bệnh nhân:  bn01-bn15@gmail.com   | Patient@123');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
