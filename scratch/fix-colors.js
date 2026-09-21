const fs = require('fs');
const path = require('path');

const walk = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx')) {
      results.push(file);
    }
  });
  return results;
};

const files = walk('src/app');
files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  let changed = false;
  
  if (c.match(/sidebar:\s*'(#ffffff|#1e293b|#111827|#0f172a)'/g)) {
    c = c.replace(/sidebar:\s*'(#ffffff|#1e293b|#111827|#0f172a)'/g, "sidebar: '#0a1628'");
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(f, c, 'utf8');
    console.log('Fixed sidebar color in:', f);
  }
});
console.log('Done');
