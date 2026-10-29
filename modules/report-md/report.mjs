// Markdown 리포트 생성. 회의용 "요약 3줄 → 후보 Top N(근거·표본) → 권장 조치 → 데이터 품질 메모" 순서.
export function mdTable(rows, headers = Object.keys(rows[0] ?? {})) {
  if (!rows.length) return '(없음)\n';
  const esc = (v) => String(v ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
  return [`| ${headers.join(' | ')} |`, `| ${headers.map(() => '---').join(' | ')} |`, ...rows.map((r) => `| ${headers.map((h) => esc(r[h])).join(' | ')} |`)].join('\n') + '\n';
}

export function buildReport({ title, period, summary = [], candidates = [], actions = [], quality = [], generatedAt = new Date().toISOString() }) {
  const parts = [`# ${title}`, '', `기간: ${period ?? '-'} · 생성: ${generatedAt}`, '', '## 요약', ...summary.map((s) => `- ${s}`), '', '## 후보 Top ' + candidates.length];
  parts.push(mdTable(candidates));
  parts.push('## 권장 조치', ...actions.map((a, i) => `${i + 1}. ${a}`), '', '## 데이터 품질 메모', ...quality.map((q) => `- ${q}`), '');
  return parts.join('\n');
}
