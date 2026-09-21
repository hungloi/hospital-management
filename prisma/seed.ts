import { prisma } from '../src/lib/prisma.ts';

async function main() {
  console.log('🌱 Bắt đầu seed dữ liệu...\n');

  // ========== DEPARTMENTS ==========
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
  const deptMap: Record<string, string> = {};
  for (const d of departments) {
    const dept = await prisma.department.create({ data: d });
    deptMap[d.name] = dept.id;
  }
  console.log('✅ Tạo 10 khoa khám\n');

  // ========== USERS & ADMIN ==========
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@hospital.com',
      password: 'hashed_password',
      name: 'Quản Trị Viên',
      role: 'ADMIN',
      phone: '0901234567',
    }
  });
  console.log('✅ Admin: admin@hospital.com / admin123\n');

  // ========== DOCTORS ==========
  const doctorUsers = [
    { email: 'doctor1@hospital.com', name: 'BS. Nguyễn Văn A', dept: 'Khoa Nội' },
    { email: 'doctor2@hospital.com', name: 'BS. Trần Thị B', dept: 'Khoa Nhi' },
    { email: 'doctor3@hospital.com', name: 'BS. Lê Văn C', dept: 'Khoa Ngoại' },
    { email: 'doctor4@hospital.com', name: 'BS. Phạm Thị D', dept: 'Khoa Tim Mạch' },
  ];
  for (const d of doctorUsers) {
    const user = await prisma.user.create({
      data: { email: d.email, password: 'hashed_password', name: d.name, role: 'DOCTOR' }
    });
    await prisma.doctor.create({
      data: {
        userId: user.id,
        specialty: d.name.split('. ')[1],
        departmentId: deptMap[d.dept],
        consultationFee: 250000,
        bio: `Chuyên gia ${d.dept}`,
      }
    });
  }
  console.log('✅ Tạo 4 bác sĩ\n');

  // ========== PATIENTS ==========
  await prisma.user.create({
    data: {
      email: 'patient1@example.com',
      password: 'hashed_password',
      name: 'Bệnh nhân Trần Văn B',
      role: 'PATIENT',
      phone: '0923456789',
    }
  });
  console.log('✅ Tạo bệnh nhân test\n');

  // ========== MEDICINES (40+) ==========
  const medicines = [
    // Antibiotics (5)
    { name: 'Amoxicillin 500mg', activeIngredient: 'Amoxicillin', unit: 'Viên', category: 'ANTIBIOTICS', price: 5000, inventory: 500 },
    { name: 'Cephalexin 500mg', activeIngredient: 'Cephalexin', unit: 'Viên', category: 'ANTIBIOTICS', price: 8000, inventory: 300 },
    { name: 'Azithromycin 250mg', activeIngredient: 'Azithromycin', unit: 'Viên', category: 'ANTIBIOTICS', price: 7000, inventory: 250 },
    { name: 'Ciprofloxacin 500mg', activeIngredient: 'Ciprofloxacin', unit: 'Viên', category: 'ANTIBIOTICS', price: 9000, inventory: 200 },
    { name: 'Ceftriaxone 1g', activeIngredient: 'Ceftriaxone', unit: 'Ống', category: 'ANTIBIOTICS', price: 15000, inventory: 100 },

    // Pain Relief (5)
    { name: 'Ibuprofen 400mg', activeIngredient: 'Ibuprofen', unit: 'Viên', category: 'PAIN', price: 3000, inventory: 800 },
    { name: 'Paracetamol 500mg', activeIngredient: 'Paracetamol', unit: 'Viên', category: 'PAIN', price: 2000, inventory: 1000 },
    { name: 'Aspirin 500mg', activeIngredient: 'Acetylsalicylic acid', unit: 'Viên', category: 'PAIN', price: 2500, inventory: 600 },
    { name: 'Naproxen 250mg', activeIngredient: 'Naproxen', unit: 'Viên', category: 'PAIN', price: 4000, inventory: 400 },
    { name: 'Tramadol 50mg', activeIngredient: 'Tramadol', unit: 'Viên', category: 'PAIN', price: 6000, inventory: 200 },

    // Fever (4)
    { name: 'Acetaminophen 500mg', activeIngredient: 'Acetaminophen', unit: 'Viên', category: 'FEVER', price: 2500, inventory: 700 },
    { name: 'Ibuprofen 200mg', activeIngredient: 'Ibuprofen', unit: 'Viên', category: 'FEVER', price: 2000, inventory: 900 },
    { name: 'Metamizole 500mg', activeIngredient: 'Metamizole', unit: 'Viên', category: 'FEVER', price: 3000, inventory: 500 },
    { name: 'Paracetamol Syrup', activeIngredient: 'Paracetamol', unit: 'Lọ', category: 'FEVER', price: 12000, inventory: 150 },

    // Allergy (4)
    { name: 'Cetirizine 10mg', activeIngredient: 'Cetirizine', unit: 'Viên', category: 'ALLERGY', price: 4000, inventory: 400 },
    { name: 'Loratadine 10mg', activeIngredient: 'Loratadine', unit: 'Viên', category: 'ALLERGY', price: 4500, inventory: 350 },
    { name: 'Chlorpheniramine 4mg', activeIngredient: 'Chlorpheniramine', unit: 'Viên', category: 'ALLERGY', price: 3500, inventory: 450 },
    { name: 'Fexofenadine 180mg', activeIngredient: 'Fexofenadine', unit: 'Viên', category: 'ALLERGY', price: 5000, inventory: 300 },

    // Digestive (5)
    { name: 'Omeprazole 20mg', activeIngredient: 'Omeprazole', unit: 'Viên', category: 'DIGESTIVE', price: 7000, inventory: 300 },
    { name: 'Ranitidine 150mg', activeIngredient: 'Ranitidine', unit: 'Viên', category: 'DIGESTIVE', price: 5000, inventory: 250 },
    { name: 'Metoclopramide 10mg', activeIngredient: 'Metoclopramide', unit: 'Viên', category: 'DIGESTIVE', price: 3000, inventory: 400 },
    { name: 'Loperamide 2mg', activeIngredient: 'Loperamide', unit: 'Viên', category: 'DIGESTIVE', price: 2500, inventory: 350 },
    { name: 'Simethicone 80mg', activeIngredient: 'Simethicone', unit: 'Viên', category: 'DIGESTIVE', price: 3500, inventory: 500 },

    // Cough & Cold (4)
    { name: 'Dextromethorphan 15mg', activeIngredient: 'Dextromethorphan', unit: 'Viên', category: 'COUGH', price: 4000, inventory: 500 },
    { name: 'Diphenhydramine 25mg', activeIngredient: 'Diphenhydramine', unit: 'Viên', category: 'COUGH', price: 3500, inventory: 400 },
    { name: 'Pseudoephedrine 60mg', activeIngredient: 'Pseudoephedrine', unit: 'Viên', category: 'COUGH', price: 5000, inventory: 300 },
    { name: 'Cough Syrup', activeIngredient: 'Compound cough mixture', unit: 'Lọ', category: 'COUGH', price: 15000, inventory: 100 },

    // Vitamins (5)
    { name: 'Vitamin C 1000mg', activeIngredient: 'Ascorbic acid', unit: 'Viên', category: 'VITAMIN', price: 3000, inventory: 800 },
    { name: 'Vitamin B Complex', activeIngredient: 'B Vitamins', unit: 'Viên', category: 'VITAMIN', price: 4000, inventory: 600 },
    { name: 'Vitamin D 1000IU', activeIngredient: 'Cholecalciferol', unit: 'Viên', category: 'VITAMIN', price: 5000, inventory: 400 },
    { name: 'Iron Supplement', activeIngredient: 'Ferrous sulfate', unit: 'Viên', category: 'VITAMIN', price: 6000, inventory: 300 },
    { name: 'Calcium Carbonate 600mg', activeIngredient: 'Calcium', unit: 'Viên', category: 'VITAMIN', price: 5500, inventory: 350 },

    // Diabetes (2)
    { name: 'Metformin 500mg', activeIngredient: 'Metformin', unit: 'Viên', category: 'DIABETES', price: 8000, inventory: 400 },
    { name: 'Glibenclamide 5mg', activeIngredient: 'Glibenclamide', unit: 'Viên', category: 'DIABETES', price: 6000, inventory: 250 },

    // Hypertension (3)
    { name: 'Lisinopril 10mg', activeIngredient: 'Lisinopril', unit: 'Viên', category: 'HYPERTENSION', price: 7000, inventory: 350 },
    { name: 'Amlodipine 5mg', activeIngredient: 'Amlodipine', unit: 'Viên', category: 'HYPERTENSION', price: 8000, inventory: 300 },
    { name: 'Atenolol 50mg', activeIngredient: 'Atenolol', unit: 'Viên', category: 'HYPERTENSION', price: 7500, inventory: 280 },

    // Cholesterol (2)
    { name: 'Atorvastatin 20mg', activeIngredient: 'Atorvastatin', unit: 'Viên', category: 'CHOLESTEROL', price: 9000, inventory: 250 },
    { name: 'Simvastatin 20mg', activeIngredient: 'Simvastatin', unit: 'Viên', category: 'CHOLESTEROL', price: 8500, inventory: 200 },
  ];

  for (const m of medicines) {
    await prisma.medicine.create({ data: m });
  }
  console.log(`✅ Tạo ${medicines.length} loại thuốc\n`);

  // ========== MEDICAL SUPPLIES (25+) ==========
  const supplies = [
    // Bandages
    { name: 'Gauze Pad 4x4"', unit: 'Gói', category: 'BANDAGE', price: 5000, inventory: 500 },
    { name: 'Gauze Pad 2x2"', unit: 'Gói', category: 'BANDAGE', price: 2000, inventory: 800 },
    { name: 'Elastic Bandage 5cm', unit: 'Cuộn', category: 'BANDAGE', price: 8000, inventory: 200 },
    { name: 'Elastic Bandage 10cm', unit: 'Cuộn', category: 'BANDAGE', price: 12000, inventory: 150 },
    { name: 'Adhesive Tape', unit: 'Cuộn', category: 'BANDAGE', price: 6000, inventory: 250 },

    // Syringes & Needles
    { name: 'Syringe 3ml', unit: 'Cái', category: 'NEEDLE', price: 1500, inventory: 2000 },
    { name: 'Syringe 5ml', unit: 'Cái', category: 'NEEDLE', price: 2000, inventory: 1500 },
    { name: 'Syringe 10ml', unit: 'Cái', category: 'NEEDLE', price: 2500, inventory: 1000 },
    { name: 'Needle 25G', unit: 'Cái', category: 'NEEDLE', price: 500, inventory: 5000 },
    { name: 'Needle 23G', unit: 'Cái', category: 'NEEDLE', price: 600, inventory: 4000 },
    { name: 'IV Catheter 18G', unit: 'Cái', category: 'NEEDLE', price: 8000, inventory: 300 },
    { name: 'IV Catheter 20G', unit: 'Cái', category: 'NEEDLE', price: 7000, inventory: 350 },

    // Gloves
    { name: 'Latex Glove (S)', unit: 'Gói', category: 'GLOVE', price: 3000, inventory: 500 },
    { name: 'Latex Glove (M)', unit: 'Gói', category: 'GLOVE', price: 3000, inventory: 600 },
    { name: 'Latex Glove (L)', unit: 'Gói', category: 'GLOVE', price: 3000, inventory: 500 },
    { name: 'Nitrile Glove (M)', unit: 'Gói', category: 'GLOVE', price: 4000, inventory: 400 },

    // Cotton & Swabs
    { name: 'Cotton Ball', unit: 'Gói', category: 'COTTON', price: 2000, inventory: 800 },
    { name: 'Cotton Swab', unit: 'Gói', category: 'COTTON', price: 1500, inventory: 1000 },
    { name: 'Alcohol Prep Pad', unit: 'Gói', category: 'COTTON', price: 3000, inventory: 600 },

    // Disinfectant
    { name: 'Betadine Solution', unit: 'Lọ', category: 'DISINFECTANT', price: 15000, inventory: 100 },
    { name: 'Hydrogen Peroxide 3%', unit: 'Lọ', category: 'DISINFECTANT', price: 10000, inventory: 150 },
    { name: 'Alcohol 70%', unit: 'Lọ', category: 'DISINFECTANT', price: 8000, inventory: 200 },

    // Masks & Equipment
    { name: 'Surgical Mask', unit: 'Gói', category: 'MASK', price: 5000, inventory: 500 },
    { name: 'N95 Mask', unit: 'Gói', category: 'MASK', price: 12000, inventory: 200 },
    { name: 'Digital Thermometer', unit: 'Cái', category: 'EQUIPMENT', price: 25000, inventory: 50 },
  ];

  for (const s of supplies) {
    await prisma.medicalSupply.create({ data: s });
  }
  console.log(`✅ Tạo ${supplies.length} loại vật tư y tế\n`);

  // ========== ROOMS (8 phòng) ==========
  const roomData = [
    { name: 'Phòng 101', type: 'NORMAL', floor: 1, bed: 'Giường A', ratePerDay: 150000 },
    { name: 'Phòng 102', type: 'NORMAL', floor: 1, bed: 'Giường B', ratePerDay: 150000 },
    { name: 'Phòng 103', type: 'NORMAL', floor: 1, bed: 'Giường C', ratePerDay: 150000 },
    { name: 'Phòng VIP 201', type: 'VIP', floor: 2, bed: 'Giường VIP A', ratePerDay: 400000 },
    { name: 'Phòng VIP 202', type: 'VIP', floor: 2, bed: 'Giường VIP B', ratePerDay: 400000 },
    { name: 'Phòng ICU 301', type: 'ICU', floor: 3, bed: 'ICU Bed 1', ratePerDay: 600000 },
    { name: 'Phòng ICU 302', type: 'ICU', floor: 3, bed: 'ICU Bed 2', ratePerDay: 600000 },
    { name: 'Phòng Phẫu Thuật', type: 'SURGERY', floor: 3, bed: 'Surgery Table', ratePerDay: 1000000 },
  ];

  const rooms: any[] = [];
  for (const r of roomData) {
    const { bed, ...rest } = r;
    const room = await prisma.room.create({
      data: { 
        ...rest, 
        status: 'AVAILABLE', 
        description: `${r.type} room - Tầng ${r.floor}`,
        beds: bed ? {
          create: {
            bedNumber: bed,
            status: 'AVAILABLE'
          }
        } : undefined
      }
    });
    rooms.push(room);
  }
  console.log(`✅ Tạo ${rooms.length} phòng bệnh\n`);

  // ========== ROOM SERVICES ==========
  // Services for all rooms
  const services = [
    { name: 'Điều hòa không khí', price: 20000 },
    { name: 'Truyền hình cáp', price: 15000 },
    { name: 'Internet WiFi', price: 10000 },
  ];

  for (const room of rooms) {
    for (const svc of services) {
      await prisma.roomService.create({
        data: { ...svc, roomId: room.id, description: `${svc.name} cho ${room.name}` }
      });
    }
  }
  console.log('✅ Tạo dịch vụ phòng\n');

  console.log('\n🎉 Seed hoàn tất!\n');
  console.log('╔════════════════════════════════════════════╗');
  console.log('║        TÀI KHOẢN TEST HỆ THỐNG             ║');
  console.log('╠════════════════════════════════════════════╣');
  console.log('║ ADMIN:     admin@hospital.com              ║');
  console.log('║ BÁC SĨ:    doctor1@hospital.com            ║');
  console.log('║ BỆNH NHÂN: patient1@example.com            ║');
  console.log('║ PASSWORD:  Bất kỳ (hệ thống test)           ║');
  console.log('╠════════════════════════════════════════════╣');
  console.log(`║ ✅ ${medicines.length} loại thuốc                                   ║`);
  console.log(`║ ✅ ${supplies.length} vật tư y tế                               ║`);
  console.log(`║ ✅ ${rooms.length} phòng bệnh + dịch vụ                        ║`);
  console.log('╚════════════════════════════════════════════╝\n');
}

main().catch(console.error).finally(() => prisma.$disconnect());
