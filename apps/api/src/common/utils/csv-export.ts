/**
 * CSV export utility with UTF-8 BOM for Excel compatibility
 * and pt-BR formatting for dates and decimals.
 */

export interface CsvColumn<T> {
  header: string;
  accessor: (row: T) => string | number | null | undefined;
}

/**
 * Generates a CSV Buffer from an array of rows and column definitions.
 * Includes UTF-8 BOM for proper Excel encoding.
 */
export function generateCsv<T>(rows: T[], columns: CsvColumn<T>[]): Buffer {
  const BOM = '\uFEFF';
  const SEPARATOR = ';'; // pt-BR standard separator

  const header = columns.map((col) => escapeCell(col.header)).join(SEPARATOR);

  const lines = rows.map((row) =>
    columns
      .map((col) => {
        const value = col.accessor(row);
        if (value === null || value === undefined) return '';
        return escapeCell(String(value));
      })
      .join(SEPARATOR),
  );

  const csv = BOM + [header, ...lines].join('\r\n');
  return Buffer.from(csv, 'utf-8');
}

function escapeCell(value: string): string {
  if (
    value.includes(';') ||
    value.includes('"') ||
    value.includes('\n') ||
    value.includes('\r')
  ) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/** Formats a number as pt-BR currency string (e.g. 1.234,56) */
export function formatMoney(value: number): string {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Formats a Date to dd/MM/yyyy */
export function formatDatePtBr(date: Date): string {
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

/** Formats a Date to dd/MM/yyyy HH:mm */
export function formatDateTimePtBr(date: Date): string {
  const h = date.getHours().toString().padStart(2, '0');
  const min = date.getMinutes().toString().padStart(2, '0');
  return `${formatDatePtBr(date)} ${h}:${min}`;
}

/**
 * Resolves a period string to start/end Date objects.
 * Uses current date as reference.
 */
export function resolvePeriodDates(
  period?: string,
  startDate?: string,
  endDate?: string,
): { start: Date; end: Date } {
  const now = new Date();
  const end = endDate ? new Date(endDate) : new Date(now);
  end.setHours(23, 59, 59, 999);

  if (startDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    return { start, end };
  }

  let start: Date;
  switch (period) {
    case 'today':
      start = new Date(now);
      start.setHours(0, 0, 0, 0);
      break;
    case 'week':
      start = new Date(now);
      start.setDate(start.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      break;
    case 'year':
      start = new Date(now);
      start.setFullYear(start.getFullYear() - 1);
      start.setHours(0, 0, 0, 0);
      break;
    case 'month':
    default:
      start = new Date(now);
      start.setMonth(start.getMonth() - 1);
      start.setHours(0, 0, 0, 0);
      break;
  }

  return { start, end };
}
