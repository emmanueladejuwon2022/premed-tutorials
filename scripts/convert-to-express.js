import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf-8');

// Replace imports
content = content.replace("import { Hono } from 'hono';", "import express from 'express';");
content = content.replace("import { serve } from '@hono/node-server';", "");
content = content.replace("import { serveStatic } from '@hono/node-server/serve-static';", "");
content = content.replace("const app = new Hono();", "const app = express();\napp.use(express.json());");

// Replace c.req.json() with req.body
content = content.replace(/await c\.req\.json\(\)/g, "req.body");

// Replace authMiddleware
content = content.replace(/const authMiddleware = async \(c: any, next: any\) => {/g, "const authMiddleware = async (req: any, res: any, next: any) => {");
content = content.replace(/const authHeader = c\.req\.header\('Authorization'\);/g, "const authHeader = req.header('Authorization');");
content = content.replace(/return c\.json\(\{ /g, "return res.status(401).json({ "); // wait, generic replace
// More generic: return c.json(X, Y) -> return res.status(Y).json(X)
content = content.replace(/return c\.json\((.*?),\s*(\d{3})\)/g, "return res.status($2).json($1)");
content = content.replace(/return c\.json\((.*?)\)/g, "return res.json($1)");
content = content.replace(/\(c as any\)\.set\('jwtPayload', decoded\);/g, "req.jwtPayload = decoded;");
content = content.replace(/const payload = \(c as any\)\.get\('jwtPayload'\);/g, "const payload = req.jwtPayload;");
content = content.replace(/const payload = c\.get\('jwtPayload'\) as any;/g, "const payload = req.jwtPayload;");
content = content.replace(/const payload = c\.get\('jwtPayload'\);/g, "const payload = req.jwtPayload;");


// Replace adminMiddleware
content = content.replace(/const adminMiddleware = async \(c: any, next: any\) => {/g, "const adminMiddleware = async (req: any, res: any, next: any) => {");

// Replace route signatures
content = content.replace(/app\.(get|post|put|delete)\('(.*?)',\s*authMiddleware,\s*adminMiddleware,\s*async \(c\) => \{/g, "app.$1('$2', authMiddleware, adminMiddleware, async (req: any, res: any) => {");
content = content.replace(/app\.(get|post|put|delete)\('(.*?)',\s*authMiddleware,\s*async \(c\) => \{/g, "app.$1('$2', authMiddleware, async (req: any, res: any) => {");
content = content.replace(/app\.(get|post|put|delete)\('(.*?)',\s*async \(c\) => \{/g, "app.$1('$2', async (req: any, res: any) => {");

// Replace params
content = content.replace(/c\.req\.param\('(.*?)'\)/g, "req.params.$1");
content = content.replace(/c\.req\.query\('(.*?)'\)/g, "req.query.$1");

// Replace serve mechanism
content = content.replace(/if \(process\.env\.NODE_ENV !== 'production'\) \{[\s\S]*?serve\(\{ fetch: app\.fetch, port \}\);\n\} else \{[\s\S]*?serve\(\{ fetch: app\.fetch, port \}\);\n\}/, 
`if (process.env.NODE_ENV !== 'production') {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
  app.listen(port, "0.0.0.0", () => {
    console.log(\`TestUs Server running DEV at http://localhost:\${port}\`);
  });
} else {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req: any, res: any) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
  app.listen(port, "0.0.0.0", () => {
    console.log(\`TestUs Server running PROD at http://localhost:\${port}\`);
  });
}`);

fs.writeFileSync('server.ts', content);
