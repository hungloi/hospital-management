const Database = require('better-sqlite3');
const { randomUUID } = require('crypto');
const db = new Database('./dev.db');

function ensureId(data) {
  if (!('id' in data) || !data.id) data.id = randomUUID();
  const now = new Date().toISOString();
  if (!('createdAt' in data) || !data.createdAt) data.createdAt = now;
  if (!('updatedAt' in data) || !data.updatedAt) data.updatedAt = now;
}

function upsert(table, uniqueCol, data) {
  const exists = db.prepare(`SELECT 1 FROM ${table} WHERE ${uniqueCol} = ? LIMIT 1`).get(data[uniqueCol]);
  if (!exists) {
    ensureId(data);
    const cols = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map(() => '?').join(', ');
    const values = Object.values(data);
    const stmt = db.prepare(`INSERT INTO ${table} (${cols}) VALUES (${placeholders})`);
    stmt.run(...values);
    return true;
  }
  return false;
}

function insert(table, data) {
  ensureId(data);
  const cols = Object.keys(data).join(', ');
  const placeholders = Object.keys(data).map(() => '?').join(', ');
  const values = Object.values(data);
  const stmt = db.prepare(`INSERT INTO ${table} (${cols}) VALUES (${placeholders})`);
  return stmt.run(...values);
}

try {
  console.log('🌱 Full SQL Seed started');

  // Departments
  const departments = [
    { name: 'Khoa Nội', description: 'Internal Medicine Department' },
    { name: 'Khoa Ngoại', description: 'Surgery Department' },
    { name: 'Khoa Nhi', description: 'Pediatrics Department' },
    { name: 'Khoa Tim Mạch', description: 'Cardiology Department' },
    { name: 'Khoa Hô Hấp', description: 'Respiratory Department' },
    { name: 'Khoa Tâm Thần', description: 'Psychiatry Department' },
    { name: 'Khoa Nhãn', description: 'Ophthalmology Department' },
    { name: 'Khoa Tai Mũi Họng', description: 'ENT Department' },
    { name: 'Khoa Sản Phụ Khoa', description: 'Obstetrics & Gynecology' },
    { name: 'Khoa Phục Hồi Chức Năng', description: 'Rehabilitation Department' },
  ];

  let count = 0;
  for (const d of departments) if (upsert('Department', 'name', d)) count++;
  console.log(`✅ Departments upserted: ${count}`);

  // Users (admin, doctors, patients)
  const users = [
    { email: 'admin@hospital.com', password: 'hashed_password', name: 'Quản Trị Viên', role: 'ADMIN', phone: '0901234567' },
    { email: 'doctor1@hospital.com', password: 'hashed_password', name: 'BS. Nguyễn Văn A', role: 'DOCTOR', phone: '0911111111' },
    { email: 'doctor2@hospital.com', password: 'hashed_password', name: 'BS. Trần Thị B', role: 'DOCTOR', phone: '0922222222' },
    { email: 'doctor3@hospital.com', password: 'hashed_password', name: 'BS. Lê Văn C', role: 'DOCTOR', phone: '0933333333' },
    { email: 'patient1@example.com', password: 'hashed_password', name: 'Bệnh nhân Trần Văn B', role: 'PATIENT', phone: '0923456789' },
  ];
  count = 0;
  for (const u of users) if (upsert('User', 'email', u)) count++;
  console.log(`✅ Users upserted: ${count}`);

  // Doctors (link users to departments)
  const deptIds = {};
  const deptRows = db.prepare('SELECT id, name FROM Department').all();
  for (const d of deptRows) deptIds[d.name] = d.id;

  const getUserId = (email) => {
    const r = db.prepare('SELECT id FROM User WHERE email = ?').get(email);
    return r ? r.id : null;
  };

  const doctors = [
    { email: 'doctor1@hospital.com', specialty: 'Nội tổng quát', dept: 'Khoa Nội', consultationFee: 250000 },
    { email: 'doctor2@hospital.com', specialty: 'Nhi khoa', dept: 'Khoa Nhi', consultationFee: 200000 },
    { email: 'doctor3@hospital.com', specialty: 'Ngoại tổng quát', dept: 'Khoa Ngoại', consultationFee: 300000 },
  ];
  count = 0;
  for (const d of doctors) {
    const userId = getUserId(d.email);
    if (!userId) continue;
    const exists = db.prepare('SELECT 1 FROM Doctor WHERE userId = ? LIMIT 1').get(userId);
    if (!exists) {
      insert('Doctor', { userId, specialty: d.specialty, departmentId: deptIds[d.dept] || null, consultationFee: d.consultationFee, bio: `Chuyên gia ${d.specialty}` });
      count++;
    }
  }
  console.log(`✅ Doctors inserted: ${count}`);

  // Medicines (~40)
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
    { name: 'Dextromethorphan 15mg', activeIngredient: 'Dextromethorphan', unit: 'Viên', category: 'COUGH', price: 4000, inventory: 500 },
    { name: 'Diphenhydramine 25mg', activeIngredient: 'Diphenhydramine', unit: 'Viên', category: 'COUGH', price: 3500, inventory: 400 },
    { name: 'Pseudoephedrine 60mg', activeIngredient: 'Pseudoephedrine', unit: 'Viên', category: 'COUGH', price: 5000, inventory: 300 },
    { name: 'Cough Syrup', activeIngredient: 'Compound cough mixture', unit: 'Lọ', category: 'COUGH', price: 15000, inventory: 100 },
    { name: 'Vitamin C 1000mg', activeIngredient: 'Ascorbic acid', unit: 'Viên', category: 'VITAMIN', price: 3000, inventory: 800 },
    { name: 'Vitamin B Complex', activeIngredient: 'B Vitamins', unit: 'Viên', category: 'VITAMIN', price: 4000, inventory: 600 },
    { name: 'Vitamin D 1000IU', activeIngredient: 'Cholecalciferol', unit: 'Viên', category: 'VITAMIN', price: 5000, inventory: 400 },
    { name: 'Iron Supplement', activeIngredient: 'Ferrous sulfate', unit: 'Viên', category: 'VITAMIN', price: 6000, inventory: 300 },
    { name: 'Calcium Carbonate 600mg', activeIngredient: 'Calcium', unit: 'Viên', category: 'VITAMIN', price: 5500, inventory: 350 },
    { name: 'Metformin 500mg', activeIngredient: 'Metformin', unit: 'Viên', category: 'DIABETES', price: 8000, inventory: 400 },
    { name: 'Glibenclamide 5mg', activeIngredient: 'Glibenclamide', unit: 'Viên', category: 'DIABETES', price: 6000, inventory: 250 },
    { name: 'Lisinopril 10mg', activeIngredient: 'Lisinopril', unit: 'Viên', category: 'HYPERTENSION', price: 7000, inventory: 350 },
    { name: 'Amlodipine 5mg', activeIngredient: 'Amlodipine', unit: 'Viên', category: 'HYPERTENSION', price: 8000, inventory: 300 },
    { name: 'Atenolol 50mg', activeIngredient: 'Atenolol', unit: 'Viên', category: 'HYPERTENSION', price: 7500, inventory: 280 },
    { name: 'Atorvastatin 20mg', activeIngredient: 'Atorvastatin', unit: 'Viên', category: 'CHOLESTEROL', price: 9000, inventory: 250 },
    { name: 'Simvastatin 20mg', activeIngredient: 'Simvastatin', unit: 'Viên', category: 'CHOLESTEROL', price: 8500, inventory: 200 },
  ];
  count = 0;
  for (const m of medicines) if (upsert('Medicine', 'name', m)) count++;
  console.log(`✅ Medicines upserted: ${count}`);

  // Medical supplies (~25)
  const supplies = [
    { name: 'Gauze Pad 4x4"', unit: 'Gói', category: 'BANDAGE', price: 5000, inventory: 500 },
    { name: 'Gauze Pad 2x2"', unit: 'Gói', category: 'BANDAGE', price: 2000, inventory: 800 },
    { name: 'Elastic Bandage 5cm', unit: 'Cuộn', category: 'BANDAGE', price: 8000, inventory: 200 },
    { name: 'Elastic Bandage 10cm', unit: 'Cuộn', category: 'BANDAGE', price: 12000, inventory: 150 },
    { name: 'Adhesive Tape', unit: 'Cuộn', category: 'BANDAGE', price: 6000, inventory: 250 },
    { name: 'Syringe 3ml', unit: 'Cái', category: 'NEEDLE', price: 1500, inventory: 2000 },
    { name: 'Syringe 5ml', unit: 'Cái', category: 'NEEDLE', price: 2000, inventory: 1500 },
    { name: 'Syringe 10ml', unit: 'Cái', category: 'NEEDLE', price: 2500, inventory: 1000 },
    { name: 'Needle 25G', unit: 'Cái', category: 'NEEDLE', price: 500, inventory: 5000 },
    { name: 'Needle 23G', unit: 'Cái', category: 'NEEDLE', price: 600, inventory: 4000 },
    { name: 'IV Catheter 18G', unit: 'Cái', category: 'NEEDLE', price: 8000, inventory: 300 },
    { name: 'IV Catheter 20G', unit: 'Cái', category: 'NEEDLE', price: 7000, inventory: 350 },
    { name: 'Latex Glove (S)', unit: 'Gói', category: 'GLOVE', price: 3000, inventory: 500 },
    { name: 'Latex Glove (M)', unit: 'Gói', category: 'GLOVE', price: 3000, inventory: 600 },
    { name: 'Latex Glove (L)', unit: 'Gói', category: 'GLOVE', price: 3000, inventory: 500 },
    { name: 'Nitrile Glove (M)', unit: 'Gói', category: 'GLOVE', price: 4000, inventory: 400 },
    { name: 'Cotton Ball', unit: 'Gói', category: 'COTTON', price: 2000, inventory: 800 },
    { name: 'Cotton Swab', unit: 'Gói', category: 'COTTON', price: 1500, inventory: 1000 },
    { name: 'Alcohol Prep Pad', unit: 'Gói', category: 'COTTON', price: 3000, inventory: 600 },
    { name: 'Betadine Solution', unit: 'Lọ', category: 'DISINFECTANT', price: 15000, inventory: 100 },
    { name: 'Hydrogen Peroxide 3%', unit: 'Lọ', category: 'DISINFECTANT', price: 10000, inventory: 150 },
    { name: 'Alcohol 70%', unit: 'Lọ', category: 'DISINFECTANT', price: 8000, inventory: 200 },
    { name: 'Surgical Mask', unit: 'Gói', category: 'MASK', price: 5000, inventory: 500 },
    { name: 'N95 Mask', unit: 'Gói', category: 'MASK', price: 12000, inventory: 200 },
    { name: 'Digital Thermometer', unit: 'Cái', category: 'EQUIPMENT', price: 25000, inventory: 50 },
  ];
  count = 0;
  for (const s of supplies) if (upsert('MedicalSupply', 'name', s)) count++;
  console.log(`✅ Medical supplies upserted: ${count}`);

  // Rooms (8)
  const roomData = [
    { name: 'Phòng 101', type: 'NORMAL', floor: 1, bed: 'Giường A', ratePerDay: 150000, status: 'AVAILABLE', description: 'NORMAL room - Tầng 1' },
    { name: 'Phòng 102', type: 'NORMAL', floor: 1, bed: 'Giường B', ratePerDay: 150000, status: 'AVAILABLE', description: 'NORMAL room - Tầng 1' },
    { name: 'Phòng 103', type: 'NORMAL', floor: 1, bed: 'Giường C', ratePerDay: 150000, status: 'AVAILABLE', description: 'NORMAL room - Tầng 1' },
    { name: 'Phòng VIP 201', type: 'VIP', floor: 2, bed: 'Giường VIP A', ratePerDay: 400000, status: 'AVAILABLE', description: 'VIP room - Tầng 2' },
    { name: 'Phòng VIP 202', type: 'VIP', floor: 2, bed: 'Giường VIP B', ratePerDay: 400000, status: 'AVAILABLE', description: 'VIP room - Tầng 2' },
    { name: 'Phòng ICU 301', type: 'ICU', floor: 3, bed: 'ICU Bed 1', ratePerDay: 600000, status: 'AVAILABLE', description: 'ICU - Tầng 3' },
    { name: 'Phòng ICU 302', type: 'ICU', floor: 3, bed: 'ICU Bed 2', ratePerDay: 600000, status: 'AVAILABLE', description: 'ICU - Tầng 3' },
    { name: 'Phòng Phẫu Thuật', type: 'SURGERY', floor: 3, bed: 'Surgery Table', ratePerDay: 1000000, status: 'AVAILABLE', description: 'Phòng phẫu thuật' },
  ];
  count = 0;
  for (const r of roomData) if (upsert('Room', 'name', r)) count++;
  console.log(`✅ Rooms upserted: ${count}`);

  // Room services
  const svcList = [
    { name: 'Điều hòa không khí', price: 20000 },
    { name: 'Truyền hình cáp', price: 15000 },
    { name: 'Internet WiFi', price: 10000 },
  ];
  count = 0;
  const roomsRows = db.prepare('SELECT id, name FROM Room').all();
  for (const room of roomsRows) {
    for (const svc of svcList) {
      const exists = db.prepare('SELECT 1 FROM RoomService WHERE roomId = ? AND name = ? LIMIT 1').get(room.id, svc.name);
      if (!exists) {
        insert('RoomService', { roomId: room.id, name: svc.name, price: svc.price, description: `${svc.name} cho ${room.name}` });
        count++;
      }
    }
  }
  console.log(`✅ Room services inserted: ${count}`);

  console.log('\n🎉 Full SQL seeding finished');
} catch (err) {
  console.error('❌ Full seed failed:', err.message);
  process.exit(1);
} finally {
  db.close();
}
