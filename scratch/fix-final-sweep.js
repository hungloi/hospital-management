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

const files = walk('src/app');
let totalFixed = 0;

files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  let orig = c;

  c = c.replace(/color:\s*'#f1f5f9'/g, "color: '#0f172a'");
  c = c.replace(/color:\s*'#e2e8f0'/g, "color: '#475569'");
  c = c.replace(/color:\s*'#cbd5e1'/g, "color: '#64748b'");
  c = c.replace(/color:\s*'#94a3b8'/g, "color: '#64748b'");

  // Dark backgrounds in content only (not sidebar — sidebar is inside DashboardShell)
  // We skip files that are DashboardShell itself
  if (!f.includes('DashboardShell')) {
    c = c.replace(/background:\s*'#020617'/g, "background: '#f0f4f8'");
    c = c.replace(/background:\s*'#0d1526'/g, "background: '#f0f4f8'");
    // Only replace #0f172a backgrounds that are NOT sidebar-related
    // Remove if it appears in a minHeight:100vh content wrapper
    c = c.replace(/,\s*background:\s*'linear-gradient\(135deg,\s*#020617[^']+\)'/g, ", background: '#f0f4f8'");
  }

  c = c.replace(/background:\s*'#1e293b',\s*borderRadius/g, "background: '#f8fafc', borderRadius");
  c = c.replace(/background:\s*'#334155',\s*borderRadius/g, "background: '#f1f5f9', borderRadius");
  c = c.replace(/background:\s*'#111827',\s*borderRadius/g, "background: '#f8fafc', borderRadius");
  
  // Border colors
  c = c.replace(/border:\s*'1px solid #334155'/g, "border: '1px solid #e2e8f0'");
  c = c.replace(/border:\s*'1px solid #475569'/g, "border: '1px solid #d1d5db'");
  c = c.replace(/border:\s*'1px solid #1e293b'/g, "border: '1px solid #e2e8f0'");
  c = c.replace(/borderBottom:\s*'1px solid #334155'/g, "borderBottom: '1px solid #f1f5f9'");
  c = c.replace(/borderBottom:\s*'1px solid #1e293b'/g, "borderBottom: '1px solid #f1f5f9'");
  c = c.replace(/borderTop:\s*'1px solid #334155'/g, "borderTop: '1px solid #e2e8f0'");
  c = c.replace(/borderColor:\s*'#334155'/g, "borderColor: '#e2e8f0'");
  c = c.replace(/borderColor:\s*'#475569'/g, "borderColor: '#d1d5db'");

  if (c !== orig) {
    fs.writeFileSync(f, c, 'utf8');
    totalFixed++;
    console.log('Fixed:', f);
  }
});

console.log(`\nTotal files fixed: ${totalFixed}`);
