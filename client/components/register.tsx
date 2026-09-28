import { useEffect, useState } from 'react'
import api, { API_BASE_URL } from '../security/api'
import { adminRoles, useSession } from '../security/session'
import Navbar from './navbar'

export default function Register() {
  const { user, loading: sessionLoading } = useSession()
  const administrator = !!user && adminRoles.includes(user.role)
  const manager = user?.role === 'VillageManager'
  const [form, setForm] = useState({ userName: '', firstName: '', lastName: '', email: '', role: 'Resident', village: 'Ngatea', password: '', confirmPassword: '' })
  const [image, setImage] = useState<File | null>(null)
  const [message, setMessage] = useState('')
  const [failed, setFailed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  useEffect(() => { if (manager && user) setForm(current => ({ ...current, village: user.village, role: 'Resident' })) }, [user?.village, manager])
  const change = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm(current => ({ ...current, [event.target.name]: event.target.value }))
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setMessage(''); setFailed(false)
    if (form.password !== form.confirmPassword) { setFailed(true); setMessage('Passwords do not match.'); return }
    if (form.password.length < 12 || new TextEncoder().encode(form.password).length > 72) {
      setFailed(true); setMessage('Use at least 12 characters and no more than 72 UTF-8 bytes for your password.'); return
    }
    setSubmitting(true)
    try {
      const data = new FormData()
      for (const [key, value] of Object.entries(form)) if (key !== 'confirmPassword') data.append(key, value)
      if (image) data.append('profileImage', image)
      const response = await api.post(`${API_BASE_URL}/api/register`, data)
      setMessage(response.data.message)
      setForm(current => ({ ...current, userName: '', firstName: '', lastName: '', email: '', password: '', confirmPassword: '' }))
      setImage(null)
    } catch (error: any) {
      setFailed(true); setMessage(error.response?.data?.message || 'Registration failed. Please try again.')
    } finally { setSubmitting(false) }
  }
  return <>
    <Navbar userType={administrator ? 'admin' : manager ? 'villageManager' : 'public'} />
    <main className="container py-5"><div className="row justify-content-center"><div className="col-lg-6 p-4 border rounded-4 shadow-sm">
      <h1>Register User</h1>
      {!administrator && !manager && <p>Your village manager or administrator must approve your account before you can log in.</p>}
      {message && <div role="alert" className={`alert ${failed ? 'alert-danger' : 'alert-success'}`}>{message}</div>}
      <form onSubmit={submit}>
        {(['userName', 'firstName', 'lastName', 'email'] as const).map(name => <div className="mb-3" key={name}>
          <label className="form-label" htmlFor={name}>{{ userName: 'Username', firstName: 'First Name', lastName: 'Last Name', email: 'Email' }[name]}</label>
          <input className="form-control" id={name} name={name} type={name === 'email' ? 'email' : 'text'} value={form[name]} onChange={change}
            required minLength={name === 'userName' ? 3 : undefined} maxLength={name === 'email' ? 254 : name === 'userName' ? 50 : 80}
            pattern={name === 'userName' ? '[A-Za-z0-9_.\\-]+' : undefined} autoComplete={name === 'userName' ? 'username' : name === 'email' ? 'email' : name === 'firstName' ? 'given-name' : 'family-name'} />
        </div>)}
        {administrator && <div className="mb-3"><label htmlFor="role" className="form-label">Role</label>
          <select id="role" name="role" className="form-select" value={form.role} onChange={change}>
            {['Resident', 'VillageManager', ...adminRoles].map(role => <option key={role} value={role}>{role}</option>)}
          </select></div>}
        <div className="mb-3"><label htmlFor="village" className="form-label">Village</label>
          <select id="village" name="village" className="form-select" value={form.village} onChange={change} disabled={manager}>
            <option>Ngatea</option><option>Whitianga</option>
          </select></div>
        <div className="mb-3"><label htmlFor="profileImage" className="form-label">Profile Image (PNG or JPEG, up to 2 MB)</label>
          <input id="profileImage" className="form-control" type="file" accept="image/png,image/jpeg" onChange={event => setImage(event.target.files?.[0] || null)} /></div>
        {(['password', 'confirmPassword'] as const).map(name => <div className="mb-3" key={name}>
          <label htmlFor={name} className="form-label">{name === 'password' ? 'Password' : 'Confirm Password'}</label>
          <input id={name} name={name} type="password" className="form-control" value={form[name]} onChange={change} required minLength={12} maxLength={72} autoComplete="new-password" />
        </div>)}
        <p className="small">Use a unique password with at least 12 characters.</p>
        <button type="submit" className="btn btn-primary w-100" disabled={submitting || sessionLoading}>{submitting ? 'Registering…' : 'Register User'}</button>
      </form>
    </div></div></main>
  </>
}
