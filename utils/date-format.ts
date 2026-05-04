function isToday(date: Date): boolean {
  const today = new Date();
  return date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();
}

function isYesterday(date: Date): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate();
}

function isSameWeek(date: Date): boolean {
  const now = new Date();
  const getMonday = (d: Date): Date => {
    const day = d.getDay();
    const diff = day === 0 ? 6 : day - 1;
    const monday = new Date(d);
    monday.setDate(d.getDate() - diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  };
  return getMonday(date).getTime() === getMonday(now).getTime();
}

/**
 * Format date using Intl.DateTimeFormat
 * @param date - Date to format
 * @param locale - Locale code (e.g., 'en', 'zh-CN', 'es')
 * @param showTime - Whether to show time
 * @param useAlias - Whether to use friendly aliases (Today, Yesterday, weekday names)
 * @returns Formatted date string
 */
export function formatDate(
  date: Date,
  locale: string,
  showTime?: boolean,
  useAlias: boolean = true
): string {
  if (!date || !(date instanceof Date) || !Number.isFinite(date.getTime())) {
    return '';
  }

  const now = new Date();

  // Friendly aliases
  if (useAlias) {
    if (isToday(date)) {
      return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(0, 'day');
    }

    if (isYesterday(date)) {
      return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(-1, 'day');
    }

    if (isSameWeek(date)) {
      return new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(date);
    }
  }

  // Date formatting options based on same year or not
  const isSameYear = date.getFullYear() === now.getFullYear();
  const dateOptions: Intl.DateTimeFormatOptions = isSameYear && useAlias
    ? { month: 'short', day: 'numeric' }
    : { year: 'numeric', month: 'short', day: 'numeric' };

  let result = new Intl.DateTimeFormat(locale, dateOptions).format(date);

  if (showTime) {
    const timeStr = new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date);
    result += ' ' + timeStr;
  }

  return result;
}

/**
 * Format relative time (e.g., "2 hours ago", "in 3 days")
 * Uses Intl.RelativeTimeFormat for localized output
 */
export function formatRelativeTime(date: Date, locale: string): string {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const diffMs = date.getTime() - Date.now();
  const diffAbs = Math.abs(diffMs);

  const units: [number, Intl.RelativeTimeFormatUnit][] = [
    [60_000, 'minute'], [3_600_000, 'hour'], [86_400_000, 'day'],
    [604_800_000, 'week'], [2_592_000_000, 'month'], [31_536_000_000, 'year']
  ];

  for (const [ms, unit] of units) {
    if (diffAbs < ms) return rtf.format(Math.round(diffMs / ms), unit);
  }
  return rtf.format(Math.round(diffMs / 31_536_000_000), 'year');
}

/**
 * Format reading time duration
 * @param minutes - Reading time in minutes
 * @param locale - Locale code
 * @returns Formatted reading time string (e.g., "5 minutes", "5 分钟")
 */
export function formatReadingTime(minutes: number, locale: string): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'unit',
      unit: 'minute',
      unitDisplay: 'long'
    }).format(minutes);
  } catch {
    return `${minutes} min`;
  }
}