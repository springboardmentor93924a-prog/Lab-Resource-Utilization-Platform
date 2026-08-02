const fs = require('fs');
const files = fs.readdirSync('src/services').filter(f => f.endsWith('.js') && f !== 'api.js');
for (const file of files) {
  const path = 'src/services/' + file;
  let content = fs.readFileSync(path, 'utf-8');
  content = content.replace(/true \/\* FORCE MOCK DATA FOR NOW \*\//g, 'localStorage.getItem("devMode") === "true"');
  fs.writeFileSync(path, content);
}
console.log('Reverted mock data');
