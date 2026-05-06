const escapeCsvField = (value) => {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

export const toCsv = (rows, columns) => {
  if (!Array.isArray(rows) || !Array.isArray(columns)) return '';
  const header = columns.map((c) => escapeCsvField(c.label)).join(',');
  const body = rows
    .map((row) =>
      columns
        .map((c) => {
          const raw = typeof c.get === 'function' ? c.get(row) : row[c.key];
          return escapeCsvField(raw);
        })
        .join(','),
    )
    .join('\n');
  return body ? `${header}\n${body}` : header;
};

export const downloadCsv = (filename, rows, columns) => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const csv = toCsv(rows, columns);
  const BOM = '\ufeff';
  const blob = new Blob([BOM, csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const buildCsvFilename = (slug, range) => {
  const safeSlug = String(slug || 'report').replace(/[^a-z0-9-]+/gi, '-');
  const start = range?.start ? new Date(range.start).toISOString().slice(0, 10) : '';
  const end = range?.end ? new Date(range.end).toISOString().slice(0, 10) : '';
  const stamp = start && end ? `_${start}_to_${end}` : '';
  return `${safeSlug}${stamp}.csv`;
};
