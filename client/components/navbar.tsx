import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'

type UserType = 'public' | 'resident' | 'admin' | 'villageManager'

type NavbarProps = {
  userType: UserType
}

export default function Navbar({ userType }: NavbarProps) {
  const navigate = useNavigate()
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('firstname')
    localStorage.removeItem('lastname')
    localStorage.removeItem('fullname')
    localStorage.removeItem('role')
    localStorage.removeItem('profileImageUrl')
    localStorage.removeItem('email')
    localStorage.removeItem('username')
    localStorage.removeItem('village')
    navigate('/')
  }

  const publicLinks = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Marketing', path: '/marketing' },
    { label: 'Contact', path: '/contactUs' },
    { label: 'Login', path: '/login' },
    { label: 'Register', path: '/register' },
  ]

  const residentLinks = [
    { label: 'Dashboard', path: '/resident' },
    { label: 'Maintenance', path: '/resident/maintenance' },
    // { label: "My Requests", path: "/resident/requests" },
    { label: 'Documents & Notices', path: '/resident/documents' },
  ]

  const adminLinks = [
    { label: 'Dashboard', path: '/admin' },
    { label: 'Village Data', path: '/admin/village-properties' },
    { label: 'Maintenance', path: '/admin/maintenance' },
    { label: 'Documents & Notices', path: '/admin/documents' },
    { label: 'Purchase Orders', path: '/admin/purchase-orders' },
    { label: 'Manage Profiles', path: '/admin/people' },
    { label: 'Register', path: '/register' },
  ]

  const villageManagerLinks = [
    { label: 'Dashboard', path: '/village-manager' },
    { label: 'My Village', path: '/village-manager/my-village' },
    { label: 'Maintenance', path: '/village-manager/maintenance' },
    { label: 'Residents', path: '/village-manager/residents' },
    { label: 'Documents & Notices', path: '/village-manager/documents' },
    { label: 'Purchase Orders', path: '/village-manager/purchase-orders' },
    { label: 'Register', path: '/register' },
  ]

  let links = publicLinks

  if (userType === 'resident') {
    links = residentLinks
  }

  if (userType === 'admin') {
    links = adminLinks
  }

  if (userType === 'villageManager') {
    links = villageManagerLinks
  }

  const renderProfileMenu = () => {
    if (userType === 'resident') {
      return (
        <div
          style={styles.dropdownWrapper}
          onMouseEnter={() => setShowProfileMenu(true)}
          onMouseLeave={() => setShowProfileMenu(false)}
        >
          <button type="button" style={styles.dropdownButton}>
            Profile
          </button>

          {showProfileMenu && (
            <div style={styles.dropdownMenu}>
              <Link to="/resident/profile" style={styles.dropdownItem}>
                My Profile
              </Link>
              <Link to="/resident/profile/edit" style={styles.dropdownItem}>
                Edit Profile
              </Link>
              <Link to="/resident/profile/password" style={styles.dropdownItem}>
                Change Password
              </Link>
            </div>
          )}
        </div>
      )
    }

    if (userType === 'admin') {
      return (
        <div
          style={styles.dropdownWrapper}
          onMouseEnter={() => setShowProfileMenu(true)}
          onMouseLeave={() => setShowProfileMenu(false)}
        >
          <button type="button" style={styles.dropdownButton}>
            Profile
          </button>

          {showProfileMenu && (
            <div style={styles.dropdownMenu}>
              <Link to="/admin/profile" style={styles.dropdownItem}>
                My Profile
              </Link>
              <Link to="/admin/profile/edit" style={styles.dropdownItem}>
                Edit Profile
              </Link>
              <Link to="/admin/profile/password" style={styles.dropdownItem}>
                Change Password
              </Link>
              <Link to="/admin/people" style={styles.dropdownItem}>
                Manage Users
              </Link>
            </div>
          )}
        </div>
      )
    }

    if (userType === 'villageManager') {
      return (
        <div
          style={styles.dropdownWrapper}
          onMouseEnter={() => setShowProfileMenu(true)}
          onMouseLeave={() => setShowProfileMenu(false)}
        >
          <button type="button" style={styles.dropdownButton}>
            Profile
          </button>

          {showProfileMenu && (
            <div style={styles.dropdownMenu}>
              <Link to="/village-manager/profile" style={styles.dropdownItem}>
                My Profile
              </Link>
              <Link
                to="/village-manager/profile/edit"
                style={styles.dropdownItem}
              >
                Edit Profile
              </Link>
              <Link
                to="/village-manager/profile/password"
                style={styles.dropdownItem}
              >
                Change Password
              </Link>
              <Link to="/village-manager/residents" style={styles.dropdownItem}>
                Manage Users
              </Link>
            </div>
          )}
        </div>
      )
    }

    return null
  }

  return (
    <nav style={styles.navbar}>
      <div style={styles.container}>
        <Link to="/" style={styles.logo}>
          SAMCT Villages
        </Link>

        <div style={styles.links}>
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={
                link.path === '/resident' ||
                link.path === '/admin' ||
                link.path === '/village-manager'
              }
              style={({ isActive }) => ({
                ...styles.link,
                color: isActive ? '#2563eb' : '#374151',
                borderBottom: isActive
                  ? '2px solid #2563eb'
                  : '2px solid transparent',
                paddingBottom: '4px',
              })}
            >
              {link.label}
            </NavLink>
          ))}

          {userType !== 'public' && renderProfileMenu()}

          {userType !== 'public' && (
            <button
              className="btn btn-outline-danger border-danger text-danger"
              onClick={handleLogout}
              style={styles.logoutButton}
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}

const styles: Record<string, React.CSSProperties> = {
  navbar: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e5e7eb',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '1rem 1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  logo: {
    textDecoration: 'none',
    fontSize: '1.25rem',
    fontWeight: 700,
    color: '#1f2937',
  },
  links: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  link: {
    textDecoration: 'none',
    color: '#374151',
    fontWeight: 500,
    fontSize: '0.95rem',
  },
  logoutButton: {
    border: '1px solid #d1d5db',
    backgroundColor: 'white',
    padding: '0.4rem 0.8rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 500,
    color: '#374151',
  },
  dropdownWrapper: {
    position: 'relative',
  },
  dropdownButton: {
    border: 'none',
    background: 'none',
    color: '#374151',
    fontWeight: 500,
    fontSize: '0.95rem',
    cursor: 'pointer',
    padding: 0,
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    right: 0,
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    minWidth: '190px',
    boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
    padding: '0.5rem 0',
    zIndex: 1100,
  },
  dropdownItem: {
    display: 'block',
    padding: '0.6rem 1rem',
    textDecoration: 'none',
    color: '#374151',
    fontWeight: 500,
    whiteSpace: 'nowrap',
  },
}
