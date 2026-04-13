import React from "react";
import { Link } from "react-router-dom";

export default function HomePublic() {
  return (
    <div>
      <section style={styles.hero}>
        <div style={styles.overlay}>
          <div style={styles.heroContent}>
            <p style={styles.tag}>South Auckland Masonic Charitable Trust</p>
            <h1 style={styles.title}>SAMCT Villages</h1>
            <p style={styles.subtitle}>
              A place to find village information, current availability, and log maintenance requests.
            </p>

            <div style={styles.actions}>
              <Link
                to="/availability"
                style={{ ...styles.button, ...styles.primaryButton }}
              >
                View Availability
              </Link>

              <Link
                to="/maintenance"
                style={{ ...styles.button, ...styles.secondaryButton }}
              >
                Log Maintenance Issue
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section style={styles.section}>
        <div style={styles.container}>
          <h2>Welcome</h2>
          <p>
            This platform provides information for residents and the wider public
            about SAMCT villages, services, and availability.
          </p>
        </div>
      </section>

      <section style={styles.sectionAlt}>
        <div style={styles.container}>
          <div style={styles.cardGrid}>
            <div style={styles.card}>
              <h3>Villages</h3>
              <p>Learn more about the villages and their key details.</p>
              <Link to="/villages" style={styles.textLink}>
                Explore villages
              </Link>
            </div>

            <div style={styles.card}>
              <h3>Availability</h3>
              <p>See current availability and public marketing information.</p>
              <Link to="/availability" style={styles.textLink}>
                Check availability
              </Link>
            </div>

            <div style={styles.card}>
              <h3>Maintenance</h3>
              <p>Residents can quickly submit maintenance issues online.</p>
              <Link to="/maintenance" style={styles.textLink}>
                Submit request
              </Link>
            </div>

            <div style={styles.card}>
              <h3>Contact</h3>
              <p>Get in touch for general enquiries and support.</p>
              <Link to="/contact" style={styles.textLink}>
                Contact us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  hero: {
    minHeight: "70vh",
    background: "linear-gradient(rgba(17,24,39,0.7), rgba(17,24,39,0.7))",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem",
    color: "#fff",
  },
  overlay: {
    width: "100%",
  },
  heroContent: {
    maxWidth: "900px",
    margin: "0 auto",
    textAlign: "center",
  },
  tag: {
    textTransform: "uppercase",
    letterSpacing: "1px",
    marginBottom: "0.75rem",
    fontSize: "0.95rem",
  },
  title: {
    fontSize: "3rem",
    marginBottom: "1rem",
  },
  subtitle: {
    fontSize: "1.1rem",
    lineHeight: "1.7",
    maxWidth: "700px",
    margin: "0 auto 1.5rem auto",
  },
  actions: {
    display: "flex",
    justifyContent: "center",
    gap: "1rem",
    flexWrap: "wrap",
  },
  button: {
    padding: "0.85rem 1.25rem",
    borderRadius: "10px",
    textDecoration: "none",
    fontWeight: 600,
  },
  primaryButton: {
    backgroundColor: "#b68a35",
    color: "#fff",
  },
  secondaryButton: {
    border: "1px solid #fff",
    color: "#fff",
  },
  section: {
    padding: "4rem 1.5rem",
  },
  sectionAlt: {
    padding: "4rem 1.5rem",
    backgroundColor: "#f9fafb",
  },
  container: {
    maxWidth: "1100px",
    margin: "0 auto",
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "1.5rem",
  },
  card: {
    backgroundColor: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "16px",
    padding: "1.5rem",
    boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
  },
  textLink: {
    color: "#b68a35",
    textDecoration: "none",
    fontWeight: 600,
  },
};