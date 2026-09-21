import { prisma } from './src/lib/prisma';
import fs from 'fs';

// Pools of realistic Vietnamese names (doctors include titles where appropriate)
const doctorNames = [
  'PGS.TS.BS. Trịnh Hưng Lợi', 'TS.BS. Trần Anh Tuấn', 'TS.BS. Vũ Đình Hùng', 'TS.BS. Nguyễn Thị Lan',
  'TS.BS. Lê Thị Mỹ Hạnh', 'BS. Hoàng Văn Sơn', 'BS. Bùi Quốc Huy', 'BS. Đỗ Thị Hương', 'BS. Phạm Văn Minh',
  'TS.BS. Trương Nhân Khánh', 'TS.BS. Lý Anh Đức', 'BS. Ngô Thanh Bình', 'TS.BS. Trần Thị Nguyệt', 'BS. Võ Văn Chính',
  'BS. Đinh Thị Hồng', 'TS.BS. Hà Văn Tú', 'TS.BS. Lê Hoàng Phúc', 'BS. Trần Văn Nam', 'BS. Nguyễn Thái Bảo',
  'TS.BS. Lê Thị Thanh'
];

const nurseNames = [
  'ĐD. Trần Thị Lan', 'ĐD. Nguyễn Thị Hoa', 'ĐD. Vũ Thị Hương', 'ĐD. Phạm Thị Linh', 'ĐD. Lê Thị Mai',
  'ĐD. Đỗ Thị Thanh', 'ĐD. Hoàng Thị Tú', 'ĐD. Ngô Thị Bích', 'ĐD. Bùi Thị Ngọc', 'ĐD. Trương Thị Yến',
  'ĐD. Đặng Thị Thu', 'ĐD. Lý Thị Hương', 'ĐD. Nguyễn Thị Kim', 'ĐD. Vũ Thị Diệp', 'ĐD. Phạm Thị Hồng',
  'ĐD. Trần Thị Bích', 'ĐD. Lê Văn Anh', 'ĐD. Ngô Văn Hùng', 'ĐD. Bùi Văn Tuấn', 'ĐD. Đỗ Văn Minh'
];

const staffNames = [
  'Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C', 'Phạm Thị D', 'Hoàng Văn E', 'Vũ Thị F', 'Đặng Văn G', 'Bùi Thị H'
];

function looksBadName(name: string | null | undefined) {
  if (!name) return true;
  const trimmed = name.trim();
  if (trimmed.length === 0) return true;
  // bad if only one token of length 1 (A, B, C)
  const tokens = trimmed.split(/\s+/);
  if (tokens.length === 1 && tokens[0].length <= 2) return true;
  // bad if contains digits
  if (/\d/.test(trimmed)) return true;
  // bad if contains patterns like (ND-..., or parentheses)
  if (/\(.*\)/.test(trimmed)) return true;
  // bad if equals single letters like 'A' or 'B' or 'NV A'
  const placeholders = ['a','b','c','nv','nhanvien','nhan','nhan vien'];
  const low = trimmed.toLowerCase().replace(/[^a-z0-9\s]/gi,'');
  if (placeholders.includes(low) || placeholders.some(p => low === `${p}` || low.startsWith(`${p} `))) return true;
  return false;
}

async function main() {
  const report: any = { changed: [] };

  const users = await prisma.user.findMany();
  let docIdx = 0, nurseIdx = 0, staffIdx = 0;

  for (const u of users) {
    if (!looksBadName(u.name)) continue; // skip good names

    const role = (u.role || '').toUpperCase();
    let newName = null;

    if (role.includes('DIRECTOR') || role.includes('HEAD') || role.includes('DOCTOR') || role.includes('DEPUTY') ) {
      // assign doctor name with title
      newName = doctorNames[docIdx % doctorNames.length];
      docIdx++;
    } else if (role.includes('NURSE')) {
      newName = nurseNames[nurseIdx % nurseNames.length];
      nurseIdx++;
    } else {
      newName = staffNames[staffIdx % staffNames.length];
      staffIdx++;
    }

    // Ensure no digits or parentheses in the newName
    newName = newName.replace(/\d+/g, '').replace(/\(.*\)/g, '').trim();

    try {
      await prisma.user.update({ where: { id: u.id }, data: { name: newName } as any });
      report.changed.push({ userId: u.id, from: u.name, to: newName, role: u.role });
    } catch (e) {
      report.changed.push({ userId: u.id, from: u.name, to: newName, role: u.role, error: String(e) });
    }
  }

  const outDir = './files';
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outPath = `${outDir}/normalize-names-real-report.json`;
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf-8');

  console.log('Done. Report written to', outPath, 'Changed count:', report.changed.length);
}

main().catch(e => { console.error(e); process.exit(1); }).finally(async () => await prisma.$disconnect());
