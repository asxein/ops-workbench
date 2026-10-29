// CSV 파서/직렬화 (표준 모듈만). 따옴표·쉼표·줄바꿈 포함 필드 처리.
export function parseCsv(text) {
  const rows = [];
  let row = [], field = '', q = false;
  const src = text.replace(/^﻿/, '');
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (q) {
      if (c === '"') { if (src[i + 1] === '"') { field += '"'; i++; } else q = false; }
      else field += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && src[i + 1] === '\n') i++;
      row.push(field); rows.push(row); row = []; field = '';
    } else field += c;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  const [header, ...body] = rows.filter((r) => r.length > 1 || (r.length === 1 && r[0] !== ''));
  return body.map((r) => Object.fromEntries(header.map((h, i) => [h.trim(), (r[i] ?? '').trim()])));
}
export function toCsv(records, headers = Object.keys(records[0] ?? {}), { bom = true } = {}) {
  const esc = (v) => { const s = v === null || v === undefined ? '' : String(v); return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  const lines = [headers.join(','), ...records.map((r) => headers.map((h) => esc(r[h])).join(','))];
  return (bom ? '﻿' : '') + lines.join('\n') + '\n';
}
