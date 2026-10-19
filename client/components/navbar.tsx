import { API_BASE_URL, apiFetch } from '../security/api'
import { cacheUser } from '../security/session'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import type { CSSProperties, MouseEvent } from 'react'
import logoImage from '../assets/icon5.png'

type UserType = 'public' | 'resident' | 'admin' | 'villageManager'
type NavEntry = { label: string; path: string }
type NavItem =
  | (NavEntry & { children?: never })
  | { label: string; children: NavEntry[]; path?: never }

type NavbarProps = { userType: UserType }

// Query-string tabs are sections of ONE Village Data page, not separate pages.
const adminVillageData: NavEntry[] = [
  { label: 'Units & Properties', path: '/admin/village-properties?tab=units' },
  {
    label: 'Marketing & Brochure',
    path: '/admin/village-properties?tab=brochure',
  },
  { label: 'Manage FAQs', path: '/admin/village-properties?tab=faq' },
]

const managerVillageData: NavEntry[] = [
  {
    label: 'Units & Properties',
    path: '/village-manager/village-data?tab=units',
  },
  {
    label: 'Marketing & Brochure',
    path: '/village-manager/village-data?tab=brochure',
  },
  { label: 'Manage FAQs', path: '/village-manager/village-data?tab=faq' },
]

const navForRole: Record<UserType, NavItem[]> = {
  public: [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Marketing', path: '/marketing' },
    { label: 'Contact', path: '/contactUs' },
    { label: 'Login', path: '/login' },
  ],
  resident: [
    { label: 'Dashboard', path: '/resident' },
    { label: 'Maintenance', path: '/resident/maintenance' },
    { label: 'Documents & Notices', path: '/resident/documents' },
  ],
  admin: [
    { label: 'Dashboard', path: '/admin' },
    { label: 'Village Data', children: adminVillageData },
    {
      label: 'Operations',
      children: [
        { label: 'Maintenance', path: '/admin/maintenance' },
        { label: 'Documents & Notices', path: '/admin/documents' },
        { label: 'Purchase Orders', path: '/admin/purchase-orders' },
      ],
    },
    {
      label: 'Users',
      children: [
        { label: 'Manage Profiles', path: '/admin/people' },
        { label: 'Register User', path: '/register' },
      ],
    },
  ],
  villageManager: [
    { label: 'Dashboard', path: '/village-manager' },
    { label: 'My Village', path: '/village-manager/my-village' },
    { label: 'Village Data', children: managerVillageData },
    {
      label: 'Operations',
      children: [
        { label: 'Maintenance', path: '/village-manager/maintenance' },
        { label: 'Documents & Notices', path: '/village-manager/documents' },
        { label: 'Purchase Orders', path: '/village-manager/purchase-orders' },
      ],
    },
    {
      label: 'Users',
      children: [
        { label: 'Residents', path: '/village-manager/residents' },
        { label: 'Register Resident', path: '/register' },
      ],
    },
  ],
}

const profileForRole: Record<Exclude<UserType, 'public'>, NavEntry[]> = {
  admin: [
    { label: 'My Profile', path: '/admin/profile' },
    { label: 'Edit Profile', path: '/admin/profile/edit' },
    { label: 'Change Password', path: '/admin/profile/password' },
  ],
  villageManager: [
    { label: 'My Profile', path: '/village-manager/profile' },
    { label: 'Edit Profile', path: '/village-manager/profile/edit' },
    { label: 'Change Password', path: '/village-manager/profile/password' },
  ],
  resident: [
    { label: 'My Profile', path: '/resident/profile' },
    { label: 'Edit Profile', path: '/resident/profile/edit' },
    { label: 'Change Password', path: '/resident/profile/password' },
  ],
}

export default function Navbar({ userType }: NavbarProps) {
  const { pathname, search } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  useEffect(() => {
    const checkScreen = () => {
      const mobile = window.innerWidth <= 1190
      setIsMobile(mobile)
      if (!mobile) setMenuOpen(false)
    }
    checkScreen()
    window.addEventListener('resize', checkScreen)
    return () => window.removeEventListener('resize', checkScreen)
  }, [])

  const handleLogout = async () => {
    try {
      const response = await apiFetch(`${API_BASE_URL}/api/logout`, {
        method: 'POST',
      })
      if (!response.ok && response.status !== 401)
        throw new Error('Logout failed')
      cacheUser(null)
      // Reload to clear private component state and session data.
      window.location.replace('/')
    } catch {
      window.alert('Logout failed. Please try again.')
    }
  }

  // Close an opened dropdown after selecting a link.
  const closeMenu = (_event: MouseEvent<HTMLAnchorElement>) => {
    setOpenDropdown(null)
    setMenuOpen(false)
  }
  const isActiveLink = (path: string) => {
    const [targetPath, targetQuery] = path.split('?')
    return (
      pathname === targetPath && (!targetQuery || search === `?${targetQuery}`)
    )
  }

  const renderItem = (item: NavItem) => {
    if (item.children) {
      const active = item.children.some((child) => isActiveLink(child.path))
      return (
        <details
          key={item.label}
          style={styles.dropdownWrapper}
          open={openDropdown === item.label}
        >
          <summary
            onClick={(event) => {
              event.preventDefault()

              setOpenDropdown((current) =>
                current === item.label ? null : item.label,
              )
            }}
            style={{
              ...styles.dropdownButton,
              color: active ? '#2563eb' : '#374151',
              borderBottom: active
                ? '2px solid #2563eb'
                : '2px solid transparent',
            }}
          >
            {item.label} <span aria-hidden="true">▾</span>
          </summary>
          <div style={styles.dropdownMenu}>
            {item.children.map((child) => (
              <NavLink
                key={child.path}
                to={child.path}
                onClick={closeMenu}
                style={{
                  ...styles.dropdownItem,
                  color: isActiveLink(child.path) ? '#2563eb' : '#374151',
                  fontWeight: isActiveLink(child.path) ? 700 : 500,
                }}
              >
                {child.label}
              </NavLink>
            ))}
          </div>
        </details>
      )
    }
    return (
      <NavLink
        key={item.path}
        to={item.path}
        onClick={closeMenu}
        end={['/', '/admin', '/resident', '/village-manager'].includes(
          item.path,
        )}
        style={({ isActive }) => ({
          ...styles.link,
          color: isActive ? '#2563eb' : '#374151',
          borderBottom: isActive
            ? '2px solid #2563eb'
            : '2px solid transparent',
        })}
      >
        {item.label}
      </NavLink>
    )
  }

  const navItems: NavItem[] = [...navForRole[userType]]
  if (userType !== 'public') {
    navItems.push({ label: 'Profile', children: profileForRole[userType] })
  }

  return (
    <nav style={styles.navbar} aria-label="Main navigation">
      <div style={styles.container}>
        <Link to="/" style={styles.logo}>
          <img
            src={logoImage}
            alt="SAMCT Villages logo"
            style={styles.logoImage}
          />
          <span>SAMCT Villages</span>
        </Link>

        {isMobile && (
          <button
            type="button"
            style={styles.hamburger}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
            aria-controls="nav-items"
            onClick={() => setMenuOpen((value) => !value)}
          >
            ☰
          </button>
        )}

        <div
          id="nav-items"
          style={{
            ...styles.links,
            ...(isMobile ? styles.mobileLinks : {}),
            ...(isMobile && menuOpen ? styles.mobileLinksOpen : {}),
          }}
        >
          {navItems.map(renderItem)}
          {userType !== 'public' && (
            <button
              type="button"
              className="btn btn-outline-danger border-danger text-danger btn-sm shadow-sm"
              onClick={() => void handleLogout()}
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

const styles: Record<string, CSSProperties> = {
  navbar: {
    width: '100%',
    backgroundColor: '#fff',
    borderBottom: '1px solid #e5e7eb',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
  },
  container: {
    maxWidth: '1250px',
    margin: '0 auto',
    padding: '0.8rem 1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1.25rem',
    position: 'relative',
  },
  logo: {
    textDecoration: 'none',
    fontSize: '1.1rem',
    fontWeight: 700,
    color: '#1f2937',
    display: 'flex',
    alignItems: 'center',
    gap: '0.55rem',
    flexShrink: 0,
    maxWidth: '230px',
  },
  logoImage: {
    width: '48px',
    height: '48px',
    objectFit: 'contain',
    flexShrink: 0,
  },
  links: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
    flexWrap: 'nowrap',
    minWidth: 0,
  },
  link: {
    textDecoration: 'none',
    color: '#374151',
    fontWeight: 500,
    fontSize: '0.9rem',
    whiteSpace: 'nowrap',
    padding: '0.35rem 0',
  },
  dropdownWrapper: { position: 'relative' },
  dropdownButton: {
    display: 'block',
    listStyle: 'none',
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: '0.9rem',
    whiteSpace: 'nowrap',
    padding: '0.35rem 0',
    userSelect: 'none',
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    backgroundColor: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    minWidth: '235px',
    boxShadow: '0 10px 24px rgba(0,0,0,0.12)',
    padding: '0.4rem 0',
    zIndex: 1100,
  },
  dropdownItem: {
    display: 'block',
    padding: '0.65rem 0.9rem',
    textDecoration: 'none',
    color: '#374151',
    fontSize: '0.9rem',
    whiteSpace: 'nowrap',
  },
  hamburger: {
    border: '1px solid #d1d5db',
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '0.35rem 0.7rem',
    fontSize: '1.4rem',
    cursor: 'pointer',
    marginLeft: 'auto',
  },
  mobileLinks: {
    display: 'none',
    position: 'absolute',
    top: '100%',
    right: '1rem',
    backgroundColor: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '1rem',
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: '0.5rem',
    minWidth: '245px',
    maxWidth: '90vw',
    boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
    zIndex: 1200,
  },
  mobileLinksOpen: { display: 'flex' },
  logoutButton: {
    whiteSpace: 'nowrap',
    cursor: 'pointer',
  },
}
