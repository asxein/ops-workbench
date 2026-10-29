// 문서 조각 키워드 검색 (역색인 + 간이 BM25). 외부 의존성 없음. 문서 수백 개 규모용.
const tokenize = (s) => String(s ?? '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').split(' ').filter((t) => t.length > 1);

// chunks: [{ id, title, text, source }]
export function buildIndex(chunks) {
  const df = new Map(), docs = [];
  for (const c of chunks) {
    const tokens = tokenize(`${c.title ?? ''} ${c.text ?? ''}`);
    const tf = new Map();
    for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);
    for (const t of tf.keys()) df.set(t, (df.get(t) ?? 0) + 1);
    docs.push({ chunk: c, tf, len: tokens.length });
  }
  const avg = docs.reduce((s, d) => s + d.len, 0) / (docs.length || 1);
  return { docs, df, avg, n: docs.length };
}

// 질의 토큰 t는 문서 토큰이 t로 시작하면 매칭(한국어 조사 '승인이/승인을' 흡수). 확장 어휘는 인덱스 어휘에서 찾는다.
function expand(index, t) {
  if (!index.vocab) index.vocab = [...index.df.keys()];
  return index.vocab.filter((v) => v === t || (t.length >= 2 && v.startsWith(t)));
}
export function search(index, query, { limit = 5, k1 = 1.5, b = 0.75 } = {}) {
  const q = [...new Set(tokenize(query))];
  if (!q.length) return [];
  const groups = q.map((t) => ({ t, terms: expand(index, t) })).filter((g) => g.terms.length);
  const scored = index.docs.map((d) => {
    let score = 0; const matched = [];
    for (const g of groups) {
      const f = g.terms.reduce((s2, v) => s2 + (d.tf.get(v) ?? 0), 0); if (!f) continue;
      const dfv = Math.min(index.n, g.terms.reduce((s2, v) => s2 + (index.df.get(v) ?? 0), 0));
      const idf = Math.log(1 + (index.n - dfv + 0.5) / (dfv + 0.5));
      score += idf * (f * (k1 + 1)) / (f + k1 * (1 - b + b * d.len / (index.avg || 1)));
      matched.push(g.t);
    }
    return { chunk: d.chunk, score, matched };
  }).filter((r) => r.score > 0);
  return scored.sort((a, b2) => b2.score - a.score).slice(0, limit);
}

// 문서를 제목(#, ##) 단위 조각으로 나눈다. 절차 단계를 끊지 않도록 제목 기준.
export function chunkMarkdown(text, source) {
  const out = []; let title = source, buf = [];
  const flush = () => { if (buf.join('').trim()) out.push({ id: `${source}#${out.length + 1}`, title, text: buf.join('\n').trim(), source }); buf = []; };
  for (const line of String(text).split(/\r?\n/)) {
    const m = /^#{1,3}\s+(.+)/.exec(line);
    if (m) { flush(); title = m[1].trim(); } else buf.push(line);
  }
  flush();
  return out;
}
