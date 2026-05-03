export function formatDate(
  value: Date | string | number,
  locale = "en",
  showYear = true,
  showTime = false,
): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    ...(showYear ? { year: "numeric" } : {}),
    ...(showTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  };

  return new Intl.DateTimeFormat(locale, options).format(date);
}

export function formatReadingTime(minutes: number, locale = "en"): string {
  const rounded = Math.max(1, Math.round(minutes));
  return locale.startsWith("zh") ? `${rounded} 分钟阅读` : `${rounded} min read`;
}
