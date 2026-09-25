/**
 * MASTER SEED SCRIPT — Bệnh viện Đa khoa Hưng Lợi
 * Chạy: node prisma/seed.js
 *
 * Script này tạo toàn bộ dữ liệu mẫu:
 *  1. Tài khoản Admin
 *  2. 50 Khoa / Phòng ban
 *  3. ~1500 Nhân sự (BS, Y tá, KTV, Nhân viên, Dược sĩ, Kế toán)
 *  4. ~3000 Phòng bệnh (Thường / Dịch vụ / VIP) + Giường + Tiện nghi
 */

const Database = require('better-sqlite3');
const bcrypt   = require('bcryptjs');
const { randomUUID } = require('crypto');
const path = require('path');

const DB_PATH = path.resolve(__dirname, '..', 'hospital.db');
const db = new Database(DB_PATH);
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

const now = new Date().toISOString();
const hash = (pwd) => bcrypt.hashSync(pwd, 10);

// ─── Helpers ───────────────────────────────────────────────────────────────
const lastNames   = ['Nguyễn','Trần','Lê','Phạm','Hoàng','Huỳnh','Phan','Vũ','Võ','Đặng','Bùi','Đỗ','Hồ','Ngô','Dương','Lý'];
const midM  = ['Văn','Hữu','Đình','Xuân','Minh','Hoàng','Thanh','Đức','Trọng','Thành','Công','Hải'];
const midF  = ['Thị','Thu','Ngọc','Phương','Thanh','Hồng','Mai','Bích','Kim','Diệu','Thúy'];
const firstM= ['Anh','Tuấn','Dũng','Hùng','Minh','Hải','Thành','Bảo','Khoa','Kiên','Phong','Quân','Tùng','Đạt','Lâm','Nam','Long','Cường','Thắng'];
const firstF= ['Anh','Linh','Trang','Hương','Lan','Hoa','Ngọc','Thảo','Nhung','Quỳnh','Oanh','Yến','Nga','Vy','My','Hiền','Thủy','Mai'];
const rand  = arr => arr[Math.floor(Math.random() * arr.length)];

function genName() {
  const m = Math.random() > 0.5;
  return { name: `${rand(lastNames)} ${rand(m?midM:midF)} ${rand(m?firstM:firstF)}`, gender: m ? 'MALE' : 'FEMALE' };
}
function genEmail(name, tag) {
  const clean = name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').replace(/\s+/g,'').toLowerCase();
  return `${clean}.${Math.floor(Math.random()*9000)+1000}.${tag}@bvhungloi.vn`;
}

// ─── Department filters (mirrors frontend logic) ────────────────────────────
const isNonMedical  = n => n.startsWith('Phòng') || n.startsWith('Trung tâm') || ['Khoa Dược','Khoa Kiểm soát nhiễm khuẩn','Khoa Dinh dưỡng - Tiết chế'].includes(n);
const isSubclinical = n => ["Khoa Xét nghiệm","Khoa Giải phẫu bệnh","Khoa Chẩn đoán hình ảnh","Khoa Nội soi & Thăm dò chức năng","Khoa Huyết học truyền máu","Khoa Y học hạt nhân"].includes(n);
const isOutpatient  = n => n.includes("Khoa Khám bệnh") || n.includes("Khoa Khám theo yêu cầu");
const canHaveRooms  = n => !isNonMedical(n) && !isSubclinical(n) && !isOutpatient(n);
const isHeavy       = n => n.includes('Cấp cứu') || n.includes('ICU') || n.includes('Hồi sức') || n.includes('Phẫu thuật') || n.includes('Khám bệnh');

// ─── Room statuses ────────────────────────────────────────────────────────
const ROOM_STATUSES = ['AVAILABLE','AVAILABLE','AVAILABLE','OCCUPIED','OCCUPIED','MAINTENANCE'];
const BED_STATUSES  = ['AVAILABLE','AVAILABLE','OCCUPIED','OCCUPIED','MAINTENANCE','RESERVED'];

// ─── VIP / Service amenities ───────────────────────────────────────────────
const VIP_SVC = [
  { name:'Điều hòa 2 chiều Inverter', description:'Điều hòa cao cấp 12000 BTU', price:120000 },
  { name:'Smart TV 50"',              description:'Android TV 4K 50 inch',        price:100000 },
  { name:'Tủ lạnh mini 60L',          description:'Tủ lạnh riêng tiện nghi',     price:70000  },
  { name:'Wifi tốc độ cao riêng',     description:'Cáp quang tốc độ cao',         price:60000  },
  { name:'Phòng tắm WC khép kín',     description:'Nhà vệ sinh nóng lạnh riêng', price:0      },
  { name:'Sofa giường phụ',           description:'Sofa gập cho người thân',      price:80000  },
  { name:'Bữa ăn dinh dưỡng',         description:'Thực đơn 3 bữa/ngày',         price:200000 },
  { name:'Két an toàn',               description:'Két sắt mini bảo quản đồ',    price:30000  },
];
const SVC_SVC = [
  { name:'Điều hòa nhiệt độ',   description:'Điều hòa 1 chiều',            price:80000 },
  { name:'Tivi LCD 32"',        description:'TV màn hình phẳng 32 inch',   price:60000 },
  { name:'Wifi',                description:'Wifi dùng chung',             price:40000 },
  { name:'Tủ đầu giường riêng', description:'Tủ đầu giường có khoá',      price:0     },
];

// ─── Prepared statements ───────────────────────────────────────────────────
const insUser = db.prepare(`INSERT INTO User (id,email,password,name,role,gender,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?)`);
const insDoc  = db.prepare(`INSERT INTO Doctor (id,specialty,userId,departmentId,createdAt,updatedAt) VALUES (?,?,?,?,?,?)`);
const insNurs = db.prepare(`INSERT INTO Nurse (id,userId,departmentId,position,createdAt,updatedAt) VALUES (?,?,?,?,?,?)`);
const insDept = db.prepare(`INSERT INTO Department (id,name,createdAt,updatedAt) VALUES (?,?,?,?)`);
const insRoom = db.prepare(`INSERT INTO Room (id,name,type,status,floor,capacity,ratePerDay,departmentId,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?)`);
const insBed  = db.prepare(`INSERT INTO RoomBed (id,bedNumber,status,roomId,createdAt,updatedAt) VALUES (?,?,?,?,?,?)`);
const insSvc  = db.prepare(`INSERT INTO RoomService (id,name,description,price,roomId,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?)`);

// ════════════════════════════════════════════════════════════════════════════
console.log('\n🌱 BẮT ĐẦU SEED TOÀN BỘ DỮ LIỆU...\n');

// BƯỚC 0: Xóa dữ liệu cũ (giữ nguyên schema)
db.prepare("DELETE FROM RoomService").run();
db.prepare("DELETE FROM RoomBed").run();
db.prepare("DELETE FROM Room").run();
db.prepare("DELETE FROM Nurse").run();
db.prepare("DELETE FROM Doctor").run();
db.prepare("DELETE FROM User WHERE role != 'ADMIN'").run();
db.prepare("DELETE FROM Department").run();
console.log('🗑️  Đã xóa dữ liệu cũ (giữ Admin).');

// ════════════════════════════════════════════════════════════════════════════
// BƯỚC 1: ADMIN
// ════════════════════════════════════════════════════════════════════════════
const adminExists = db.prepare("SELECT id FROM User WHERE role='ADMIN'").get();
if (!adminExists) {
  insUser.run(randomUUID(), 'admin@bvhungloi.vn', hash('Admin@123'), 'admin', 'ADMIN', 'MALE', now, now);
  console.log('👑 Tạo tài khoản Admin: admin@bvhungloi.vn / Admin@123');
} else {
  db.prepare("UPDATE User SET name='admin', email='admin@bvhungloi.vn' WHERE role='ADMIN'").run();
  console.log('👑 Cập nhật tài khoản Admin');
}

// ════════════════════════════════════════════════════════════════════════════
// BƯỚC 2: KHOA / PHÒNG BAN (50 đơn vị)
// ════════════════════════════════════════════════════════════════════════════
const DEPARTMENTS = [
  "Khoa Khám bệnh","Khoa Khám theo yêu cầu / VIP / Chuyên gia",
  "Khoa Cấp cứu & Chống độc","Khoa Cấp cứu lưu",
  "Khoa Nội tổng hợp","Khoa Nội Tim mạch & Can thiệp mạch",
  "Khoa Nội Tiêu hóa - Gan mật","Khoa Nội Tiết","Khoa Thận nhân tạo","Khoa Thận - Tiết niệu",
  "Khoa Hô hấp","Khoa Cơ - Xương - Khớp","Khoa Thần kinh & Đơn vị Đột quỵ",
  "Khoa Bệnh Nhiệt đới & Truyền nhiễm","Khoa Y học cổ truyền & Phục hồi chức năng",
  "Khoa Lão khoa & Chăm sóc giảm nhẹ","Khoa Ngoại tổng hợp","Khoa Ngoại Gan - Mật - Tụy",
  "Khoa Ngoại Thần kinh","Khoa Ngoại Lồng ngực - Mạch máu","Khoa Ngoại Tiết niệu",
  "Khoa Chấn thương chỉnh hình","Khoa Bỏng & Tạo hình thẩm mỹ",
  "Khoa Phẫu thuật - Gây mê hồi sức","Khoa Hồi sức tích cực (ICU)","Khoa Ung bướu & Xạ trị",
  "Khoa Phụ sản","Khoa Nhi & Sơ sinh (NICU)","Khoa Mắt","Khoa Tai - Mũi - Họng",
  "Khoa Răng - Hàm - Mặt","Khoa Da liễu","Khoa Y học hạt nhân","Khoa Xét nghiệm",
  "Khoa Giải phẫu bệnh","Khoa Chẩn đoán hình ảnh","Khoa Nội soi & Thăm dò chức năng",
  "Khoa Huyết học truyền máu","Đơn nguyên Ghép tạng","Khoa Dược",
  "Khoa Kiểm soát nhiễm khuẩn","Khoa Dinh dưỡng - Tiết chế",
  "Phòng Kế hoạch Tổng hợp","Phòng Tài chính - Kế toán","Phòng Tổ chức Cán bộ",
  "Phòng Vật tư - Thiết bị y tế","Phòng Điều dưỡng","Phòng Công nghệ thông tin",
  "Phòng Quản lý chất lượng & Chăm sóc khách hàng","Trung tâm Đào tạo & Chỉ đạo tuyến",
];

const deptMap = {};
db.transaction(() => {
  for (const name of DEPARTMENTS) {
    const id = randomUUID();
    insDept.run(id, name, now, now);
    deptMap[name] = id;
  }
})();
console.log(`🏢 Tạo ${DEPARTMENTS.length} Khoa/Phòng ban`);

// ════════════════════════════════════════════════════════════════════════════
// BƯỚC 3: NHÂN SỰ
// ════════════════════════════════════════════════════════════════════════════
const adminHash = hash('password123');
let docCount=0, nurseCount=0, staffCount=0;

db.transaction(() => {
  for (const deptName of DEPARTMENTS) {
    const deptId = deptMap[deptName];
    if (!deptId) continue;

    const isNM  = isNonMedical(deptName);
    const isSub = isSubclinical(deptName);
    const isHvy = isHeavy(deptName);
    const isPharm = deptName === 'Khoa Dược';
    const isSpecialStaff = ['Khoa Kiểm soát nhiễm khuẩn','Khoa Dinh dưỡng - Tiết chế'].includes(deptName);

    if (isNM && !isPharm && !isSpecialStaff) {
      // Back-office
      const role = (deptName.includes('Kế toán') || deptName.includes('Tài chính')) ? 'ACCOUNTANT' : 'STAFF';
      const num = Math.floor(Math.random()*6)+10;
      for (let i=0; i<num; i++) {
        const { name, gender } = genName();
        const uid = randomUUID();
        insUser.run(uid, genEmail(name, role), adminHash, name, role, gender, now, now);
        insDoc.run(randomUUID(), i===0?'Trưởng phòng':i===1?'Phó phòng':'Nhân viên', uid, deptId, now, now);
        staffCount++;
      }
    } else if (isPharm) {
      const num = Math.floor(Math.random()*6)+10;
      for (let i=0; i<num; i++) {
        const { name, gender } = genName();
        const uid = randomUUID();
        insUser.run(uid, genEmail(name,'PHARMACIST'), adminHash, name, 'PHARMACIST', gender, now, now);
        insDoc.run(randomUUID(), i===0?'Trưởng khoa Dược':i===1?'Phó khoa Dược':'Dược sĩ', uid, deptId, now, now);
        staffCount++;
      }
    } else if (isSpecialStaff) {
      for (let i=0; i<8; i++) {
        const { name, gender } = genName();
        const uid = randomUUID();
        insUser.run(uid, genEmail(name,'STAFF'), adminHash, name, 'STAFF', gender, now, now);
        insDoc.run(randomUUID(), i===0?'Trưởng khoa':'Chuyên viên', uid, deptId, now, now);
        staffCount++;
      }
    } else if (isSub) {
      // Cận lâm sàng: 4 BS + 15 KTV
      for (let i=0; i<4; i++) {
        const { name, gender } = genName();
        const uid = randomUUID();
        insUser.run(uid, genEmail(name,'DOCTOR'), adminHash, `BS. ${name}`, 'DOCTOR', gender, now, now);
        insDoc.run(randomUUID(), i===0?'Trưởng khoa':i===1?'Phó khoa':'Bác sĩ chuyên khoa', uid, deptId, now, now);
        docCount++;
      }
      for (let i=0; i<15; i++) {
        const { name, gender } = genName();
        const uid = randomUUID();
        insUser.run(uid, genEmail(name,'STAFF'), adminHash, name, 'STAFF', gender, now, now);
        insDoc.run(randomUUID(), i===0?'Kỹ thuật viên trưởng':'Kỹ thuật viên', uid, deptId, now, now);
        staffCount++;
      }
    } else if (isHvy) {
      // Cấp cứu/ICU/Mổ/Khám bệnh: 20-30 BS, 40-60 Y tá
      const numD = Math.floor(Math.random()*11)+20;
      for (let i=0; i<numD; i++) {
        const { name, gender } = genName();
        const uid = randomUUID();
        insUser.run(uid, genEmail(name,'DOCTOR'), adminHash, `BS. ${name}`, 'DOCTOR', gender, now, now);
        insDoc.run(randomUUID(), i===0?'Trưởng khoa':i<=2?'Phó khoa':'Bác sĩ điều trị', uid, deptId, now, now);
        docCount++;
      }
      const numN = Math.floor(Math.random()*21)+40;
      for (let i=0; i<numN; i++) {
        const { name, gender } = genName();
        const uid = randomUUID();
        insUser.run(uid, genEmail(name,'NURSE'), adminHash, `YT. ${name}`, 'NURSE', gender, now, now);
        insNurs.run(randomUUID(), uid, deptId, i===0?'Y tá trưởng':i<=2?'Phó y tá trưởng':'Y tá', now, now);
        nurseCount++;
      }
    } else {
      // Lâm sàng tiêu chuẩn: 8-13 BS, 15-25 Y tá
      const numD = Math.floor(Math.random()*6)+8;
      for (let i=0; i<numD; i++) {
        const { name, gender } = genName();
        const uid = randomUUID();
        insUser.run(uid, genEmail(name,'DOCTOR'), adminHash, `BS. ${name}`, 'DOCTOR', gender, now, now);
        insDoc.run(randomUUID(), i===0?'Trưởng khoa':i===1?'Phó khoa':'Bác sĩ điều trị', uid, deptId, now, now);
        docCount++;
      }
      const numN = Math.floor(Math.random()*11)+15;
      for (let i=0; i<numN; i++) {
        const { name, gender } = genName();
        const uid = randomUUID();
        insUser.run(uid, genEmail(name,'NURSE'), adminHash, `YT. ${name}`, 'NURSE', gender, now, now);
        insNurs.run(randomUUID(), uid, deptId, i===0?'Y tá trưởng':i===1?'Phó y tá trưởng':'Y tá', now, now);
        nurseCount++;
      }
    }
  }
})();
console.log(`👨‍⚕️ Bác sĩ: ${docCount}  👩‍⚕️ Y tá: ${nurseCount}  👨‍💼 NV/KTV/Dược: ${staffCount}`);

// ════════════════════════════════════════════════════════════════════════════
// BƯỚC 4: PHÒNG BỆNH (mục tiêu ~3000 phòng)
// ════════════════════════════════════════════════════════════════════════════
const clinicalDepts = DEPARTMENTS.filter(n => canHaveRooms(n));
const TARGET = 3000;
const perDept = Math.ceil(TARGET / clinicalDepts.length);
let roomCount=0, bedCount=0, svcCount=0;

db.transaction(() => {
  for (const deptName of clinicalDepts) {
    const deptId = deptMap[deptName];
    const uid4 = deptId.slice(-4).toUpperCase();
    const short = deptName.replace('Khoa ','').substring(0,6).replace(/\s+/g,'').toUpperCase();
    const isEM = isHeavy(deptName);

    const numVip    = isEM ? 0 : Math.floor(perDept * 0.20);
    const numSvc    = isEM ? 0 : Math.floor(perDept * 0.20);
    const numNormal = perDept - numVip - numSvc;
    let idx = 1;

    const createRooms = (count, type) => {
      const cap  = type==='VIP' ? 1 : type==='SERVICE' ? 2 : Math.floor(Math.random()*3)+4;
      const rate = type==='VIP' ? 1500000 : type==='SERVICE' ? 600000 : 200000;
      const flr  = type==='VIP' ? Math.floor(Math.random()*3)+5 : Math.floor(Math.random()*4)+1;
      const pref = type==='VIP' ? 'VIP' : type==='SERVICE' ? 'DV' : 'P';
      const svcs = type==='VIP' ? VIP_SVC : type==='SERVICE' ? SVC_SVC : [];

      for (let i=0; i<count; i++) {
        const roomId = randomUUID();
        const rStatus = rand(ROOM_STATUSES);
        insRoom.run(roomId, `${pref}.${short}-${uid4}-${String(idx).padStart(3,'0')}`, type, rStatus, flr, cap, rate, deptId, now, now);
        for (let b=1; b<=cap; b++) {
          insBed.run(randomUUID(), `Giường ${b}`, rStatus==='MAINTENANCE'?'MAINTENANCE':rand(BED_STATUSES), roomId, now, now);
          bedCount++;
        }
        for (const s of svcs) {
          insSvc.run(randomUUID(), s.name, s.description, s.price, roomId, now, now);
          svcCount++;
        }
        idx++;
        roomCount++;
      }
    };

    createRooms(numNormal, 'NORMAL');
    createRooms(numSvc,    'SERVICE');
    createRooms(numVip,    'VIP');
  }
})();
console.log(`🏥 Phòng: ${roomCount}  🛏️  Giường: ${bedCount}  🛎️  Tiện nghi: ${svcCount}`);

// ════════════════════════════════════════════════════════════════════════════
// BƯỚC 5: PHÒNG LÀM VIỆC (Back-office & Cận lâm sàng & Ngoại trú)
// ════════════════════════════════════════════════════════════════════════════
let officeCount=0;
db.transaction(() => {
  for (const deptName of DEPARTMENTS) {
    const deptId = deptMap[deptName];
    const needOffice = isNonMedical(deptName) || isSubclinical(deptName) || isOutpatient(deptName);
    if (!needOffice) continue;

    const num   = isOutpatient(deptName) ? 15 : isSubclinical(deptName) ? 5 : Math.floor(Math.random()*2)+2;
    const type  = isOutpatient(deptName) ? 'EXAM_ROOM' : isSubclinical(deptName) ? 'LAB_ROOM' : 'OFFICE';
    const short = deptName.replace('Phòng ','').replace('Khoa ','').replace('Trung tâm ','').substring(0,5).replace(/\s+/g,'').toUpperCase();
    const uid4  = deptId.slice(-4).toUpperCase();

    for (let i=1; i<=num; i++) {
      insRoom.run(randomUUID(), `${type}.${short}-${uid4}-${i}`, type, 'AVAILABLE', 1, 0, 0, deptId, now, now);
      officeCount++;
    }
  }
})();
console.log(`🏢 Phòng làm việc / Phòng khám / Phòng CLS: ${officeCount}`);

// ════════════════════════════════════════════════════════════════════════════
// TỔNG KẾT
// ════════════════════════════════════════════════════════════════════════════
const totalUsers = db.prepare("SELECT COUNT(*) as c FROM User").get().c;
const totalRooms = db.prepare("SELECT COUNT(*) as c FROM Room").get().c;

console.log(`
╔══════════════════════════════════════════════════════╗
║      🏥 SEED HOÀN TẤT — BỆNH VIỆN HƯNG LỢI         ║
╠══════════════════════════════════════════════════════╣
║  👑 Admin:      admin@bvhungloi.vn / Admin@123       ║
║  🔑 Mật khẩu NV: password123                         ║
╠══════════════════════════════════════════════════════╣
║  🏢 Khoa/Phòng ban: ${String(DEPARTMENTS.length).padEnd(33)}║
║  👥 Tổng nhân sự:   ${String(totalUsers).padEnd(33)}║
║     - Bác sĩ:       ${String(docCount).padEnd(33)}║
║     - Y tá:         ${String(nurseCount).padEnd(33)}║
║     - NV/KTV/Dược:  ${String(staffCount).padEnd(33)}║
║  🏥 Phòng bệnh nội trú: ${String(roomCount).padEnd(29)}║
║  🛏️  Tổng giường:       ${String(bedCount).padEnd(29)}║
║  🛎️  Tiện nghi VIP/DV:  ${String(svcCount).padEnd(29)}║
║  🏢 Phòng làm việc/khám: ${String(officeCount).padEnd(28)}║
║  📦 Tổng tất cả phòng: ${String(totalRooms).padEnd(30)}║
╚══════════════════════════════════════════════════════╝
`);

db.close();
