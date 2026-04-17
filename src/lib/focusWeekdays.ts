export const ALL_WEEKDAYS = [0, 1, 2, 3, 4, 5, 6] as const
export const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0] as const

export function normalizeWeekdays(input: unknown): number[] {
  if (!Array.isArray(input)) return [...ALL_WEEKDAYS]
  return Array.from(
    new Set(
      input
        .map((value) => Number(value))
        .filter((value) => Number.isInteger(value) && value >= 0 && value <= 6)
    )
  ).sort((a, b) => a - b)
}

export function parseWeekdaysCsv(csv: string | null | undefined): number[] {
  if (csv == null) return [...ALL_WEEKDAYS]
  if (csv.trim() === '') return []
  return normalizeWeekdays(csv.split(','))
}

export function weekdaysToCsv(days: number[]): string {
  return normalizeWeekdays(days).join(',')
}

export function isWeekdayActive(activeWeekdaysCsv: string | null | undefined, date: Date): boolean {
  const weekdays = parseWeekdaysCsv(activeWeekdaysCsv)
  return weekdays.includes(date.getDay())
}
