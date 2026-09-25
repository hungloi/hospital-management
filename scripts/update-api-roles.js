const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('src/app/api/admin');
let updatedCount = 0;

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    const oldStr = "(session.user as any).role !== 'ADMIN'";
    const newStr = "!['ADMIN','DIRECTOR'].includes((session.user as any).role)";
    
    if (content.includes(oldStr)) {
        content = content.replace(new RegExp(oldStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newStr);
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated API: ${file}`);
        updatedCount++;
    }
}
console.log(`Updated ${updatedCount} API files.`);
