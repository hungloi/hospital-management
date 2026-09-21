/**
 * Tạo lịch làm việc cụ thể theo ngày cho tháng 8/2026
 * npx tsx scripts/seed-august-schedule.ts
 */
import { prisma } from '../src/lib/prisma';

const MONTH = 7; // 0-indexed: 7 = August
const YEAR = 2026;

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

const SHIFTS = [
  { shiftType: 'DAY',     startTime: '07:00', endTime: '15:00', staffCount: 3 },
  { shiftType: 'EVENING', startTime: '15:00', endTime: '22:00', staffCount: 2 },
  { shiftType: 'NIGHT',   startTime: '22:00', endTime: '07:00', staffCount: 2 },
];

function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = [];
  const date = new Date(year, month, 1);
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}

function isWeekend(date: Date) {
  return date.getDay() === 0 || date.getDay() === 6; // Sun=0, Sat=6
}

async function main() {
  const days = getDaysInMonth(YEAR, MONTH);
  console.log(`📅 Tạo lịch tháng 8/${YEAR}: ${days.length} ngày\n`);

  // Remove existing specific-date shifts for August 2026
  const startOfMonth = new Date(YEAR, MONTH, 1);
  const endOfMonth   = new Date(YEAR, MONTH + 1, 0, 23, 59, 59);
  const deleted = await prisma.staffShift.deleteMany({
    where: {
      scheduleDate: { gte: startOfMonth, lte: endOfMonth }
    }
  });
  console.log(`🗑  Đã xoá ${deleted.count} ca cụ thể tháng 8 cũ\n`);

  const allDepts = await prisma.department.findMany();
  let totalCreated = 0;

  for (const dept of allDepts) {
    const doctors = await prisma.doctor.findMany({ where: { departmentId: dept.id } });
    const nurses  = await prisma.nurse.findMany({ where: { departmentId: dept.id } });

    if (doctors.length === 0 && nurses.length === 0) continue;

    const isAdmin      = ADMIN_DEPTS.has(dept.name);
    const isOutpatient = OUTPATIENT_DEPTS.has(dept.name);

    const allStaff = [
      ...doctors.map(d => ({ id: d.id, type: 'DOCTOR' as const })),
      ...nurses.map(n => ({ id: n.id, type: 'NURSE' as const })),
    ];

    let staffRoundRobin = 0;
    let deptCount = 0;

    for (const day of days) {
      const weekend = isWeekend(day);

      // Admin: skip weekends, only day shift
      if (isAdmin && weekend) continue;
      // Outpatient: skip Sundays only
      if (isOutpatient && day.getDay() === 0) continue;

      const dayShifts = (isAdmin || isOutpatient)
        ? [SHIFTS[0]] // day shift only
        : SHIFTS;     // all 3 shifts for inpatient

      for (const shift of dayShifts) {
        // Weekend inpatient: reduce to 2 staff per shift
        const count = weekend ? Math.min(2, shift.staffCount) : shift.staffCount;

        for (let i = 0; i < count && allStaff.length > 0; i++) {
          const s = allStaff[staffRoundRobin % allStaff.length];
          staffRoundRobin++;

          const data: any = {
            scheduleDate: new Date(Date.UTC(day.getFullYear(), day.getMonth(), day.getDate(), 0, 0, 0)),
            shiftType: shift.shiftType,
            startTime: shift.startTime,
            endTime: shift.endTime,
            departmentId: dept.id,
            notes: `Tháng 8/${YEAR}`,
          };
          if (s.type === 'DOCTOR') data.doctorId = s.id;
          else data.nurseId = s.id;

          await prisma.staffShift.create({ data });
          deptCount++;
          totalCreated++;
        }
      }
    }

    if (deptCount > 0) {
      process.stdout.write(`✅ ${dept.name}: ${deptCount} ca\n`);
    }
  }

  console.log('\n' + '═'.repeat(55));
  console.log(`✅ HOÀN TẤT! Tháng 8/${YEAR}: ${totalCreated} ca làm việc cụ thể`);
  console.log('═'.repeat(55));
}

main().catch(console.error).finally(() => prisma.$disconnect());
