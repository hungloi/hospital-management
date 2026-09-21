/**
 * Tạo sẵn lịch làm việc mẫu cho các khoa
 * npx tsx scripts/seed-schedules.ts
 */
import { prisma } from '../src/lib/prisma';

const DAYS = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'];

const SHIFTS = [
  { shiftType: 'DAY',     startTime: '07:00', endTime: '15:00' },
  { shiftType: 'EVENING', startTime: '15:00', endTime: '22:00' },
  { shiftType: 'NIGHT',   startTime: '22:00', endTime: '07:00' },
];

// Medical inpatient depts get all 3 shifts; outpatient/office get only DAY shift Mon-Fri
const OUTPATIENT_DEPTS = new Set([
  'Khoa Chẩn Đoán Hình Ảnh','Khoa Xét Nghiệm','Khoa Siêu Âm Chẩn Đoán',
  'Khoa Điện Não','Khoa Tai Mũi Họng','Khoa Mắt','Khoa Nhãn',
  'Khoa Pháp Y - Giám Định Tư Pháp','Khoa Phòng Chống Bệnh Tật',
]);
const ADMIN_DEPTS = new Set([
  'Phòng Công Nghệ Thông Tin','Phòng Kế Toán - Tài Chính',
  'Phòng Nhân Sự - Hành Chính','Phòng Vệ Sinh và Bảo Vệ',
  'Phòng Đào Tạo - Nghiên Cứu Khoa Học','Phòng Quản Lý Chất Lượng',
  'Phòng Dược','Phòng Dinh Dưỡng','Pool Điều Dưỡng',
]);

async function main() {
  console.log('🔄 Xoá lịch cũ và tạo lịch mới...\n');

  // Clear all existing shifts
  await prisma.staffShift.deleteMany({});
  console.log('🗑  Đã xoá lịch cũ\n');

  const allDepts = await prisma.department.findMany();
  let totalCreated = 0;

  for (const dept of allDepts) {
    const doctors = await prisma.doctor.findMany({ where: { departmentId: dept.id } });
    const nurses  = await prisma.nurse.findMany({ where: { departmentId: dept.id } });

    if (doctors.length === 0 && nurses.length === 0) continue;

    const isAdmin     = ADMIN_DEPTS.has(dept.name);
    const isOutpatient = OUTPATIENT_DEPTS.has(dept.name);

    // Determine days and shifts
    const activeDays  = isAdmin ? ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY']
                      : isOutpatient ? ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY']
                      : DAYS; // inpatient: 7 days
    const activeShifts = (isAdmin || isOutpatient) ? [SHIFTS[0]] : SHIFTS;

    // Pick staff to assign - distribute across shifts
    const allStaff = [
      ...doctors.map(d => ({ id: d.id, type: 'DOCTOR' as const })),
      ...nurses.map(n => ({ id: n.id, type: 'NURSE' as const })),
    ];

    let staffIdx = 0;
    let deptShifts = 0;

    for (const day of activeDays) {
      for (const shift of activeShifts) {
        // Assign 1-2 staff per shift per day (rotate through available staff)
        const count = isAdmin ? 1 : (shift.shiftType === 'NIGHT' ? 2 : 3);
        for (let i = 0; i < count && staffIdx < allStaff.length * 5; i++) {
          const s = allStaff[staffIdx % allStaff.length];
          staffIdx++;
          const data: any = {
            dayOfWeek: day,
            shiftType: shift.shiftType,
            startTime: shift.startTime,
            endTime: shift.endTime,
            departmentId: dept.id,
          };
          if (s.type === 'DOCTOR') data.doctorId = s.id;
          else data.nurseId = s.id;

          await prisma.staffShift.create({ data });
          deptShifts++;
          totalCreated++;
          process.stdout.write('.');
        }
      }
    }

    if (deptShifts > 0) {
      console.log(`\n✅ ${dept.name}: ${deptShifts} ca`);
    }
  }

  console.log('\n\n' + '═'.repeat(55));
  console.log(`✅ HOÀN TẤT! Đã tạo ${totalCreated} ca làm việc`);
  console.log('═'.repeat(55));
}

main().catch(console.error).finally(() => prisma.$disconnect());
