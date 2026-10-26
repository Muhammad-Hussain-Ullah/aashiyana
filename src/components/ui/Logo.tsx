import { House } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Logo() {
  return <Link to="/" className="group inline-flex items-center gap-2.5" aria-label="Aashiyana home">
    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest text-white shadow-sm transition-transform group-hover:-rotate-3"><House className="h-5 w-5" strokeWidth={2.2} /></span>
    <span className="font-display text-[1.35rem] font-semibold tracking-tight text-ink">aashiyana<span className="text-forest">.</span>pk</span>
  </Link>
}
