const fs = require('fs');
const path = require('path');

// Walk directory recursively
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

  // ─── Fix: content wrapper div that uses old dark text colors ───────────────
  // The main content div after DashboardShell used to be: color: '#f1f5f9'
  // Now bg is light (#f0f4f8), so content text must be dark
  c = c.replace(/\bcolor:\s*'#f1f5f9'/g, "color: '#0f172a'");

  // Fix headings that hardcode white
  // But only within content areas (not inside sidebar which is handled by DashboardShell)
  // We replace color: 'white' inside style={{ ... }} blocks in content pages
  // Safe approach: replace color:'white' only on h1/h2/h3/p/div inside the content area
  // We can't easily detect "inside content area" so we replace only where bg is also dark
  c = c.replace(
    /background:\s*'#0f172a',\s*([^}]*)\s*color:\s*'white'/g,
    "background: '#f8fafc', $1color: '#0f172a'"
  );
  c = c.replace(
    /background:\s*'#1e293b',\s*([^}]*)\s*color:\s*'white'/g,
    "background: '#f1f5f9', $1color: '#0f172a'"
  );
  c = c.replace(
    /background:\s*'#0f172a',\s*border:\s*'1px solid #334155',\s*borderRadius:\s*'8px',\s*color:\s*'white'/g,
    "background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#0f172a'"
  );
  c = c.replace(
    /background:\s*'#0f172a',\s*border:\s*'1px solid #475569',\s*borderRadius:\s*'8px',\s*color:\s*'white'/g,
    "background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#0f172a'"
  );

  // Fix inline gradient dark backgrounds that wrap content
  c = c.replace(
    /background:\s*'linear-gradient\(135deg,\s*#020617[^']+\)'/g,
    "background: '#f0f4f8'"
  );

  // Fix content-level backgrounds that used dark colors
  c = c.replace(/\bminHeight:\s*'100vh',\s*background:\s*'#0f172a'/g, "minHeight: '100vh', background: '#f0f4f8'");
  c = c.replace(/\bminHeight:\s*'100vh',\s*background:\s*'#1e293b'/g, "minHeight: '100vh', background: '#f0f4f8'");

  // Fix table/card header colors that use dark bg
  c = c.replace(
    /background:\s*'#1e293b',\s*borderBottom:\s*'1px solid #334155'/g,
    "background: '#f8fafc', borderBottom: '1px solid #e2e8f0'"
  );
  c = c.replace(
    /background:\s*'#0f172a',\s*borderBottom:\s*'1px solid #1e293b'/g,
    "background: '#f8fafc', borderBottom: '1px solid #e2e8f0'"
  );

  // Fix table row hover colors
  c = c.replace(/background:\s*'#1e293b'\s*\}/g, "background: '#f8fafc' }");
  c = c.replace(/background:\s*'#334155'\s*\}/g, "background: '#f0f4f8' }");

  // Fix muted text from light-on-dark (#94a3b8) to proper muted on light (#64748b)  
  c = c.replace(/\bcolor:\s*'#94a3b8'/g, "color: '#64748b'");

  // Fix text that's hardcoded white in content headings (not buttons/avatars)
  // We target: <h1 style={{ ... color: 'white' }}> patterns
  c = c.replace(
    /(<h[123][^>]*style=\{\{[^}]*)\bcolor:\s*'white'/g,
    "$1color: '#0f172a'"
  );
  c = c.replace(
    /(<p[^>]*style=\{\{[^}]*)\bcolor:\s*'white'/g,
    "$1color: '#374151'"
  );

  // Fix table text
  c = c.replace(
    /(<td[^>]*style=\{\{[^}]*)\bcolor:\s*'white'/g,
    "$1color: '#0f172a'"
  );
  c = c.replace(
    /(<th[^>]*style=\{\{[^}]*)\bcolor:\s*'white'/g,
    "$1color: '#374151'"
  );

  // Fix div text that's white in content
  c = c.replace(
    /(<div[^>]*style=\{\{[^}]*)\bcolor:\s*'white',\s*fontWeight:\s*[67]00/g,
    "$1color: '#0f172a', fontWeight: 700"
  );
  c = c.replace(
    /(<span[^>]*style=\{\{[^}]*)\bcolor:\s*'white',\s*fontWeight:\s*[67]00/g,
    "$1color: '#0f172a', fontWeight: 700"
  );

  if (c !== original) {
    fs.writeFileSync(f, c, 'utf8');
    totalFixed++;
    console.log('Fixed:', f);
  }
});

console.log(`\nTotal files fixed: ${totalFixed}`);
