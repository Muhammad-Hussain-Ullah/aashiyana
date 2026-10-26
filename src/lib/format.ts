export function initialsOf(name: string): string {
  const parts = name.replace(/[^\p{L}\s]/gu, '').trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase()
}

/** "2 weeks ago", "last month", ... from an ISO timestamp. */
export function timeAgo(iso: string): string {
  const diff = (new Date(iso).getTime() - Date.now()) / 1000
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60]]
  for (const [unit, seconds] of units) if (Math.abs(diff) >= seconds) return rtf.format(Math.round(diff / seconds), unit)
  return 'just now'
}
