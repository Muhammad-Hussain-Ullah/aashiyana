import { X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { useAuth } from '../../hooks/useAuth'
import { enquiryService } from '../../services/enquiryService'
import type { Hostel } from '../../types'

export function EnquiryModal({ hostel, onClose }: { hostel: Hostel; onClose: () => void }) {
  const { profile } = useAuth()
  const [name, setName] = useState(profile?.name ?? '')
  const [email, setEmail] = useState(profile?.email ?? '')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState(`Hi, I'd like to know about room availability at ${hostel.name}.`)
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true)
    try {
      await enquiryService.create({ hostelId: hostel.id, name, email, phone, message })
      toast.success('Enquiry sent. The hostel will get back to you.')
      onClose()
    } catch (error) { toast.error(`Could not send enquiry: ${(error as Error).message}`) } finally { setBusy(false) }
  }

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" onClick={onClose}>
    <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-card">
      <div className="flex items-start justify-between gap-3"><div><p className="eyebrow">Ask about availability</p><h2 className="mt-1 font-display text-xl font-semibold text-ink">{hostel.name}</h2></div><button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1 text-slate-400 hover:text-ink"><X className="h-5 w-5" /></button></div>
      <div className="mt-5 space-y-4">
        <label className="block"><span className="label">Your name</span><input required value={name} onChange={(e) => setName(e.target.value)} className="control mt-2" /></label>
        <label className="block"><span className="label">Email address</span><input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="control mt-2" /></label>
        <label className="block"><span className="label">Phone (optional)</span><input value={phone} onChange={(e) => setPhone(e.target.value)} className="control mt-2" /></label>
        <label className="block"><span className="label">Message</span><textarea required minLength={5} maxLength={2000} value={message} onChange={(e) => setMessage(e.target.value)} className="control mt-2 min-h-24 resize-y" /></label>
      </div>
      <button disabled={busy} className="mt-6 w-full rounded-xl bg-forest py-3.5 text-sm font-bold text-white transition hover:bg-ink disabled:opacity-60">{busy ? 'Sending…' : 'Send enquiry'}</button>
    </form>
  </div>
}
