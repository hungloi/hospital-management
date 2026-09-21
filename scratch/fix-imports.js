const fs = require('fs');
const map = {
  'accountant': 'ACCOUNTANT_THEME',
  'director': 'DIRECTOR_THEME',
  'doctor': 'DOCTOR_THEME',
  'lab': 'LAB_THEME',
  'nurse': 'NURSE_THEME',
  'patient': 'PATIENT_THEME',
  'pharmacy': 'PHARMACY_THEME',
  'reception': 'RECEPTION_THEME',
  'staff': 'ADMIN_THEME'
};
const files = [
  'src/app/accountant/history/page.tsx',
  'src/app/accountant/insurance/page.tsx',
  'src/app/accountant/page.tsx',
  'src/app/accountant/reports/page.tsx',
  'src/app/director/finance/page.tsx',
  'src/app/director/hr/page.tsx',
  'src/app/director/page.tsx',
  'src/app/doctor/patients/page.tsx',
  'src/app/doctor/records/page.tsx',
  'src/app/lab/page.tsx',
  'src/app/nurse/inpatient/page.tsx',
  'src/app/nurse/medicine/page.tsx',
  'src/app/nurse/page.tsx',
  'src/app/nurse/vitals/page.tsx',
  'src/app/patient/payments/page.tsx',
  'src/app/pharmacy/page.tsx',
  'src/app/reception/page.tsx',
  'src/app/staff/documents/page.tsx',
  'src/app/staff/page.tsx',
  'src/app/staff/tickets/page.tsx'
];
files.forEach(f => {
  if (!fs.existsSync(f)) return;
  let c = fs.readFileSync(f, 'utf8');
  let role = f.split('/')[2];
  let themeName = map[role] || 'ADMIN_THEME';
  
  if (!c.includes(`{ ${themeName} }`) && !c.includes(themeName + " }") && !c.includes(`, ${themeName}`)) {
    if (c.includes(`from '@/lib/adminConfig'`)) {
      c = c.replace(/from '@\/lib\/adminConfig'/, `, ${themeName} } from '@/lib/adminConfig'`);
      // Fix double braces if they happen
      c = c.replace(/}\s*,\s*([A-Z_]+)\s*}/g, ', $1 }');
    } else {
      c = c.replace(/(import DashboardShell from '@\/components\/DashboardShell';)/, `$1\nimport { ${themeName} } from '@/lib/adminConfig';`);
    }
    fs.writeFileSync(f, c, 'utf8');
    console.log('Added import to', f);
  }
});
console.log('Done');
