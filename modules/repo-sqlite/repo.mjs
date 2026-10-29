// 저장 계층: node:sqlite 구현 (Node 22.13+). repo-memory와 같은 인터페이스 {list, get, upsert, size}.
// 사용 전 확인: node -e "require('node:sqlite')"  (실패하면 repo-memory를 쓴다)
import { DatabaseSync } from 'node:sqlite';

export function createSqliteRepo({ file = ':memory:', table = 'rows', columns } = {}) {
  const db = new DatabaseSync(file);
  const cols = columns ?? ['id'];
  db.exec(`CREATE TABLE IF NOT EXISTS ${table} (${cols.map((c) => `"${c}" TEXT`).join(', ')}, PRIMARY KEY("id"))`);
  const insert = db.prepare(`INSERT OR REPLACE INTO ${table} (${cols.map((c) => `"${c}"`).join(',')}) VALUES (${cols.map(() => '?').join(',')})`);
  return {
    list(filter = () => true) { return db.prepare(`SELECT * FROM ${table}`).all().filter(filter); },
    get(id) { return db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(String(id)) ?? null; },
    upsert(row) { insert.run(...cols.map((c) => (row[c] === undefined || row[c] === null ? null : String(row[c])))); return row; },
    size() { return db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get().n; },
    close() { db.close(); },
  };
}
