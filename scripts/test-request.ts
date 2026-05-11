import http from 'http';

const req = http.request({
  hostname: '127.0.0.1',
  port: 3000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(res.statusCode, data));
});

req.on('error', (e) => console.error('Error:', e));
req.write(JSON.stringify({ email: 'student@testus.com', password: 'password123' }));
req.end();
