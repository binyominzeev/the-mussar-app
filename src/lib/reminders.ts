const REMINDER_TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/

export function normalizeReminderTime(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed) return null
  return REMINDER_TIME_RE.test(trimmed) ? trimmed : null
}

export function normalizeReminderDays(value: unknown): string | null {
  const parsed = parseReminderDays(value)
  if (!parsed) return null
  return parsed.join(',')
}

export function parseReminderDays(value: unknown): number[] | null {
  if (Array.isArray(value)) {
    if (value.length === 0) return null
    const parsed = value
      .map((day) => {
        if (typeof day === 'number') return day
        if (typeof day === 'string' && /^-?\d+$/.test(day)) return Number(day)
        return Number.NaN
      })
      .filter((day) => Number.isInteger(day) && day >= 0 && day <= 6)
    if (parsed.length !== value.length) return null
    return Array.from(new Set(parsed)).sort((a, b) => a - b)
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return null
    return parseReminderDays(trimmed.split(',').map((part) => part.trim()))
  }

  return null
}

export function isReminderDue(reminderTime: string, reminderDaysCsv: string, now: Date): boolean {
  if (!REMINDER_TIME_RE.test(reminderTime)) return false
  const reminderDays = parseReminderDays(reminderDaysCsv)
  if (!reminderDays) return false

  const [hours, minutes] = reminderTime.split(':').map(Number)
  return reminderDays.includes(now.getDay()) && now.getHours() === hours && now.getMinutes() === minutes
}
