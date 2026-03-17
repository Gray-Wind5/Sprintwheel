import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, JSX } from "react";
import { useNavigate } from "react-router-dom";
import { me } from "../../api/auth";
import { listProjects, type Project } from "../../api/projects";
import SidebarLayout from "../../components/SidebarLayout";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

const styles: Record<string, CSSProperties> = {
  main: {
    width: "100%",
    minHeight: "100vh",
    padding: 24,
    background:
      "radial-gradient(circle at top left, rgba(99,102,241,0.14), transparent 28%), linear-gradient(180deg, #0b0f17 0%, #0f172a 45%, #0b0f17 100%)",
    color: "white",
    position: "relative",
    overflow: "hidden",
  },

  shell: {
    position: "relative",
    width: "100%",
    minHeight: "calc(100vh - 48px)",
  },

  content: {
    position: "relative",
    zIndex: 1,
  },

  hero: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 20,
    flexWrap: "wrap",
    marginBottom: 24,
  },

  heroText: {
    flex: "1 1 420px",
  },

  pageTitle: {
    margin: 0,
    fontSize: "clamp(2rem, 4vw, 3rem)",
    lineHeight: 1.05,
    fontWeight: 700,
  },

  pageSubtitle: {
    margin: "10px 0 0 0",
    color: "rgba(255,255,255,0.72)",
    fontSize: 15,
    lineHeight: 1.5,
    maxWidth: 620,
  },

  projectChip: {
    flex: "0 0 260px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 20,
    padding: 16,
    boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
  },

  chipLabel: {
    margin: 0,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    color: "rgba(255,255,255,0.58)",
  },

  chipValue: {
    margin: "6px 0 0 0",
    fontSize: 18,
    fontWeight: 650,
  },

  chipSubtext: {
    margin: "8px 0 0 0",
    fontSize: 13,
    color: "rgba(255,255,255,0.66)",
    lineHeight: 1.4,
  },

  topGrid: {
    display: "grid",
    gridTemplateColumns: "1.15fr 1.15fr 0.8fr",
    gap: 20,
    alignItems: "stretch",
  },

  bottomGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 20,
    marginTop: 20,
  },

  card: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 24,
    padding: 18,
    boxShadow: "0 12px 32px rgba(0,0,0,0.18)",
  },

  cardTitle: {
    margin: 0,
    fontSize: 18,
    fontWeight: 650,
  },

  cardDescription: {
    margin: "8px 0 16px 0",
    fontSize: 14,
    lineHeight: 1.5,
    color: "rgba(255,255,255,0.68)",
  },

  imageWrap: {
    width: "100%",
    overflow: "hidden",
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.06)",
    background: "rgba(255,255,255,0.03)",
  },

  image: {
    display: "block",
    width: "100%",
    height: "auto",
    objectFit: "cover",
  },

  sideColumn: {
    display: "grid",
    gap: 14,
  },

  statCard: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 18,
    padding: 16,
  },

  statLabel: {
    margin: 0,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "rgba(255,255,255,0.56)",
  },

  statValue: {
    margin: "8px 0 0 0",
    fontSize: 22,
    fontWeight: 700,
    lineHeight: 1.1,
  },

  statText: {
    margin: "6px 0 0 0",
    fontSize: 13,
    lineHeight: 1.4,
    color: "rgba(255,255,255,0.66)",
  },

  emptyState: {
    marginTop: 20,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 22,
    padding: 18,
  },

  emptyTitle: {
    margin: 0,
    fontSize: 17,
    fontWeight: 650,
  },

  emptyText: {
    margin: "8px 0 0 0",
    fontSize: 14,
    lineHeight: 1.5,
    color: "rgba(255,255,255,0.68)",
  },

  overlay: {
    position: "absolute",
    inset: 0,
    zIndex: 30,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    background: "rgba(11, 15, 23, 0.38)",
    cursor: "pointer",
  },

  glassCard: {
    width: "min(760px, 94%)",
    borderRadius: 30,
    padding: "42px 34px",
    textAlign: "center",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.14)",
    backdropFilter: "blur(22px)",
    WebkitBackdropFilter: "blur(22px)",
    boxShadow: "0 24px 70px rgba(0,0,0,0.35)",
  },

  glassEyebrow: {
    margin: "0 0 12px 0",
    fontSize: 12,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.58)",
  },

  glassTitle: {
    margin: 0,
    fontSize: "clamp(2rem, 5vw, 3.8rem)",
    lineHeight: 1.05,
    fontWeight: 750,
  },

  glassSubtitle: {
    margin: "14px auto 0 auto",
    maxWidth: 560,
    fontSize: 16,
    lineHeight: 1.6,
    color: "rgba(255,255,255,0.8)",
  },

  enterButton: {
    marginTop: 26,
    padding: "14px 22px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.16)",
    background: "rgba(255,255,255,0.1)",
    color: "white",
    fontSize: 14,
    fontWeight: 650,
    letterSpacing: 0.2,
    cursor: "pointer",
    boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
  },
};

export default function ProductOwnerPage(): JSX.Element {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });

  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [projectError, setProjectError] = useState("");
  const [revealed, setRevealed] = useState(false);

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
        setProjectError(e?.message ?? "Unable to load projects.");
      })
      .finally(() => {
        setLoadingProjects(false);
      });
  }, [user]);

  const activeProject = useMemo(() => {
    return projects.find((project) => project.id === activeProjectId) ?? null;
  }, [projects, activeProjectId]);

  return (
    <SidebarLayout>
      <main className="app-background" style={styles.main}>
        <div style={styles.shell}>
          <AnimatePresence>
            {!revealed && (
              <motion.div
                style={styles.overlay}
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, ease: "easeInOut" }}
                onClick={() => setRevealed(true)}
              >
                <motion.div
                  style={styles.glassCard}
                  initial={{ opacity: 0, y: 24, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 12, scale: 0.98 }}
                  transition={{ duration: 0.55, ease: "easeOut" }}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <p style={styles.glassEyebrow}>Product Owner</p>
                  <h1 style={styles.glassTitle}>
                    Hi {user?.name ?? "there"}, welcome to your workspace!
                  </h1>
                  <p style={styles.glassSubtitle}>
                    Manage backlog strategy, roadmap planning, team progress,
                    and product direction from one central page.
                  </p>

                  <button
                    type="button"
                    style={styles.enterButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      setRevealed(true);
                    }}
                  >
                    Enter Workspace
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            style={styles.content}
            initial={{ opacity: 0.82 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            <section style={styles.hero}>
              <div style={styles.heroText}>
                <motion.h1
                  style={styles.pageTitle}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                >
                  Product Owner Dashboard
                </motion.h1>
                <p style={styles.pageSubtitle}>
                  A central view for backlog planning, product vision,
                  prioritization, roadmap alignment, and team progress.
                </p>
              </div>

              <div style={styles.projectChip}>
                <p style={styles.chipLabel}>Active Project</p>
                <p style={styles.chipValue}>
                  {activeProject?.name ?? "No project selected"}
                </p>
                <p style={styles.chipSubtext}>
                  {loadingProjects
                    ? "Loading projects..."
                    : projectError
                    ? projectError
                    : `${projects.length} project${projects.length === 1 ? "" : "s"} available`}
                </p>
              </div>
            </section>

            <section style={styles.topGrid}>
              <div style={styles.card}>
                <h2 style={styles.cardTitle}>Project Microcharter</h2>
                <p style={styles.cardDescription}>
                  Define the project vision, scope, goals, and shared direction
                  for the team at a high level.
                </p>
                <div style={styles.imageWrap}>
                  <img
                    src="/task-board-placeholder.png"
                    alt="Project microcharter preview"
                    style={styles.image}
                  />
                </div>
              </div>

              <div style={styles.card}>
                <h2 style={styles.cardTitle}>Product Backlog</h2>
                <p style={styles.cardDescription}>
                  Manage user stories, prioritize work, and organize sprint
                  assignments with a backlog-driven planning view.
                </p>
                <div style={styles.imageWrap}>
                  <img
                    src="/product_backlog_framework.jpeg"
                    alt="Product backlog preview"
                    style={styles.image}
                  />
                </div>
              </div>
            </section>

            <section style={styles.bottomGrid}>
              <div style={styles.card}>
                <h2 style={styles.cardTitle}>Product Roadmap</h2>
                <p style={styles.cardDescription}>
                  Visualize product development direction, milestones, and
                  longer-term planning across the lifecycle.
                </p>
                <div style={styles.imageWrap}>
                  <img
                    src="/product_roadmap_placeholder.png"
                    alt="Product roadmap preview"
                    style={styles.image}
                  />
                </div>
              </div>

              <div style={styles.card}>
                <h2 style={styles.cardTitle}>Team Progress</h2>
                <p style={styles.cardDescription}>
                  Monitor progress through velocity, burndown, updates, and team
                  communication while supporting acceptance criteria and answers.
                </p>
                <div style={styles.imageWrap}>
                  <img
                    src="/progress-insights-placeholder.png"
                    alt="Team progress preview"
                    style={styles.image}
                  />
                </div>
              </div>
            </section>

            {projects.length === 0 && !loadingProjects && !projectError && (
              <section style={styles.emptyState}>
                <h3 style={styles.emptyTitle}>No Projects Yet</h3>
                <p style={styles.emptyText}>
                  Once a project is created, it will appear here so the product
                  owner dashboard can show active planning, backlog, and product
                  management context.
                </p>
              </section>
            )}
          </motion.div>
        </div>
      </main>
    </SidebarLayout>
  );
}