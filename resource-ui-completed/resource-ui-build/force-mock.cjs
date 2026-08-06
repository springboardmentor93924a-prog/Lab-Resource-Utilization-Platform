const fs = require('fs');
const files = fs.readdirSync('src/services').filter(f => f.endsWith('.js') && f !== 'api.js');
for (const file of files) {
  const path = 'src/services/' + file;
  let content = fs.readFileSync(path, 'utf-8');
  content = content.replace(/localStorage\.getItem\("devMode"\)\s*===\s*"true"/g, 'true /* FORCE MOCK DATA FOR NOW */');
  fs.writeFileSync(path, content);
}
console.log("Mock data forced enabled across all services!");
