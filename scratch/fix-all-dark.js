const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(fullPath);
    }
  });
  return results;
}

// Map of dark color → light equivalent
const replacements = [
  // Dark backgrounds → light
  [/background:\s*'#1e293b'/g, "background: '#f8fafc'"],
  [/background:\s*'#0f172a'/g, "background: '#ffffff'"],
  [/background:\s*'#0d1526'/g, "background: '#f0f4f8'"],
  [/background:\s*'#111827'/g, "background: '#f8fafc'"],
  [/background:\s*'#020617'/g, "background: '#f0f4f8'"],
  [/backgroundColor:\s*'#0f172a'/g, "backgroundColor: '#ffffff'"],
  [/backgroundColor:\s*'#1e293b'/g, "backgroundColor: '#f8fafc'"],
  
  // Gradient dark background
  [/background:\s*'linear-gradient\(135deg,\s*#020617[^']+\)'/g, "background: '#f0f4f8'"],
  [/background:\s*'linear-gradient\(135deg,\s*#0a1628[^']+\)'/g, "background: '#f0f4f8'"],
  
  // Dark text colors (light text on dark bg) → dark text on light bg
  [/color:\s*'#f1f5f9'/g, "color: '#0f172a'"],
  [/color:\s*'#e2e8f0'/g, "color: '#374151'"],
  [/color:\s*'#cbd5e1'/g, "color: '#64748b'"],
  [/color:\s*'#94a3b8'/g, "color: '#64748b'"],
  [/color:\s*'#a0aec0'/g, "color: '#64748b'"],
  
  // Borders
  [/border:\s*'1px solid #334155'/g, "border: '1px solid #e2e8f0'"],
  [/border:\s*'1px solid #475569'/g, "border: '1px solid #d1d5db'"],
  [/border:\s*'1px solid #1e293b'/g, "border: '1px solid #e2e8f0'"],
  [/border:\s*'1px solid #2d3748'/g, "border: '1px solid #e2e8f0'"],
  [/borderBottom:\s*'1px solid #334155'/g, "borderBottom: '1px solid #f1f5f9'"],
  [/borderBottom:\s*'1px solid #1e293b'/g, "borderBottom: '1px solid #f1f5f9'"],
  [/borderBottom:\s*'1px solid #2d3748'/g, "borderBottom: '1px solid #f1f5f9'"],
  [/borderTop:\s*'1px solid #334155'/g, "borderTop: '1px solid #e2e8f0'"],
  [/borderTop:\s*'1px solid #1e293b'/g, "borderTop: '1px solid #e2e8f0'"],
  [/borderColor:\s*'#334155'/g, "borderColor: '#e2e8f0'"],
  [/borderColor:\s*'#475569'/g, "borderColor: '#d1d5db'"],
  
  // Method badges dark bg
  [/background:\s*'#334155',\s*color:\s*'#64748b'/g, "background: '#f1f5f9', color: '#475569'"],
  [/background:\s*'#334155',\s*color:\s*'#0f172a'/g, "background: '#f1f5f9', color: '#374151'"],
  
  // Low-contrast text on dark cards (light colors meant for dark bg)
  [/color:\s*'#86efac'/g, "color: '#15803d'"],   // green-300 → green-700
  [/color:\s*'#fca5a5'/g, "color: '#dc2626'"],   // red-300 → red-600
  [/color:\s*'#93c5fd'/g, "color: '#2563eb'"],   // blue-300 → blue-600
  [/color:\s*'#fdba74'/g, "color: '#ea580c'"],   // orange-300 → orange-600
  [/color:\s*'#c4b5fd'/g, "color: '#7c3aed'"],   // violet-300 → violet-700
  
  // Low-contrast bg (transparent on dark bg)
  [/background:\s*'#14532d22'/g, "background: '#dcfce7'"],
  [/background:\s*'#7f1d1d22'/g, "background: '#fee2e2'"],
  [/background:\s*'#1e3a5f22'/g, "background: '#dbeafe'"],
  
  // Input styling with dark bg
  [/background:\s*'#0f172a',\s*border:\s*'1px solid #475569',\s*borderRadius:\s*'8px',\s*color:\s*'white'/g, 
   "background: '#ffffff', border: '1px solid #d1d5db', borderRadius: '8px', color: '#0f172a'"],
  [/background:\s*'#0f172a',\s*border:\s*'1px solid #334155',\s*borderRadius:\s*'8px',\s*color:\s*'white'/g,
   "background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#0f172a'"],
  [/backgroundColor:\s*'#0f172a',\s*color:\s*'white'/g, "backgroundColor: '#ffffff', color: '#0f172a'"],
];

const files = walk('src/app');
let totalFixed = 0;

files.forEach(f => {
  // Skip DashboardShell (it intentionally uses dark sidebar colors)
  if (f.includes('DashboardShell')) return;
  
  let c = fs.readFileSync(f, 'utf8');
  let orig = c;

  replacements.forEach(([pattern, replacement]) => {
    c = c.replace(pattern, replacement);
  });

  if (c !== orig) {
    fs.writeFileSync(f, c, 'utf8');
    totalFixed++;
    console.log('Fixed:', f);
  }
});

console.log(`\nTotal files fixed: ${totalFixed}`);
