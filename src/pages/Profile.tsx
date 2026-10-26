import { Check, ChevronDown, Mail, MapPin, UserRound } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { useAuth } from '../hooks/useAuth'

const universities = ['University of Karachi', 'Institute of Business Administration', 'NED University of Engineering & Technology', 'Bahria University Karachi', 'SZABIST']

export function Profile() {
  const { profile, updateProfile } = useAuth()
  const [fullName, setFullName] = useState(profile?.name ?? '')
  const [university, setUniversity] = useState(profile?.university ?? '')
  const [city, setCity] = useState(profile?.city ?? '')
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState(false)
  const options = university && !universities.includes(university) ? [university, ...universities] : universities

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true)
    try { await updateProfile({ fullName, university, city }); setSaved(true); toast.success('Profile saved') } catch (error) { toast.error(`Could not save profile: ${(error as Error).message}`) } finally { setBusy(false) }
  }

  return <div className="mx-auto max-w-3xl px-5 py-12 lg:px-8"><p className="eyebrow">Your details</p><h1 className="section-title mt-2">Your profile.</h1><p className="mt-3 text-sm text-slate-500">Keep your details up to date to make searching easier.</p>
    <div className="mt-10 rounded-2xl border border-[#dfe7dc] bg-white p-6 shadow-card sm:p-8">
      <div className="flex items-center gap-4 border-b border-[#e7ede4] pb-7"><div className="flex h-16 w-16 items-center justify-center rounded-full bg-forest font-display text-xl font-semibold text-lime">{profile?.avatar}</div><div><h2 className="font-display text-xl font-semibold">{profile?.name}</h2><p className="mt-1 text-sm capitalize text-slate-500">{profile?.role ?? 'student'} account</p></div><button type="button" onClick={() => toast.info('Photo uploads will be connected to Storage later')} className="ml-auto hidden rounded-xl border border-[#dfe7dc] px-3 py-2 text-xs font-bold sm:block">Change photo</button></div>
      <form onSubmit={submit} className="mt-7 space-y-5">
        <label className="block"><span className="label">Full name</span><span className="relative mt-2 block"><UserRound className="field-icon" /><input required value={fullName} onChange={(e) => setFullName(e.target.value)} className="control pl-10" /></span></label>
        <label className="block"><span className="label">Email address</span><span className="relative mt-2 block"><Mail className="field-icon" /><input type="email" disabled value={profile?.email ?? ''} className="control pl-10 opacity-70" /></span><span className="mt-1 block text-xs text-slate-400">Your email is your login and can’t be changed here.</span></label>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block"><span className="label">University</span><span className="relative mt-2 block"><select value={university} onChange={(e) => setUniversity(e.target.value)} className="control appearance-none pr-8"><option value="">Select your university</option>{options.map((name) => <option key={name}>{name}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /></span></label>
          <label className="block"><span className="label">Preferred city</span><span className="relative mt-2 block"><MapPin className="field-icon" /><input value={city} onChange={(e) => setCity(e.target.value)} className="control pl-10" placeholder="Karachi" /></span></label>
        </div>
        <div className="flex justify-end pt-2"><button disabled={busy} className="flex items-center gap-2 rounded-xl bg-ink px-5 py-3 text-sm font-bold text-white hover:bg-forest disabled:opacity-60">{saved && !busy && <Check className="h-4 w-4" />} {busy ? 'Saving…' : 'Save changes'}</button></div>
      </form>
    </div>
  </div>
}
