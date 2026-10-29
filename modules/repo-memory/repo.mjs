// 저장 계층 인터페이스. 운영 전환 시 이 파일의 구현만 교체한다(SQLite/Postgres).
export function createMemoryRepo(seed = []) {
  const rows = seed.map((r, i) => ({ id: r.id ?? i + 1, ...r }));
  return {
    list(filter = () => true) { return rows.filter(filter); },
    get(id) { return rows.find((r) => String(r.id) === String(id)) ?? null; },
    upsert(row) {
      const i = rows.findIndex((r) => String(r.id) === String(row.id));
      if (i >= 0) rows[i] = { ...rows[i], ...row }; else rows.push(row);
      return row;
    },
    size() { return rows.length; },
  };
}
