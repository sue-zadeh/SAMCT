import { Link } from 'react-router-dom'
import { homeForRole, useSession } from '../security/session'

export default function AccountSecurity() {
  const { user } = useSession()
  const home = homeForRole(user?.role || 'Resident')
  return <main className="container py-5" style={{ maxWidth: 650 }}>
    <h1>Account security</h1>
    <p>Use your username and password to sign in. Changing your password signs out your existing sessions.</p>
    <Link className="btn btn-primary" to={`${home}/profile/password`}>Change password</Link>
    <p className="mt-3"><Link to={home}>Back to dashboard</Link></p>
  </main>
}
