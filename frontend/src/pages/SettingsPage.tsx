import { useEffect, useState, type CSSProperties, type JSX } from "react";

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #111827 0%, #1f2937 100%)",
    color: "white",
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
  },

  subtitle: {
    fontSize: "1rem",
    color: "#d1d5db",
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
    color: "white",
    border: "1px solid rgba(255,255,255,0.18)",
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
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 20,
    padding: 20,
    boxShadow: "0 10px 30px rgba(0,0,0,0.22)",
    backdropFilter: "blur(8px)",
  },

  cardTitle: {
    fontSize: "1.2rem",
    fontWeight: 700,
    margin: "0 0 8px 0",
  },

  cardText: {
    color: "#d1d5db",
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
    color: "white",
    border: "1px solid rgba(255,255,255,0.16)",
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
    background: "rgba(161, 3, 252, 0.12)",
    border: "1px solid rgba(161, 3, 252,0.28)",
    borderRadius: 16,
    padding: 18,
  },

  quickTitle: {
    margin: "0 0 8px 0",
    fontSize: "1rem",
    fontWeight: 700,
  },

  quickText: {
    margin: "0 0 14px 0",
    color: "#f3f4f6",
    fontSize: "0.92rem",
    lineHeight: 1.4,
  },

  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    marginBottom: 14,
  },

  label: {
    fontSize: "0.9rem",
    fontWeight: 600,
    color: "#f3f4f6",
  },

  input: {
    background: "rgba(255,255,255,0.08)",
    color: "white",
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: 10,
    padding: "12px 14px",
    fontSize: "0.95rem",
    outline: "none",
  },

  disabledInput: {
    background: "rgba(255,255,255,0.04)",
    color: "#d1d5db",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10,
    padding: "12px 14px",
    fontSize: "0.95rem",
  },

  successText: {
    color: "#86efac",
    fontSize: "0.9rem",
    marginTop: 10,
  },

  errorText: {
    color: "#fca5a5",
    fontSize: "0.9rem",
    marginTop: 10,
  },
};

export default function SettingsPage(): JSX.Element {
    const handleNameChange = async () => {
    setNameMessage("");
    setNameError("");

if (!account.nameCurrentPassword) {
    setNameError("Please enter your current password.");
    return;
  }

  if (!account.newName.trim()) {
    setNameError("Please enter a new name.");
    return;
  }

  try {
    const token = localStorage.getItem("token");

    const res = await fetch("http://127.0.0.1:8000/auth/change-name", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        current_password: account.nameCurrentPassword,
        new_name: account.newName,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
    setNameError(data.detail || "Failed to change name.");
      return;
    }

    setNameMessage(data.message || "Name updated successfully.");

    setAccount((prev) => ({
      ...prev,
      name: account.newName,
      newName: "",
      nameCurrentPassword: "",
    }));
  } catch (err) {
    setNameError("Error changing name.");
  }
};
    const [account, setAccount] = useState({
      name: "",
      email: "",
      role: "",
      newName: "",
      nameCurrentPassword: "",
      passwordCurrentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    const [nameMessage, setNameMessage] = useState("");
    const [nameError, setNameError] = useState("");

    const [passwordMessage, setPasswordMessage] = useState("");
    const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const token =
          localStorage.getItem("token") ||
          localStorage.getItem("access_token");

        const res = await fetch("http://127.0.0.1:8000/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          setError("Failed to load account info.");
          return;
        }

        const data = await res.json();

        setAccount((prev) => ({
          ...prev,
          name: data.name ?? "",
          email: data.email ?? "",
          role: data.role ?? "",
        }));
      } catch (err) {
        setError("Error loading account info.");
      }
    };

    fetchAccount();
  }, []);

  const handlePasswordChange = async () => {
    setPasswordMessage("");
    setPasswordError("");

    if (
      !account.passwordCurrentPassword ||
      !account.newPassword ||
      !account.confirmPassword
    ) {
    setPasswordError("Please fill in all password fields.");
      return;
    }

    if (account.newPassword !== account.confirmPassword) {
    setPasswordError("New passwords do not match.");
      return;
    }

    try {
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("access_token");

      const res = await fetch("http://127.0.0.1:8000/auth/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: account.passwordCurrentPassword,
          new_password: account.newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPasswordError(data.detail || "Failed to change password.");
        return;
      }

    setPasswordMessage(data.message || "Password updated successfully.");

        setAccount((prev) => ({
          ...prev,
          passwordCurrentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
    } catch (err) {
        setPasswordError("Error changing password.");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Settings</h1>
          <p style={styles.subtitle}>
            Manage your personal preferences, account details, notifications,
            permissions, and workspace experience all in one place.
          </p>
          <div style={styles.topActions}>
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
            <button style={styles.smallButton}>Switch Theme</button>
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
              Review team roles, access control settings, and workspace
              security.
            </p>
            <button style={styles.smallButton}>View Access Controls</button>
          </div>
        </div>

        <div style={styles.grid}>
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>User Profile</h2>
          <p style={styles.cardText}>
            Update your name and other personal account details.
          </p>

          <div style={styles.formGroup}>
            <label style={styles.label}>Current Name</label>
            <input
              style={styles.disabledInput}
              type="text"
              value={account.name}
              disabled
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Current Password</label>
            <input
              style={styles.input}
              type="password"
                value={account.nameCurrentPassword}
                onChange={(e) =>
                  setAccount({
                    ...account,
                    nameCurrentPassword: e.target.value,
                  })
                }
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>New Name</label>
            <input
              style={styles.input}
              type="text"
              value={account.newName}
              onChange={(e) =>
                setAccount({
                  ...account,
                  newName: e.target.value,
                })
              }
            />
          </div>

          <div style={styles.buttonRow}>
            <button style={styles.smallButton} onClick={handleNameChange}>
              Change Name
            </button>
            {nameMessage && <p style={styles.successText}>{nameMessage}</p>}
            {nameError && <p style={styles.errorText}>{nameError}</p>}
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
              View your account information and update your password.
            </p>

            <div style={styles.formGroup}>
              <label style={styles.label}>Name</label>
              <input
                style={styles.disabledInput}
                type="text"
                value={account.name}
                disabled
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Email</label>
              <input
                style={styles.disabledInput}
                type="email"
                value={account.email}
                disabled
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Role</label>
              <input
                style={styles.disabledInput}
                type="text"
                value={account.role}
                disabled
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Current Password</label>
              <input
                style={styles.input}
                type="password"
                value={account.passwordCurrentPassword}
                onChange={(e) =>
                  setAccount({
                    ...account,
                    passwordCurrentPassword: e.target.value,
                  })
                }
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>New Password</label>
              <input
                style={styles.input}
                type="password"
                value={account.newPassword}
                onChange={(e) =>
                  setAccount({
                    ...account,
                    newPassword: e.target.value,
                  })
                }
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Confirm New Password</label>
              <input
                style={styles.input}
                type="password"
                value={account.confirmPassword}
                onChange={(e) =>
                  setAccount({
                    ...account,
                    confirmPassword: e.target.value,
                  })
                }
              />
            </div>

            <div style={styles.buttonRow}>
              <button
                style={styles.smallButton}
                onClick={handlePasswordChange}
              >
                Change Password
              </button>
            </div>

            {passwordMessage && <p style={styles.successText}>{passwordMessage}</p>}
            {passwordError && <p style={styles.errorText}>{passwordError}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}