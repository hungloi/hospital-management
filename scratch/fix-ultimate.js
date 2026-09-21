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
  // ── rgba dark backgrounds ─────────────────────────────────────────
  [/background:\s*'rgba\(15,\s*23,\s*42,\s*0?\.\d+\)'/g,  "background: '#ffffff'"],
  [/background:\s*'rgba\(15,23,42,\s*0?\.\d+\)'/g,         "background: '#ffffff'"],
  [/background:\s*'rgba\(30,\s*41,\s*59,\s*0?\.\d+\)'/g,  "background: '#f8fafc'"],
  [/background:\s*'rgba\(2,\s*6,\s*23,\s*0?\.\d+\)'/g,    "background: '#f0f4f8'"],
  [/backgroundColor:\s*'rgba\(15,23,42,\s*0?\.\d+\)'/g,   "backgroundColor: '#ffffff'"],

  // ── hex dark backgrounds ──────────────────────────────────────────
  [/background:\s*'#020617'/g,   "background: '#f0f4f8'"],
  [/background:\s*'#0d1526'/g,   "background: '#f0f4f8'"],
  [/background:\s*'#0f172a'/g,   "background: '#ffffff'"],
  [/background:\s*'#1e293b'/g,   "background: '#f8fafc'"],
  [/background:\s*'#111827'/g,   "background: '#f8fafc'"],
  [/background:\s*'#0a1628'/g,   "background: '#f0f4f8'"],
  [/backgroundColor:\s*'#0f172a'/g, "backgroundColor: '#ffffff'"],
  [/backgroundColor:\s*'#1e293b'/g, "backgroundColor: '#f8fafc'"],

  // ── dark text (meant for dark bg) → dark text on light bg ─────────
  [/color:\s*'#f8fafc'/g,   "color: '#0f172a'"],
  [/color:\s*'#f1f5f9'/g,   "color: '#0f172a'"],
  [/color:\s*'#e2e8f0'/g,   "color: '#374151'"],
  [/color:\s*'#cbd5e1'/g,   "color: '#64748b'"],
  [/color:\s*'#94a3b8'/g,   "color: '#64748b'"],
  [/color:\s*'#a0aec0'/g,   "color: '#64748b'"],
  [/color:\s*'#7dd3fc'/g,   "color: '#0369a1'"],  // sky-300 → sky-700
  [/color:\s*'#86efac'/g,   "color: '#15803d'"],  // green-300 → green-700
  [/color:\s*'#fca5a5'/g,   "color: '#dc2626'"],  // red-300 → red-600
  [/color:\s*'#93c5fd'/g,   "color: '#1d4ed8'"],  // blue-300 → blue-600
  [/color:\s*'#fdba74'/g,   "color: '#ea580c'"],  // orange-300 → orange-600
  [/color:\s*'#c4b5fd'/g,   "color: '#6d28d9'"],  // violet-300 → violet-700
  [/color:\s*'#bbf7d0'/g,   "color: '#15803d'"],  // green-200 → green-700

  // ── borders ───────────────────────────────────────────────────────
  [/border:\s*'1px solid #334155'/g,      "border: '1px solid #e2e8f0'"],
  [/border:\s*'1px solid #475569'/g,      "border: '1px solid #d1d5db'"],
  [/border:\s*'1px solid #1e293b'/g,      "border: '1px solid #e2e8f0'"],
  [/border:\s*'1px dashed #334155'/g,     "border: '1px dashed #d1d5db'"],
  [/border:\s*'1px solid #2d3748'/g,      "border: '1px solid #e2e8f0'"],
  [/borderBottom:\s*'1px solid #334155'/g,"borderBottom: '1px solid #f1f5f9'"],
  [/borderBottom:\s*'1px solid #1e293b'/g,"borderBottom: '1px solid #f1f5f9'"],
  [/borderTop:\s*'1px solid #334155'/g,   "borderTop: '1px solid #e2e8f0'"],
  [/borderTop:\s*'1px solid #1e293b'/g,   "borderTop: '1px solid #e2e8f0'"],
  [/borderColor:\s*'#334155'/g,           "borderColor: '#e2e8f0'"],
  [/borderColor:\s*'#475569'/g,           "borderColor: '#d1d5db'"],

  // ── input backgrounds ─────────────────────────────────────────────
  [/background:\s*'rgba\(15,\s*23,\s*42,\s*0?\.\d+\)',\s*color:\s*'#[a-f0-9]+'/g,
   "background: '#ffffff', color: '#0f172a'"],

  // ── low-contrast pill/badge colors ───────────────────────────────
  [/background:\s*'rgba\(52,211,153,0\.12\)',\s*border:\s*'1px solid rgba\(52,211,153,0\.2\)',\s*color:\s*'#bbf7d0'/g,
   "background: '#dcfce7', border: '1px solid #86efac', color: '#15803d'"],
  [/background:\s*'rgba\(56,189,248,0\.14\)',\s*color:\s*'#7dd3fc'/g,
   "background: '#dbeafe', color: '#1d4ed8'"],
  [/background:\s*'rgba\(56,189,248,0\.12\)',\s*color:\s*'#7dd3fc'/g,
   "background: '#dbeafe', color: '#1d4ed8'"],

  // ── dark gradient backgrounds in content ──────────────────────────
  [/background:\s*'linear-gradient\(135deg,\s*#020617[^']+\)'/g, "background: '#f0f4f8'"],
  [/background:\s*'linear-gradient\(135deg,\s*#0a1628[^']+\)'/g, "background: '#f0f4f8'"],
  [/background:\s*'linear-gradient\(135deg,\s*#0f172a[^']+\)'/g, "background: '#f0f4f8'"],
];

const files = walk('src/app');
let totalFixed = 0;

files.forEach(f => {
  if (f.includes('DashboardShell')) return; // skip — intentionally dark
  
  let c = fs.readFileSync(f, 'utf8');
  const orig = c;

  replacements.forEach(([pattern, replacement]) => {
    c = c.replace(pattern, replacement);
  });

  // Also fix inline `color: 'white'` inside content (not button/avatar contexts)
  // Only when it appears after a label/paragraph/heading content marker
  c = c.replace(/(<(?:h[1-6]|p|td|th|div|span)[^>]*style=\{\{[^}]*)\bcolor:\s*'white'/g, "$1color: '#0f172a'");

  if (c !== orig) {
    fs.writeFileSync(f, c, 'utf8');
    totalFixed++;
    console.log('Fixed:', f);
  }
});

console.log(`\nDone. Total fixed: ${totalFixed}`);
