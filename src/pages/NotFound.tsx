import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
export function NotFound() { return <div className="mx-auto max-w-xl px-5 py-32 text-center"><p className="eyebrow">404 · a little off the map</p><h1 className="mt-4 font-display text-5xl font-semibold">This place doesn’t exist.</h1><p className="mt-4 text-sm leading-6 text-slate-500">Let’s get you back to the good options.</p><Link to="/" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-3 text-sm font-bold text-white"><ArrowLeft className="h-4 w-4" /> Back home</Link></div> }
