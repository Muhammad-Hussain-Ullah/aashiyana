import { Heart, MapPin, UsersRound, Wifi } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Hostel } from '../../types'
import { useAppState } from '../../hooks/useAppState'
import { Rating } from '../ui/Rating'
import { toast } from 'sonner'

export function HostelCard({ hostel, compact = false }: { hostel: Hostel; compact?: boolean }) {
  const { isFavorite, toggleFavorite, compareIds, toggleCompare } = useAppState()
  const favorite = isFavorite(hostel.id); const comparing = compareIds.includes(hostel.id)
  const handleFavorite = async () => { if (await toggleFavorite(hostel.id)) toast.success(favorite ? 'Removed from saved places' : 'Saved to your favorites') }
  return <article className={`group overflow-hidden rounded-2xl border border-[#e1e7df] bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-soft ${compact ? '' : ''}`}>
    <div className={`relative overflow-hidden ${compact ? 'h-44' : 'h-56'}`}><img src={hostel.coverImage} alt={hostel.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" onError={(e) => { e.currentTarget.style.display = 'none' }} /><div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
      <div className="absolute left-4 top-4 flex gap-2">{hostel.featured && <span className="rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-forest">Featured</span>}{hostel.gender !== 'All' && <span className="rounded-full bg-ink/75 px-2.5 py-1 text-[11px] font-semibold text-white">For {hostel.gender}</span>}</div>
      <button onClick={handleFavorite} aria-label={favorite ? `Remove ${hostel.name} from favorites` : `Save ${hostel.name}`} className={`absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/30 backdrop-blur-md transition ${favorite ? 'bg-white text-rose-500' : 'bg-black/20 text-white hover:bg-white hover:text-rose-500'}`}><Heart className={`h-4 w-4 ${favorite ? 'fill-current' : ''}`} /></button>
      <div className="absolute bottom-4 left-4 flex items-center gap-1.5 text-xs font-medium text-white"><MapPin className="h-3.5 w-3.5" />{hostel.location.area}</div>
    </div>
    <div className="p-5"><div className="flex items-start justify-between gap-3"><div><h3 className="font-display text-lg font-semibold leading-tight text-ink">{hostel.name}</h3><p className="mt-1 text-xs text-slate-500">{hostel.location.university}</p></div><Rating value={hostel.rating} count={hostel.reviewCount} /></div>
      <div className="mt-5 flex items-end justify-between"><div><p className="text-[11px] uppercase tracking-[0.13em] text-slate-400">Starting from</p><p className="mt-0.5 text-lg font-bold text-ink">PKR {hostel.startingRent.toLocaleString()}<span className="text-xs font-normal text-slate-400"> / month</span></p></div><span className="inline-flex items-center gap-1.5 rounded-lg bg-sand px-2.5 py-1.5 text-[11px] font-semibold text-forest"><UsersRound className="h-3.5 w-3.5" />{hostel.gender}</span></div>
      <div className="mt-4 flex items-center gap-2 overflow-hidden text-xs text-slate-500"><Wifi className="h-3.5 w-3.5 shrink-0 text-forest" /><span className="truncate">{hostel.amenities.slice(0, 3).map((a) => a.name).join(' · ')}</span></div>
      <div className="mt-5 flex gap-2"><Link to={`/hostels/${hostel.id}`} className="flex-1 rounded-xl bg-ink py-2.5 text-center text-sm font-semibold text-white transition hover:bg-forest">View details</Link><button onClick={() => { toggleCompare(hostel.id); toast.success(comparing ? 'Removed from comparison' : compareIds.length === 2 ? 'Added — comparison is ready' : 'Added to comparison') }} className={`rounded-xl border px-3 py-2.5 text-xs font-bold transition ${comparing ? 'border-forest bg-sand text-forest' : 'border-[#dce3d9] text-slate-600 hover:border-forest hover:text-forest'}`}>{comparing ? 'Comparing' : 'Compare'}</button></div>
    </div>
  </article>
}
