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
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('src/app/admin');
let updatedCount = 0;

for (const file of files) {
    if (file.includes('users')) continue; // Skip users directory as it's already fixed
    
    let content = fs.readFileSync(file, 'utf8');
    const oldStr = "(session.user as any).role !== 'ADMIN'";
    const newStr = "!['ADMIN','DIRECTOR'].includes((session.user as any).role)";
    
    if (content.includes(oldStr)) {
        content = content.replace(oldStr, newStr);
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${file}`);
        updatedCount++;
    }
}
console.log(`Updated ${updatedCount} files.`);
