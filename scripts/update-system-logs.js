import fs from 'fs';
let code = fs.readFileSync('src/views/admin/SystemLogs.tsx', 'utf-8');
code = code.replace(/incident\.description/g, '`[${incident.type}] ${incident.details || incident.violation}`');
code = code.replace(/incident\.course_id\?\./g, 'incident.session_id?.course_id?.');
fs.writeFileSync('src/views/admin/SystemLogs.tsx', code);
