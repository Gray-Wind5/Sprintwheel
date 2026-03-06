import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { CSSProperties, JSX } from "react";
import { me } from "../../api/auth";
import { listProjects, type Project } from "../../api/projects";
import SidebarLayout from "../../components/SidebarLayout";

type User = { id: string; name: string; email: string; role: string };

const styles: Record<string, CSSProperties> = {
  main: {
    width: "100%",
    minHeight: "100vh",
    padding: 24,
    overflow: "auto",
    background: "#0b0f17",
    color: "white",
  },

  taskBoard: { width: "100%", marginTop: 16 },
  taskBoardTitle: {
    margin: "0 0 12px 0",
    textAlign: "center",
  },
  taskBoardImage: {
    width: "100%",
    height: "auto",
    display: "block",
    borderRadius: 12,
    objectFit: "cover",
  },

  education: { width: "100%", marginTop: 32 },
  educationTitle: {
    margin: "0 0 12px 0",
    textAlign: "center",
  },
  educationImage: {
    width: "100%",
    height: "auto",
    display: "block",
    borderRadius: 12,
    objectFit: "cover",
  },

  dualSection: {
    width: "100%",
    marginTop: 40,
  },
  dualGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 24,
  },
  dualCard: {
    background: "rgba(255,255,255,0.04)",
    borderRadius: 16,
    padding: 16,
  },
  dualTitle: {
    margin: "0 0 12px 0",
    textAlign: "center",
    fontSize: 16,
    fontWeight: 600,
  },
  dualImage: {
    width: "100%",
    height: "auto",
    borderRadius: 12,
    display: "block",
  },
};

export default function DashboardPage(): JSX.Element {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });

  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [projectError, setProjectError] = useState<string>("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    me(token)
      .then((u: User) => {
        setUser(u);
        localStorage.setItem("user", JSON.stringify(u));
      })
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login", { replace: true });
      });
  }, [navigate]);

  useEffect(() => {
    if (!user) return;

    setLoadingProjects(true);
    setProjectError("");

    listProjects()
      .then((data) => {
        setProjects(data);

        if (data.length > 0) {
          setActiveProjectId(data[0].id);
        }
      })
      .catch((e: any) => {
        setProjectError(e.message);
      })
      .finally(() => {
        setLoadingProjects(false);
      });
  }, [user]);

  return (
    <SidebarLayout>
      <main className="app-background" style={styles.main}>
        <div className="hero">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            Hi {user?.name ?? "there"}, welcome to the Dashboard!
          </motion.h1>

          <div style={{ marginTop: 20 }}>
            <h3>Your Projects</h3>

            {loadingProjects && <p>Loading projects...</p>}
            {projectError && <p style={{ color: "red" }}>{projectError}</p>}

            {projects.length === 0 && !loadingProjects && <p>No projects yet.</p>}

            {projects.length > 0 && (
              <select
                value={activeProjectId ?? ""}
                onChange={(e) => setActiveProjectId(e.target.value)}
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <section style={styles.taskBoard}>
            <h2 style={styles.taskBoardTitle}>Task Board</h2>
            <img
              src="/task-board-placeholder.png"
              alt="task board coming soon"
              style={styles.taskBoardImage}
            />
          </section>

          <section style={styles.education}>
            <h2 style={styles.educationTitle}>Education</h2>
            <img
              src="/education-module-placeholder.png"
              alt="education coming soon"
              style={styles.educationImage}
            />
          </section>

          <section style={styles.dualSection}>
            <div style={styles.dualGrid}>
              <div style={styles.dualCard}>
                <h3 style={styles.dualTitle}>Sprint Overview</h3>
                <img
                  src="/sprint-overview-placeholder.png"
                  alt="sprint overview coming soon"
                  style={styles.dualImage}
                />
              </div>

              <div style={styles.dualCard}>
                <h3 style={styles.dualTitle}>Progress Insights</h3>
                <img
                  src="/progress-insights-placeholder.png"
                  alt="progress insights coming soon"
                  style={styles.dualImage}
                />
              </div>
            </div>
          </section>
        </div>
      </main>
    </SidebarLayout>
  );
}