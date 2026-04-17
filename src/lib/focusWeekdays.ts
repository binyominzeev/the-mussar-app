export const ALL_WEEKDAYS = [0, 1, 2, 3, 4, 5, 6] as const
// Monday-first order for rendering weekday toggles.
export const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0] as const

export interface WeekdayLabels {
  weekdayMon: string
  weekdayTue: string
  weekdayWed: string
  weekdayThu: string
  weekdayFri: string
  weekdaySat: string
  weekdaySun: string
}

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

export function getWeekdayLabels(labels: WeekdayLabels): Record<number, string> {
  return {
    1: labels.weekdayMon,
    2: labels.weekdayTue,
    3: labels.weekdayWed,
    4: labels.weekdayThu,
    5: labels.weekdayFri,
    6: labels.weekdaySat,
    0: labels.weekdaySun,
  }
}
