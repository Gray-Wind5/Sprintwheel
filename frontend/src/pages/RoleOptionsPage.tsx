import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import type { CSSProperties, JSX } from "react";
import { useState } from "react";
import { updateRole, type ProjectRole } from "../api/projects";
import { useTheme } from "../pages/ThemeContext";

const styles: Record<string, CSSProperties> = {
  error: {
    marginTop: 14,
    fontSize: 12,
    opacity: 0.95,
  },
  shell: {
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "min(760px, 96vw)",
    borderRadius: 24,
    padding: 28,
    boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
    position: "relative",
  },
  header: { marginBottom: 18 },
  title: { margin: 0, fontSize: 34, fontWeight: 800, letterSpacing: -0.3 },
  subtitle: {
    margin: "10px 0 0 0",
    fontSize: 15,
    lineHeight: 1.5,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 16,
    marginTop: 22,
  },
  pill: {
    width: "100%",
    borderRadius: 999,
    padding: "18px 18px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    textAlign: "left",
  },
  pillDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
  left: { display: "flex", alignItems: "center", gap: 14 },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 999,
    display: "grid",
    placeItems: "center",
    fontSize: 22,
    flexShrink: 0,
  },
  roleTextWrap: { display: "flex", flexDirection: "column" },
  roleTitle: { margin: 0, fontSize: 18, fontWeight: 800 },
  roleDesc: { margin: "4px 0 0 0", fontSize: 13 },
  arrow: { fontSize: 18, fontWeight: 700 },
  footer: {
    marginTop: 18,
    fontSize: 12,
    lineHeight: 1.5,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    borderRadius: 999,
    padding: "12px 16px",
    cursor: "pointer",
    fontWeight: 800,
    fontSize: 16,
    display: "grid",
    placeItems: "center",
    whiteSpace: "nowrap",
  },
};

type RoleButtonProps = {
  icon: string;
  title: string;
  description: string;
  onClick: () => void;
  disabled?: boolean;
  isDark: boolean;
};

function RolePill({
  icon,
  title,
  description,
  onClick,
  disabled = false,
  isDark,
}: RoleButtonProps): JSX.Element {
  return (
    <motion.button
      type="button"
      style={{
        ...styles.pill,
        ...(disabled ? styles.pillDisabled : {}),
        background: isDark ? "rgba(255,255,255,0.08)" : "#f3f4f6",
        border: isDark
          ? "1px solid rgba(255,255,255,0.14)"
          : "1px solid rgba(0,0,0,0.08)",
        color: isDark ? "white" : "#111827",
      }}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? undefined : { y: -2 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
    >
      <span style={styles.left}>
        <span
          style={{
            ...styles.icon,
            background: isDark
              ? "rgba(255,255,255,0.10)"
              : "#e5e7eb",
            border: isDark
              ? "1px solid rgba(255,255,255,0.14)"
              : "1px solid rgba(0,0,0,0.08)",
          }}
        >
          {icon}
        </span>
        <span style={styles.roleTextWrap}>
          <span style={styles.roleTitle}>{title}</span>
          <span
            style={{
              ...styles.roleDesc,
              color: isDark ? "rgba(255,255,255,0.75)" : "#6b7280",
            }}
          >
            {description}
          </span>
        </span>
      </span>
      <span style={{ ...styles.arrow, opacity: 0.8 }}>→</span>
    </motion.button>
  );
}

function roleToUrlKey(role: ProjectRole): string {
  switch (role) {
    case "Product Owner":
      return "product-owner";
    case "Scrum Facilitator":
      return "scrum-facilitator";
    case "Developer":
    default:
      return "developer";
  }
}

function roleToLanding(role: ProjectRole): string {
  switch (role) {
    case "Product Owner":
      return "product-owner-dashboard";
    case "Scrum Facilitator":
      return "scrum-facilitator-dashboard";
    case "Developer":
    default:
      return "developer-dashboard";
  }
}

export default function RoleOptionsPage(): JSX.Element {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [error, setError] = useState<string>("");
  const [busy, setBusy] = useState<boolean>(false);

  async function setRoleAndGo(roleLabel: ProjectRole): Promise<void> {
    if (!projectId || busy) return;

    setError("");
    setBusy(true);

    try {
      const res = await updateRole(projectId, { role: roleLabel });

      if (res.status !== "ok") {
        throw new Error("Could not update role");
      }

      const roleKey = roleToUrlKey(roleLabel);
      const landing = roleToLanding(roleLabel);

      navigate(`/projects/${projectId}/${roleKey}/${landing}`, {
        replace: true,
      });
    } catch (err: any) {
      setError(
        err?.message ||
          "Could not update your role. Please try again (and confirm you are logged in)."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      style={{
        ...styles.shell,
        background: isDark ? "#0b0f17" : "#f8fafc",
        color: isDark ? "white" : "#111827",
      }}
    >
      <div
        style={{
          ...styles.card,
          background: isDark ? "rgba(255,255,255,0.04)" : "#ffffff",
          border: isDark
            ? "1px solid rgba(255,255,255,0.10)"
            : "1px solid rgba(0,0,0,0.08)",
        }}
      >
        <motion.button
          type="button"
          style={{
            ...styles.closeButton,
            background: isDark
              ? "rgba(255,255,255,0.12)"
              : "#f3f4f6",
            border: isDark
              ? "1px solid rgba(255,255,255,0.18)"
              : "1px solid rgba(0,0,0,0.08)",
            color: isDark ? "white" : "#111827",
          }}
          onClick={() => navigate(-1)}
          aria-label="Close"
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          ×
        </motion.button>

        <div style={styles.header}>
          <h1 style={styles.title}>Choose your role</h1>
          <p
            style={{
              ...styles.subtitle,
              color: isDark ? "rgba(255,255,255,0.82)" : "#6b7280",
            }}
          >
            This sets the layout and tools you&apos;ll see. You can change it later in Settings.
          </p>
        </div>

        <div style={styles.grid}>
          <RolePill
            icon="💼"
            title="Product Owner"
            description="Prioritize the backlog, manage scope, and align stakeholders."
            disabled={busy}
            isDark={isDark}
            onClick={() => void setRoleAndGo("Product Owner")}
          />

          <RolePill
            icon="🧭"
            title="Scrum Facilitator"
            description="Run standups, track blockers, and keep the sprint moving."
            disabled={busy}
            isDark={isDark}
            onClick={() => void setRoleAndGo("Scrum Facilitator")}
          />

          <RolePill
            icon="💻"
            title="Developer"
            description="Jump into tasks, progress, and sprint insights."
            disabled={busy}
            isDark={isDark}
            onClick={() => void setRoleAndGo("Developer")}
          />
        </div>

        {error && (
          <div
            style={{
              ...styles.error,
              color: isDark ? "#ffb4b4" : "#b91c1c",
            }}
          >
            {error}
          </div>
        )}

        <div
          style={{
            ...styles.footer,
            color: isDark ? "rgba(255,255,255,0.65)" : "#6b7280",
          }}
        >
          Select the role-specific workspace you want to enter for this project.
        </div>
      </div>
    </div>
  );
}