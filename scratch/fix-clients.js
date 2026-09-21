const fs = require('fs');
const files = [
  'src/app/admin/schedules/SchedulesClient.tsx',
  'src/app/admin/nurses/NursesClient.tsx',
  'src/app/admin/inpatient/InpatientClient.tsx',
  'src/app/admin/rooms/RoomsClient.tsx',
  'src/app/admin/patients/PatientsClient.tsx',
  'src/app/admin/users/UserTableClient.tsx',
  'src/app/admin/clinic/ClinicClient.tsx',
  'src/app/admin/doctors/DoctorTableClient.tsx',
];
files.forEach(f => {
  if (!fs.existsSync(f)) return;
  let c = fs.readFileSync(f, 'utf8');
  let orig = c;
  c = c.replace(/color:\s*'#f1f5f9'/g, "color: '#0f172a'");
  c = c.replace(/color:\s*'#e2e8f0'/g, "color: '#475569'");
  c = c.replace(/color:\s*'#cbd5e1'/g, "color: '#64748b'");
  c = c.replace(/color:\s*'#94a3b8'/g, "color: '#64748b'");
  c = c.replace(/background:\s*'#020617[^']*'/g, "background: '#f0f4f8'");
  c = c.replace(/background:\s*'#0f172a'/g, "background: '#ffffff'");
  c = c.replace(/background:\s*'#1e293b'/g, "background: '#f8fafc'");
  c = c.replace(/background:\s*'#334155'/g, "background: '#f1f5f9'");
  c = c.replace(/background:\s*'#111827'/g, "background: '#f8fafc'");
  c = c.replace(/border:\s*'1px solid #334155'/g, "border: '1px solid #e2e8f0'");
  c = c.replace(/border:\s*'1px solid #475569'/g, "border: '1px solid #e2e8f0'");
  c = c.replace(/borderBottom:\s*'1px solid #334155'/g, "borderBottom: '1px solid #f1f5f9'");
  c = c.replace(/borderBottom:\s*'1px solid #1e293b'/g, "borderBottom: '1px solid #f1f5f9'");
  c = c.replace(/borderTop:\s*'1px solid #334155'/g, "borderTop: '1px solid #e2e8f0'");
  c = c.replace(/borderColor:\s*'#334155'/g, "borderColor: '#e2e8f0'");
  if (c !== orig) { fs.writeFileSync(f, c, 'utf8'); console.log('Fixed:', f); }
});
console.log('Done');
