import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf-8');
code = code.replace(/res\.status\(401\)\.json\(\{ success: true/g, 'res.json({ success: true');
code = code.replace(/res\.status\(401\)\.json\(\{ user: /g, 'res.json({ user: ');
code = code.replace(/res\.status\(401\)\.json\(\{ total_users/g, 'res.json({ total_users');
code = code.replace(/res\.status\(401\)\.json\(\{ questions:/g, 'res.json({ questions:');
fs.writeFileSync('server.ts', code);
