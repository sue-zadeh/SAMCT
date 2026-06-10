import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import logoImage from '../assets/icon5.png'

type UserType = 'public' | 'resident' | 'admin' | 'villageManager'

type NavbarProps = {
  userType: UserType
}

export default function Navbar({ userType }: NavbarProps) {
  const navigate = useNavigate()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    localStorage.clear()
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
  if (userType === 'resident') links = residentLinks
  if (userType === 'admin') links = adminLinks
  if (userType === 'villageManager') links = villageManagerLinks

  const renderProfileMenu = () => {
    const basePath =
      userType === 'admin'
        ? '/admin'
        : userType === 'resident'
        ? '/resident'
        : '/village-manager'

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
            <Link to={`${basePath}/profile`} style={styles.dropdownItem}>
              My Profile
            </Link>
            <Link to={`${basePath}/profile/edit`} style={styles.dropdownItem}>
              Edit Profile
            </Link>
            <Link
              to={`${basePath}/profile/password`}
              style={styles.dropdownItem}
            >
              Change Password
            </Link>

            {userType === 'admin' && (
              <Link to="/admin/people" style={styles.dropdownItem}>
                Manage Users
              </Link>
            )}

            {userType === 'villageManager' && (
              <Link to="/village-manager/residents" style={styles.dropdownItem}>
                Manage Users
              </Link>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <nav style={styles.navbar}>
      <div style={styles.container}>
        <Link to="/" style={styles.logo}>
          <img
            src={logoImage}
            alt="SAMCT Villages logo"
            style={styles.logoImage}
          />
          <span>SAMCT Villages</span>
        </Link>

        <button
          type="button"
          style={styles.hamburger}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          ☰
        </button>

        <div
          style={{
            ...styles.links,
            ...(menuOpen ? styles.linksOpen : {}),
          }}
        >
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => setMenuOpen(false)}
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
    padding: '0.8rem 1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    position: 'relative',
  },

  logo: {
    textDecoration: 'none',
    fontSize: '1.4rem',
    fontWeight: 700,
    color: '#1f2937',
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
  },

  logoImage: {
    width: '58px',
    height: '58px',
    objectFit: 'contain',
  },

  hamburger: {
    display: 'block',
    border: '1px solid #d1d5db',
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '0.4rem 0.7rem',
    fontSize: '1.5rem',
    cursor: 'pointer',
  },

  links: {
    display: 'none',
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderBottom: '1px solid #e5e7eb',
    padding: '1rem',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '1rem',
  },

  linksOpen: {
    display: 'flex',
  },

  link: {
    textDecoration: 'none',
    color: '#374151',
    fontWeight: 500,
    fontSize: '1rem',
    paddingBottom: '4px',
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
    fontSize: '1rem',
    cursor: 'pointer',
    padding: 0,
  },

  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
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