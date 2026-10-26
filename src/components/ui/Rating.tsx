import { Star } from 'lucide-react'

export function Rating({ value, count, size = 'sm' }: { value: number; count?: number; size?: 'sm' | 'md' }) {
  return <span className={`inline-flex items-center gap-1 ${size === 'md' ? 'text-sm' : 'text-xs'}`}>
    <Star className={`${size === 'md' ? 'h-4 w-4' : 'h-3.5 w-3.5'} fill-[#f4b860] text-[#f4b860]`} />
    <span className="font-semibold text-ink">{value.toFixed(1)}</span>
    {count !== undefined && <span className="text-slate-500">({count})</span>}
  </span>
}
