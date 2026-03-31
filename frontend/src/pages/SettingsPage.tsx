import type { CSSProperties, JSX } from "react";
import SidebarLayout from "../components/SidebarLayout";
import { useTheme } from "./ThemeContext";

export default function SettingsPage(): JSX.Element {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const styles: Record<string, CSSProperties> = {
    page: {
      minHeight: "100vh",
      background: isDark ? "#0b0f17" : "#f8fafc",
      color: isDark ? "white" : "#111827",
      padding: "40px 24px",
      fontFamily: "Arial, sans-serif",
    },

    container: {
      maxWidth: "1100px",
      margin: "0 auto",
    },

    header: {
      marginBottom: 32,
    },

    title: {
      fontSize: "2.2rem",
      fontWeight: 700,
      margin: 0,
      color: isDark ? "white" : "#111827",
    },

    subtitle: {
      fontSize: "1rem",
      color: isDark ? "#d1d5db" : "#4b5563",
      marginTop: 10,
      lineHeight: 1.6,
      maxWidth: "750px",
    },

    topActions: {
      display: "flex",
      gap: 12,
      flexWrap: "wrap",
      marginTop: 20,
    },

    primaryButton: {
      backgroundColor: "#7c3aed",
      color: "white",
      border: "none",
      borderRadius: 12,
      padding: "12px 18px",
      fontSize: "0.95rem",
      fontWeight: 600,
      cursor: "pointer",
    },

    secondaryButton: {
      backgroundColor: "transparent",
      color: isDark ? "white" : "#111827",
      border: isDark
        ? "1px solid rgba(255,255,255,0.18)"
        : "1px solid rgba(17,24,39,0.14)",
      borderRadius: 12,
      padding: "12px 18px",
      fontSize: "0.95rem",
      fontWeight: 600,
      cursor: "pointer",
    },

    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
      gap: 20,
      marginTop: 28,
    },

    card: {
      background: isDark ? "rgba(255,255,255,0.06)" : "rgba(17,24,39,0.06)",
      border: isDark
        ? "1px solid rgba(255,255,255,0.08)"
        : "1px solid rgba(17,24,39,0.08)",
      borderRadius: 20,
      padding: 20,
      boxShadow: "0 10px 30px rgba(0,0,0,0.22)",
      backdropFilter: "blur(8px)",
      WebkitBackdropFilter: "blur(8px)",
    },

    cardTitle: {
      fontSize: "1.2rem",
      fontWeight: 700,
      margin: "0 0 8px 0",
      color: isDark ? "white" : "#111827",
    },

    cardText: {
      color: isDark ? "#d1d5db" : "#4b5563",
      fontSize: "0.95rem",
      lineHeight: 1.5,
      marginBottom: 16,
    },

    image: {
      width: "100%",
      height: 190,
      objectFit: "cover",
      borderRadius: 14,
      marginBottom: 16,
      border: "1px solid rgba(255,255,255,0.08)",
    },

    buttonRow: {
      display: "flex",
      gap: 10,
      flexWrap: "wrap",
    },

    smallButton: {
      backgroundColor: "#7c3aed",
      color: "white",
      border: "none",
      borderRadius: 10,
      padding: "10px 14px",
      fontSize: "0.9rem",
      fontWeight: 600,
      cursor: "pointer",
    },

    outlineButton: {
      backgroundColor: "transparent",
      color: isDark ? "white" : "#111827",
      border: isDark
        ? "1px solid rgba(255,255,255,0.16)"
        : "1px solid rgba(17,24,39,0.14)",
      borderRadius: 10,
      padding: "10px 14px",
      fontSize: "0.9rem",
      fontWeight: 600,
      cursor: "pointer",
    },

    quickSettings: {
      marginTop: 24,
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      gap: 16,
    },

    quickCard: {
      background: isDark ? "rgba(161, 3, 252, 0.12)" : "rgba(161, 3, 252, 0.08)",
      border: isDark
        ? "1px solid rgba(161, 3, 252,0.28)"
        : "1px solid rgba(161, 3, 252,0.18)",
      borderRadius: 16,
      padding: 18,
    },

    quickTitle: {
      margin: "0 0 8px 0",
      fontSize: "1rem",
      fontWeight: 700,
      color: isDark ? "white" : "#111827",
    },

    quickText: {
      margin: "0 0 14px 0",
      color: isDark ? "#f3f4f6" : "#4b5563",
      fontSize: "0.92rem",
      lineHeight: 1.4,
    },
  };

  return (
    <SidebarLayout>
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.header}>
            <h1 style={styles.title}>Settings</h1>
            <p style={styles.subtitle}>
              Manage your personal preferences, account details, notifications,
              permissions, and workspace experience all in one place.
            </p>

            <div style={styles.topActions}>
              <button style={styles.primaryButton}>Save Changes</button>
              <button style={styles.secondaryButton}>Reset to Default</button>
            </div>
          </div>

          <div style={styles.quickSettings}>
            <div style={styles.quickCard}>
              <h3 style={styles.quickTitle}>Appearance</h3>
              <p style={styles.quickText}>
                Toggle between light and dark mode for a more personalized
                experience.
              </p>
              <button style={styles.smallButton} onClick={toggleTheme}>
                {theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              </button>
            </div>

            <div style={styles.quickCard}>
              <h3 style={styles.quickTitle}>Dashboard Layout</h3>
              <p style={styles.quickText}>
                Customize the widgets and layout that appear on your dashboard.
              </p>
              <button style={styles.smallButton}>Customize Layout</button>
            </div>

            <div style={styles.quickCard}>
              <h3 style={styles.quickTitle}>Integrations</h3>
              <p style={styles.quickText}>
                Connect external tools and manage app integrations for your team.
              </p>
              <button style={styles.smallButton}>Manage Integrations</button>
            </div>

            <div style={styles.quickCard}>
              <h3 style={styles.quickTitle}>Permissions</h3>
              <p style={styles.quickText}>
                Review team roles, access control settings, and workspace security.
              </p>
              <button style={styles.smallButton}>View Access Controls</button>
            </div>
          </div>

          <div style={styles.grid}>
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>User Profile</h2>
              <p style={styles.cardText}>
                Update your name, photo, bio, and other personal account details.
              </p>
              <div style={styles.buttonRow}>
                <button style={styles.smallButton}>Edit Profile</button>
                <button style={styles.outlineButton}>Upload Photo</button>
              </div>
            </div>

            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Notification Preferences</h2>
              <p style={styles.cardText}>
                Control how you receive updates through email, in-app alerts, and
                reminders.
              </p>
              <div style={styles.buttonRow}>
                <button style={styles.smallButton}>Edit Notifications</button>
                <button style={styles.outlineButton}>Mute All</button>
              </div>
            </div>

            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Account Settings</h2>
              <p style={styles.cardText}>
                Manage your password, role, connected accounts, and account
                security preferences.
              </p>
              <div style={styles.buttonRow}>
                <button style={styles.smallButton}>Manage Account</button>
                <button style={styles.outlineButton}>Change Password</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}