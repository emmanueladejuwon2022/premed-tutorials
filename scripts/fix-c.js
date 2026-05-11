import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf-8');

// replace rogue `c` referencing
content = content.replace(/c\.json/g, 'res.json');
content = content.replace(/c\.req/g, 'req');
content = content.replace(/c\.get/g, 'req.get');
content = content.replace(/c\.env/g, 'req.env');
content = content.replace(/c\.text/g, 'res.send');
content = content.replace(/c\.html/g, 'res.send');

fs.writeFileSync('server.ts', content);
