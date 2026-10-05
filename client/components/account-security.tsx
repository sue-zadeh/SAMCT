import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios, { API_BASE_URL } from '../security/api'
import { homeForRole, useSession } from '../security/session'
import type { AxiosError } from 'axios'

export default function AccountSecurity() {
  const { user } = useSession()
  const navigate = useNavigate()
  const [status, setStatus] = useState<{ enabled: boolean; required: boolean; recoveryCodesRemaining: number } | null>(null)
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [recovery, setRecovery] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [codes, setCodes] = useState<string[]>([])
  const [complete, setComplete] = useState(false)
  useEffect(() => { axios.get(`${API_BASE_URL}/api/mfa/status`).then(response => setStatus(response.data)).catch(() => setError('Could not load your security settings.')) }, [])
  const update = async (action: 'enroll' | 'recovery-codes' | 'disable') => {
    setBusy(true); setError('')
    try {
      const response = await axios.post(`${API_BASE_URL}/api/mfa/${action}`, { currentPassword: password, ...(recovery ? { recoveryCode: code } : { code: code || undefined }) })
      setPassword(''); setCode('')
      if (action === 'enroll') navigate('/login?mfa=setup')
      else { setCodes(response.data.recoveryCodes); setComplete(true) }
    } catch (error) { setError((error as AxiosError<{ message: string }>).response?.data.message || 'Could not update security settings.') }
    finally { setBusy(false) }
  }
  return <main className="container py-5" style={{ maxWidth: 650 }}>
    <h1>Account security</h1>
    {error && <p role="alert" className="alert alert-danger">{error}</p>}
    {complete ? <section><h2 className="h4">Security settings updated</h2>
      {codes.length > 0 && <><p>Save these new recovery codes securely. Your old codes no longer work. Each new code can be used once.</p><pre data-testid="recovery-codes">{codes.join('\n')}</pre></>}
      <p>Other sessions have been signed out.</p><Link to={homeForRole(user?.role || 'Resident')}>Back to dashboard</Link>
    </section> : status && <form onSubmit={event => { event.preventDefault(); void update(status.enabled ? 'recovery-codes' : 'enroll') }}>
      <p>{status.enabled ? `Two-factor authentication is enabled. You have ${status.recoveryCodesRemaining} recovery codes remaining.` : 'Add an authenticator app to protect your account with a second login step.'}</p>
      {status.required && <p>Two-factor authentication is required for your staff role.</p>}
      <label htmlFor="security-password">Current password</label><input id="security-password" type="password" className="form-control mb-3" required maxLength={72} autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} />
      {status.enabled && <><label htmlFor="security-code">{recovery ? 'Recovery code' : 'Authenticator code'}</label><input id="security-code" className="form-control mb-2" required autoComplete="one-time-code" maxLength={recovery ? 39 : 6} value={code} onChange={event => setCode(event.target.value)} /><button type="button" className="btn btn-link mb-3" onClick={() => { setRecovery(!recovery); setCode('') }}>{recovery ? 'Use an authenticator code' : 'Use a recovery code'}</button></>}
      <div className="d-flex gap-3 flex-wrap"><button disabled={busy} className="btn btn-primary">{status.enabled ? 'Generate new recovery codes' : 'Set up authenticator'}</button>
        {status.enabled && !status.required && <button type="button" disabled={busy || !password || !code} className="btn btn-outline-danger" onClick={() => void update('disable')}>Disable two-factor authentication</button>}
      </div><p className="mt-3"><Link to={homeForRole(user?.role || 'Resident')}>Back to dashboard</Link></p>
    </form>}
  </main>
}
