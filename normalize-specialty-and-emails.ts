import { prisma } from './src/lib/prisma';
import fs from 'fs';

function normalizeNameForEmail(name: string) {
  return name
    .replace(/^(PGS\.TS\.BS\.|TS\.BS\.|BS\.|ĐD\.|ĐD|Đ|TS\.|ThS\.|ThS|Dr\.|Dr)/gi, '')
    .replace(/-\s.*$/g, '')
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-zA-Z0-9\s\.]/g, '')
    .replace(/\s+/g, '.')
    .toLowerCase();
}

function generateEmail(name: string) {
  const local = normalizeNameForEmail(name);
  return `${local}@bvhungloi.vn`;
}

async function main() {
  const report: any = { mappedDoctors: [], unmappedDoctors: [], emailChanges: [] };

  const depts = await prisma.department.findMany();
  const deptInfos = depts.map(d => ({ id: d.id, name: d.name, nameLower: (d.name || '').toLowerCase() }));

  // fetch doctors with their users
  const doctors = await prisma.doctor.findMany({ include: { user: true } });
  for (const doc of doctors) {
    const spec = (doc.specialty || '').toLowerCase();

    // try exact substring match
    let matched = deptInfos.find(d => spec.includes(d.nameLower) || d.nameLower.includes(spec));

    // try token match: split specialty into words, match any token >2 chars
    if (!matched && spec) {
      const tokens = spec.split(/[^a-z0-9]+/i).filter(t => t.length > 2);
      matched = deptInfos.find(d => tokens.some(t => d.nameLower.includes(t)));
    }

    // fallback: if doctor's user name contains department keywords
    if (!matched && doc.user?.name) {
      const uname = doc.user.name.toLowerCase();
      matched = deptInfos.find(d => uname.includes(d.nameLower.split(' ')[0]));
    }

    if (matched) {
      if (doc.departmentId !== matched.id) {
        await prisma.doctor.update({ where: { id: doc.id }, data: { departmentId: matched.id } as any });
        report.mappedDoctors.push({ doctorId: doc.id, userName: doc.user?.name, from: doc.departmentId, to: matched.name });
      }
    } else {
      report.unmappedDoctors.push({ doctorId: doc.id, userName: doc.user?.name, specialty: doc.specialty || null, departmentId: doc.departmentId });
    }
  }

  // Standardize emails for all users
  const users = await prisma.user.findMany();
  for (const u of users) {
    const desired = generateEmail(u.name || u.email || u.id);
    if (u.email && u.email.toLowerCase() === desired) continue;

    // check uniqueness
    let target = desired;
    let suffix = 1;
    while (true) {
      const exists = await prisma.user.findFirst({ where: { email: target } });
      if (!exists || exists.id === u.id) break;
      target = desired.replace('@', `.${suffix}@`);
      suffix++;
    }

    try {
      await prisma.user.update({ where: { id: u.id }, data: { email: target } });
      report.emailChanges.push({ userId: u.id, name: u.name, from: u.email, to: target });
    } catch (e) {
      report.emailChanges.push({ userId: u.id, name: u.name, from: u.email, to: target, error: String(e) });
    }
  }

  // write report to files/
  const outDir = './files';
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outPath = `${outDir}/specialty-email-normalize-report.json`;
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf-8');

  console.log('Normalization complete. Report written to', outPath);
  console.log(`Mapped doctors: ${report.mappedDoctors.length}, Unmapped: ${report.unmappedDoctors.length}, Email changes: ${report.emailChanges.length}`);
}

main()
  .catch(e => { console.error('Error:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
