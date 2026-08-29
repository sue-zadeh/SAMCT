import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { getSessionRole, homeForRole } from '../lib/auth'
import Seo from './seo'

type ProtectedRouteProps = {
  allowedRoles: readonly string[]
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const location = useLocation()
  const role = getSessionRole()

  if (!role) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to={homeForRole(role)} replace />
  }

  return (
    <>
      <Seo
        title="Secure portal | SAMCT Villages"
        description="Authorised SAMCT portal access."
        path={location.pathname}
        noIndex
      />
      <Outlet />
    </>
  )
}
