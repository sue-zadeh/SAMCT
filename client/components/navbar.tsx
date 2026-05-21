import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

type UserType = "public" | "resident" | "admin" | "villageManager";

type NavbarProps = {
  userType: UserType;
};

export default function Navbar({ userType }: NavbarProps) {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("firstname");
    localStorage.removeItem("lastname");
    localStorage.removeItem("fullname");
    localStorage.removeItem("role");
    localStorage.removeItem("profileImageUrl");
    localStorage.removeItem("email");
    localStorage.removeItem("username");
    localStorage.removeItem("village");
    navigate("/");
  };

  const publicLinks = [
    { label: "Home", path: "/" },
    { label: "About", path: "/about" },
    { label: "Availability", path: "/availability" },
    { label: "Contact", path: "/contact" },
    { label: "Login", path: "/login" },
    { label: "Register", path: "/register" },
  ];

  const residentLinks = [
    { label: "Dashboard", path: "/resident" },
    { label: "Maintenance", path: "/resident/maintenance" },
    { label: "My Requests", path: "/resident/requests" },
    { label: "Documents & Notices", path: "/resident/documents" },
  ];

  const adminLinks = [
    { label: "Dashboard", path: "/admin" },
    { label: "Residents", path: "/admin/people" },
    { label: "Village Data", path: "/admin/properties" },
    { label: "Maintenance", path: "/admin/maintenance" },
    { label: "Documents & Notices", path: "/admin/documents" },
    { label: "Orders", path: "/admin/orders" },
    { label: "Accounts", path: "/admin/accounts" },
    { label: "Website Content", path: "/admin/content" },
  ];
const villageManagerLinks = [
  { label: "Dashboard", path: "/village-manager" },
  { label: "My Village", path: "/village-manager/village" },
  { label: "Maintenance", path: "/village-manager/maintenance" },
  { label: "Residents", path: "/village-manager/residents" },
  { label: "Documents", path: "/village-manager/documents" },
  { label: "Profile", path: "/village-manager/profile" },
];

  let links = publicLinks;

  if (userType === "resident") {
    links = residentLinks;
  }

  if (userType === "admin") {
    links = adminLinks;
  }

  if (userType === "villageManager") {
  links = villageManagerLinks;
}

  return (
    <nav style={styles.navbar}>
      <div style={styles.container}>
        <Link to="/" style={styles.logo}>
          SAMCT Villages
        </Link>

        <div style={styles.links}>
          {links.map((link) => (
            <Link key={link.path} to={link.path} style={styles.link}>
              {link.label}
            </Link>
          ))}

          {userType === "resident" && (
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
                </div>
              )}
            </div>
          )}

          {userType === "admin" && (
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
                  <Link to="/admin/people" style={styles.dropdownItem}>
                    Manage Users
                  </Link>
                </div>
              )}
            </div>
          )}

          {userType !== "public" && (
            <button onClick={handleLogout} style={styles.logoutButton}>
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

const styles: Record<string, React.CSSProperties> = {
  navbar: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
    position: "sticky",
    top: 0,
    zIndex: 1000,
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "1rem 1.5rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "1rem",
    flexWrap: "wrap",
  },
  logo: {
    textDecoration: "none",
    fontSize: "1.25rem",
    fontWeight: 700,
    color: "#1f2937",
  },
  links: {
    display: "flex",
    gap: "1rem",
    flexWrap: "wrap",
    alignItems: "center",
  },
  link: {
    textDecoration: "none",
    color: "#374151",
    fontWeight: 500,
    fontSize: "0.95rem",
  },
  logoutButton: {
    border: "1px solid #d1d5db",
    backgroundColor: "white",
    padding: "0.4rem 0.8rem",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: 500,
    color: "#374151",
  },
  dropdownWrapper: {
    position: "relative",
  },
  dropdownButton: {
    border: "none",
    background: "none",
    color: "#374151",
    fontWeight: 500,
    fontSize: "0.95rem",
    cursor: "pointer",
    padding: 0,
  },
  dropdownMenu: {
    position: "absolute",
    top: "100%",
    right: 0,
    backgroundColor: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    minWidth: "170px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
    padding: "0.5rem 0",
    zIndex: 1100,
  },
  dropdownItem: {
    display: "block",
    padding: "0.6rem 1rem",
    textDecoration: "none",
    color: "#374151",
    fontWeight: 500,
    whiteSpace: "nowrap",
  },
};