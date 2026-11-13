// Ferramenta de recorte da arte: `npm run recortar` e abra http://localhost:8090/tools/recortar.html
// Lê as imagens de assets/originais/, recorta folhas de expressões, tira o fundo e salva em assets/characters|items|areas.
// Só para uso local: o servidor do jogo (server.js) continua somente leitura.
import { createServer } from 'node:http';
import { readFile, readdir, writeFile, mkdir } from 'node:fs/promises';
import { extname, join, normalize, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';

const root = fileURLToPath(new URL('..', import.meta.url));
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg' };
const port = +process.env.PORT || 8090;
const SAFE = /^(characters|items|areas)\/[a-z0-9-]+\.(png|webp)$/;

const body = (req) => new Promise((ok, bad) => { const parts = []; req.on('data', (c) => parts.push(c)); req.on('end', () => ok(Buffer.concat(parts))); req.on('error', bad); });

createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  try {
    if (url.pathname === '/api/originais') {
      const files = (await readdir(join(root, 'assets/originais'))).filter((f) => /\.(png|webp|jpe?g)$/i.test(f)).sort();
      res.writeHead(200, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify(files));
    }
    if (url.pathname === '/api/salvar' && req.method === 'POST') {
      const f = url.searchParams.get('f') || '';
      if (!SAFE.test(f)) { res.writeHead(400); return res.end('nome inválido'); }
      const dest = join(root, 'assets', f);
      await mkdir(dirname(dest), { recursive: true });
      await writeFile(dest, await body(req));
      res.writeHead(200); return res.end('ok');
    }
    if (url.pathname === '/api/manifesto' && req.method === 'POST') {
      execFile(process.execPath, [join(root, 'tools/build-manifest.mjs')], (err, out, errOut) => {
        res.writeHead(err ? 500 : 200, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end(out + errOut);
      });
      return;
    }
    let p = normalize(decodeURIComponent(url.pathname));
    if (p.endsWith('/') || p.endsWith('\\')) p += 'index.html';
    const file = join(root, p);
    if (!file.startsWith(root)) throw new Error('fora da raiz');
    const data = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(data);
  } catch { res.writeHead(404); res.end('Não encontrado'); }
}).listen(port, () => console.log(`Recorte de arte em http://localhost:${port}/tools/recortar.html`));
