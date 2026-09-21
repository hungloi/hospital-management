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
  let original = c;

  // Fix form inputs with dark backgrounds
  // background: '#0f172a', color: 'white' -> background: '#fff', color: '#0f172a'
  c = c.replace(
    /background:\s*'#0f172a',\s*(border:[^,]+,\s*)?(borderRadius:[^,]+,\s*)?color:\s*'white'/g,
    (match, p1, p2) => {
      return `background: '#ffffff', ${p1 || ''}${p2 || ''}color: '#0f172a'`;
    }
  );
  
  // Also fix backgroundColor: '#0f172a', color: 'white' (for inputStyle)
  c = c.replace(
    /backgroundColor:\s*'#0f172a',\s*color:\s*'white'/g,
    "backgroundColor: '#ffffff', color: '#0f172a'"
  );
  
  // Fix select elements with dark bg
  c = c.replace(
    /background:\s*'#0f172a',\s*border:\s*'1px solid #[34][37][45][15][56][59]',\s*borderRadius:\s*'8px',\s*color:\s*'white'/g,
    "background: '#ffffff', border: '1px solid #d1d5db', borderRadius: '8px', color: '#0f172a'"
  );
  c = c.replace(
    /background:\s*'#1e293b',\s*border:\s*'1px solid #334155',\s*borderRadius:\s*'8px',\s*color:\s*'white'/g,
    "background: '#ffffff', border: '1px solid #d1d5db', borderRadius: '8px', color: '#0f172a'"
  );

  // Table: thead with dark bg
  c = c.replace(
    /background:\s*'#1e293b',\s*color:\s*'#94a3b8'/g,
    "background: '#f1f5f9', color: '#64748b'"
  );
  c = c.replace(
    /background:\s*'#0f172a',\s*color:\s*'#94a3b8'/g,
    "background: '#f1f5f9', color: '#64748b'"
  );

  // Table rows
  c = c.replace(
    /background:\s*'(#1e293b|#0f172a|#0d1526)',\s*borderBottom:\s*'1px solid #(1e293b|334155|2d3748)'/g,
    "background: 'transparent', borderBottom: '1px solid #f1f5f9'"
  );
  c = c.replace(
    /borderBottom:\s*'1px solid #(1e293b|334155|2d3748)'/g,
    "borderBottom: '1px solid #f1f5f9'"
  );

  // Card/panel dark backgrounds in content area
  c = c.replace(
    /background:\s*'#(1e293b|0f172a|111827)',\s*borderRadius:\s*'(1[246]|8)px'/g,
    "background: '#ffffff', borderRadius: '$2px'"
  );

  // Fix remaining hardcoded colors in table cells
  c = c.replace(/\bcolor:\s*'#(e2e8f0|cbd5e1|f1f5f9|d1d5db)'/g, "color: '#475569'");

  // Fix outline color  
  c = c.replace(/\boutline:\s*'none'\s*\}/g, "outline: 'none' }");

  if (c !== original) {
    fs.writeFileSync(f, c, 'utf8');
    totalFixed++;
    console.log('Fixed:', f);
  }
});

console.log(`\nTotal files fixed: ${totalFixed}`);
