const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fp = path.join(dir, file);
    const stat = fs.statSync(fp);
    if (stat.isDirectory()) results = results.concat(walk(fp));
    else if (fp.endsWith('.tsx') || fp.endsWith('.ts')) results.push(fp);
  });
  return results;
}

const replacements = [
  // Warning/alert boxes with rgba
  [/background:\s*'rgba\(250,204,21,0\.\d+\)',\s*border:\s*'1px solid rgba\(250,204,21,0\.\d+\)'/g,
   "background: '#fefce8', border: '1px solid #fde68a'"],
  [/background:\s*'rgba\(239,68,68,0\.\d+\)',\s*border:\s*'1px solid rgba\(239,68,68,0\.\d+\)'/g,
   "background: '#fef2f2', border: '1px solid #fecaca'"],
  [/background:\s*'rgba\(34,197,94,0\.\d+\)',\s*border:\s*'1px solid rgba\(34,197,94,0\.\d+\)'/g,
   "background: '#f0fdf4', border: '1px solid #bbf7d0'"],
  
  // Status pill rgba → solid
  [/background:\s*'rgba\(250,204,21,0\.\d+\)',\s*color:\s*'#fde68a'/g, "background: '#fef3c7', color: '#92400e'"],
  [/background:\s*'rgba\(250,204,21,0\.\d+\)',\s*color:\s*'#fbbf24'/g, "background: '#fef3c7', color: '#92400e'"],
  [/background:\s*'rgba\(52,211,153,0\.\d+\)',\s*color:\s*'#bbf7d0'/g, "background: '#dcfce7', color: '#15803d'"],
  [/background:\s*'rgba\(52,211,153,0\.\d+\)',\s*color:\s*'#34d399'/g, "background: '#dcfce7', color: '#15803d'"],
  [/background:\s*'rgba\(248,113,113,0\.\d+\)',\s*color:\s*'#fca5a5'/g, "background: '#fee2e2', color: '#dc2626'"],
  [/background:\s*'rgba\(167,139,250,0\.\d+\)',\s*color:\s*'#c4b5fd'/g, "background: '#ede9fe', color: '#6d28d9'"],
  [/background:\s*'rgba\(251,191,36,0\.\d+\)',\s*color:\s*'#fbbf24'/g, "background: '#fef3c7', color: '#92400e'"],

  // Dark shadow-only rgba (these are OK - they're box-shadows on white cards, keep them)
  // DON'T replace rgba in boxShadow

  // Alert text colors on yellow background
  [/color:\s*'#fde68a'/g,  "color: '#78350f'"],
  [/color:\s*'#fef3c7'/g,  "color: '#92400e'"],
  
  // Table row borders
  [/borderBottom:\s*'1px solid rgba\(51,65,85,0\.\d+\)'/g, "borderBottom: '1px solid #f1f5f9'"],
  [/borderBottom:\s*'1px solid rgba\(148,163,184,0\.\d+\)'/g, "borderBottom: '1px solid #f1f5f9'"],
  [/border:\s*'1px solid rgba\(148,163,184,0\.1[89]\)'/g,  "border: '1px solid #e2e8f0'"],

  // Footer badge (ADMIN) using rgba sky
  // Keep these - they're inside the dark sidebar so they're fine
];

const files = walk('src/app');
let totalFixed = 0;

files.forEach(f => {
  if (f.includes('DashboardShell')) return;
  let c = fs.readFileSync(f, 'utf8');
  const orig = c;

  replacements.forEach(([pattern, replacement]) => {
    c = c.replace(pattern, replacement);
  });

  if (c !== orig) {
    fs.writeFileSync(f, c, 'utf8');
    totalFixed++;
    console.log('Fixed:', f);
  }
});

console.log(`Done. Total fixed: ${totalFixed}`);
