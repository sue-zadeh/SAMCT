import { Link, useNavigate } from "react-router-dom";

type UserType = "public" | "resident" | "admin";

type NavbarProps = {
  userType: UserType;
};

export default function Navbar({ userType }: NavbarProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("firstname");
    localStorage.removeItem("lastname");
    localStorage.removeItem("fullname");
    localStorage.removeItem("role");
    localStorage.removeItem("profileImageUrl");
    navigate("/");
  };

  const publicLinks = [
    { label: "Home", path: "/" },
    { label: "About", path: "/about" },
    { label: "Availability", path: "/availability" },
    { label: "Marketing", path: "/marketing" },
    { label: "Contact", path: "/contact" },
    { label: "Login", path: "/login" },
    { label: "Register", path: "/register" },
  ];

  const residentLinks = [
    { label: "Dashboard", path: "/resident" },
    { label: "Maintenance", path: "/resident/maintenance" },
    { label: "My Requests", path: "/resident/requests" },
    { label: "Documents", path: "/resident/documents" },
  ];

  const adminLinks = [
    { label: "Dashboard", path: "/admin" },
    { label: "Properties", path: "/admin/properties" },
    { label: "Maintenance", path: "/admin/maintenance" },
    { label: "Documents", path: "/admin/documents" },
    { label: "Orders", path: "/admin/orders" },
    { label: "Accounts", path: "/admin/accounts" },
    { label: "People", path: "/admin/people" },
    { label: "Website Content", path: "/admin/content" },
  ];

  let links = publicLinks;

  if (userType === "resident") {
    links = residentLinks;
  }

  if (userType === "admin") {
    links = adminLinks;
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
};