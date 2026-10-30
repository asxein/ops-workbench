// 표준 모듈 HTTP 서버. 0.0.0.0 + PORT. GET / → public/index.html, /api/* → JSON.
import http from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import { loadRecords, clean } from '../ingest-std/ingest.mjs';
import { createMemoryRepo } from '../repo-memory/repo.mjs';
import { toCsv } from '../csv-std/csv.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function createApp({ dataPath = process.env.DATA_PATH ?? 'data/input.csv' } = {}) {
  const repo = createMemoryRepo(existsSync(dataPath) ? clean(loadRecords(dataPath)) : []);
  return http.createServer((req, res) => {
    const url = new URL(req.url, 'http://x');
    const send = (code, body, type = 'application/json') => {
      res.writeHead(code, { 'content-type': `${type}; charset=utf-8` });
      res.end(type === 'application/json' ? JSON.stringify(body) : body);
    };
    try {
      if (url.pathname === '/') return send(200, readFileSync(path.join(ROOT, 'ui-table/index.html'), 'utf8'), 'text/html');
      if (url.pathname === '/api/health') return send(200, { ok: true, rows: repo.size() });
      if (url.pathname === '/api/rows') {
        const q = (url.searchParams.get('q') ?? '').toLowerCase();
        const rows = repo.list((r) => !q || JSON.stringify(r).toLowerCase().includes(q));
        return send(200, { total: rows.length, rows: rows.slice(0, 200) });
      }
      if (url.pathname === '/api/rows.csv') {
        res.setHeader('content-disposition', 'attachment; filename="rows.csv"');
        return send(200, toCsv(repo.list()), 'text/csv');
      }
      return send(404, { error: 'not found' });
    } catch (e) {
      return send(500, { error: e.message });
    }
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number(process.env.PORT ?? 3000);
  createApp().listen(port, '0.0.0.0', () => console.log(`listening on http://localhost:${port}  (bind 0.0.0.0)`));
}
