// All date handling here works with local calendar dates as plain
// YYYY-MM-DD strings, never with timestamps or UTC conversions. That
// keeps "today" stable across a user's timezone and avoids off-by-one
// bugs from Date.toISOString() shifting near midnight.

export function todayISO(): string {
  return formatISO(new Date())
}

export function formatISO(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function parseISO(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(dateStr: string, days: number): string {
  const d = parseISO(dateStr)
  d.setDate(d.getDate() + days)
  return formatISO(d)
}

// Lexicographic comparison is safe and correct for YYYY-MM-DD strings.
export function compareISO(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0
}
