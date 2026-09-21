import { prisma } from './src/lib/prisma';
import fs from 'fs';

function localFromName(name: string) {
  // remove honorifics/titles but keep the name
  const cleaned = name
    .replace(/^(PGS\.TS\.BS\.|PGS\.TS\.|PGS\.|TS\.BS\.|TS\.|BS\.|ĐD\.|ĐD|Đ|ThS\.|ThS|Dr\.|Dr)/gi, '')
    .replace(/-\s.*$/g, '')
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-zA-Z0-9\s\.]/g, '')
    .replace(/\s+/g, '.')
    .toLowerCase();
  // remove leading/trailing dots
  return cleaned.replace(/^\.+|\.+$/g, '') || 'user';
}

async function main() {
  const report: any = { changes: [], conflicts: [] };
  const users = await prisma.user.findMany();

  for (const u of users) {
    const baseLocal = localFromName(u.name || u.email || u.id);
    let candidate = `${baseLocal}@bvhungloi.vn`;
    let suffix = 1;
    // If candidate already in use by another user, append suffix
    while (true) {
      const existing = await prisma.user.findFirst({ where: { email: candidate } });
      if (!existing || existing.id === u.id) break;
      candidate = `${baseLocal}.${suffix}@bvhungloi.vn`;
      suffix++;
    }

    if (u.email !== candidate) {
      try {
        await prisma.user.update({ where: { id: u.id }, data: { email: candidate } as any });
        report.changes.push({ userId: u.id, name: u.name, from: u.email, to: candidate });
      } catch (e) {
        report.conflicts.push({ userId: u.id, name: u.name, from: u.email, attempted: candidate, error: String(e) });
      }
    }
  }

  const outDir = './files';
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outPath = `${outDir}/email-standardize-report.json`;
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf-8');

  console.log('Email standardization complete. Report written to', outPath);
  console.log(`Emails changed: ${report.changes.length}, conflicts: ${report.conflicts.length}`);
}

main()
  .catch(e => { console.error('Error:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
