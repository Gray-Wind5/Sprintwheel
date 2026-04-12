/* import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, JSX } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { me } from "../../api/auth";
import { listProjects, type Project } from "../../api/projects";
import SidebarLayout from "../../components/SidebarLayout";
import DashboardCalendarPreview from "../../components/DashboardCalendarPreview";
import { useTheme } from "../ThemeContext";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type BacklogStory = {
  id: string;
  title: string;
  description: string | null;
  points: number | null;
  isDone: boolean;
};

const styles: Record<string, CSSProperties> = {
  main: {
    width: "100%",
    minHeight: "100vh",
    padding: 24,
    position: "relative",
    overflow: "hidden",
  },

  shell: {
    position: "relative",
    width: "100%",
    minHeight: "calc(100vh - 48px)",
    overflow: "hidden",
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
    fontSize: 15,
    lineHeight: 1.5,
    maxWidth: 620,
  },

  projectChip: {
    flex: "0 0 260px",
    borderRadius: 20,
    padding: 16,
    boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
  },

  chipLabel: {
    margin: 0,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },

  chipValue: {
    margin: "6px 0 0 0",
    fontSize: 18,
    fontWeight: 650,
  },

  chipSubtext: {
    margin: "8px 0 0 0",
    fontSize: 13,
    lineHeight: 1.4,
  },

  calendarSection: {
    marginTop: 20,
    marginBottom: 20,
  },

  topGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 20,
    alignItems: "stretch",
  },

  bottomGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 20,
    marginTop: 20,
  },

  card: {
    borderRadius: 24,
    padding: 22,
    boxShadow: "0 18px 44px rgba(0,0,0,0.22)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    display: "flex",
    flexDirection: "column",
    minHeight: 280,
    cursor: "pointer",
  },

  cardTitle: {
    margin: 0,
    fontSize: 22,
    fontWeight: 700,
  },

  cardDescription: {
    margin: "10px 0 18px 0",
    fontSize: 14,
    lineHeight: 1.6,
    maxWidth: 520,
  },

  imageWrap: {
    marginTop: "auto",
    width: "100%",
    borderRadius: 18,
    overflow: "hidden",
    minHeight: 160,
  },

  image: {
    display: "block",
    width: "100%",
    height: 180,
    objectFit: "cover",
  },

  overlay: {
    position: "absolute",
    inset: 0,
    zIndex: 30,
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    padding: 80,
    cursor: "pointer",
  },

  glassCard: {
    width: "min(760px, 94%)",
    borderRadius: 28,
    padding: "42px 34px",
    textAlign: "center",
    backdropFilter: "blur(22px)",
    WebkitBackdropFilter: "blur(22px)",
    boxShadow: "0 24px 70px rgba(0,0,0,0.35)",
  },

  glassEyebrow: {
    margin: "0 0 12px 0",
    fontSize: 12,
    letterSpacing: 2,
    textTransform: "uppercase",
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
  },

  enterButton: {
    marginTop: 26,
    padding: "14px 22px",
    borderRadius: 999,
    fontSize: 14,
    fontWeight: 650,
    letterSpacing: 0.2,
    cursor: "pointer",
    boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
  },

  backlogPreviewWrap: {
    marginTop: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },

  backlogPreviewItem: {
    borderRadius: 14,
    padding: 12,
  },

  backlogPreviewTopRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },

  backlogPreviewIndex: {
    fontSize: 12,
    fontWeight: 700,
  },

  backlogPreviewStatus: {
    fontSize: 12,
  },

  backlogPreviewTitle: {
    margin: 0,
    fontSize: 14,
    fontWeight: 600,
  },

  backlogPreviewMeta: {
    marginTop: 6,
    fontSize: 12,
  },

  backlogEmpty: {
    fontSize: 14,
  },
};

export default function ProductOwnerPage(): JSX.Element {
  const navigate = useNavigate();
  const { projectId, role } = useParams();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });

  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [projectError, setProjectError] = useState("");
  const [revealed, setRevealed] = useState(() => {
    return sessionStorage.getItem("dashboard_revealed") === "true";
  });
  const [backlogStories, setBacklogStories] = useState<BacklogStory[]>([]);
  const [backlogLoading, setBacklogLoading] = useState(false);
  const [backlogError, setBacklogError] = useState("");

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
    if (!activeProjectId) return;

    setBacklogLoading(true);
    setBacklogError("");

    fetch(`http://127.0.0.1:8000/stories/backlog?project_id=${activeProjectId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data: BacklogStory[]) => {
        setBacklogStories(data);
        setBacklogLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching backlog preview:", err);
        setBacklogStories([]);
        setBacklogError("Unable to load backlog preview.");
        setBacklogLoading(false);
      });
  }, [activeProjectId]);

  useEffect(() => {
    if (!user) return;

    setLoadingProjects(true);
    setProjectError("");

    listProjects()
      .then((data) => {
        setProjects(data);
        if (projectId) {
          setActiveProjectId(projectId);
        } else if (data.length > 0) {
          setActiveProjectId(data[0].id);
        }
      })
      .catch((e: any) => {
        setProjectError(e?.message ?? "Unable to load projects.");
      })
      .finally(() => {
        setLoadingProjects(false);
      });
  }, [user, projectId]);

  const activeProject = useMemo(() => {
    return projects.find((project) => project.id === activeProjectId) ?? null;
  }, [projects, activeProjectId]);

  const previewStories = backlogStories.slice(0, 3);

  return (
    <SidebarLayout>
      <main
        style={{
          ...styles.main,
          background: isDark
            ? "radial-gradient(circle at top left, rgba(99,102,241,0.14), transparent 28%), linear-gradient(180deg, #0b0f17 0%, #0f172a 45%, #0b0f17 100%)"
            : "#ffffff",
          color: isDark ? "white" : "#111827",
        }}
      >
        <div style={styles.shell}>
          <AnimatePresence>
            {!revealed && (
              <motion.div
                style={{
                  ...styles.overlay,
                  background: isDark
                    ? "rgba(11, 15, 23, 0.38)"
                    : "rgba(248, 250, 252, 0.62)",
                }}
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, ease: "easeInOut" }}
                onClick={() => {
                  sessionStorage.setItem("dashboard_revealed", "true");
                  setRevealed(true);
                }}
              >
                <motion.div
                  style={{
                    ...styles.glassCard,
                    background: isDark ? "rgba(255,255,255,0.08)" : "#ffffff",
                    border: isDark
                      ? "1px solid rgba(255,255,255,0.14)"
                      : "1px solid rgba(17,24,39,0.08)",
                    boxShadow: isDark
                      ? "0 24px 70px rgba(0,0,0,0.35)"
                      : "0 24px 70px rgba(15,23,42,0.10)",
                  }}
                  initial={{ opacity: 0, y: 24, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 12, scale: 0.98 }}
                  transition={{ duration: 0.55, ease: "easeOut" }}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <p
                    style={{
                      ...styles.glassEyebrow,
                      color: isDark ? "rgba(255,255,255,0.58)" : "#6b7280",
                    }}
                  >
                    Product Owner
                  </p>
                  <h1
                    style={{
                      ...styles.glassTitle,
                      color: isDark ? "white" : "#111827",
                    }}
                  >
                    Hi {user?.name ?? "there"}, welcome to your workspace!
                  </h1>
                  <p
                    style={{
                      ...styles.glassSubtitle,
                      color: isDark ? "rgba(255,255,255,0.8)" : "#4b5563",
                    }}
                  >
                    Manage backlog strategy, roadmap planning, team progress,
                    and product direction from one central page.
                  </p>

                  <button
                    type="button"
                    style={{
                      ...styles.enterButton,
                      background: isDark ? "rgba(255,255,255,0.1)" : "#f3f4f6",
                      border: isDark
                        ? "1px solid rgba(255,255,255,0.16)"
                        : "1px solid rgba(17,24,39,0.08)",
                      color: isDark ? "white" : "#111827",
                      boxShadow: isDark
                        ? "0 8px 24px rgba(0,0,0,0.18)"
                        : "0 8px 24px rgba(15,23,42,0.08)",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      sessionStorage.setItem("dashboard_revealed", "true");
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
                  style={{
                    ...styles.pageTitle,
                    color: isDark ? "white" : "#111827",
                  }}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                >
                  Product Owner Dashboard
                </motion.h1>
                <p
                  style={{
                    ...styles.pageSubtitle,
                    color: isDark ? "rgba(255,255,255,0.72)" : "#4b5563",
                  }}
                >
                  A central view for backlog planning, product vision,
                  prioritization, roadmap alignment, and team progress.
                </p>
              </div>

              <div
                style={{
                  ...styles.projectChip,
                  background: isDark ? "rgba(255,255,255,0.05)" : "#ffffff",
                  border: isDark
                    ? "1px solid rgba(255,255,255,0.08)"
                    : "1px solid rgba(17,24,39,0.08)",
                  boxShadow: isDark
                    ? "0 10px 30px rgba(0,0,0,0.18)"
                    : "0 10px 30px rgba(15,23,42,0.08)",
                }}
              >
                <p
                  style={{
                    ...styles.chipLabel,
                    color: isDark ? "rgba(255,255,255,0.58)" : "#6b7280",
                  }}
                >
                  Active Project
                </p>
                <p
                  style={{
                    ...styles.chipValue,
                    color: isDark ? "white" : "#111827",
                  }}
                >
                  {activeProject?.name ?? "No project selected"}
                </p>
                <p
                  style={{
                    ...styles.chipSubtext,
                    color: isDark ? "rgba(255,255,255,0.66)" : "#6b7280",
                  }}
                >
                  {loadingProjects
                    ? "Loading projects..."
                    : projectError
                    ? projectError
                    : `${projects.length} project${projects.length === 1 ? "" : "s"} available`}
                </p>
              </div>
            </section>

            <section style={styles.topGrid}>
              <div
                style={{
                  ...styles.card,
                  background: isDark ? "rgba(255,255,255,0.05)" : "#ffffff",
                  border: isDark
                    ? "1px solid rgba(255,255,255,0.08)"
                    : "1px solid rgba(17,24,39,0.08)",
                  boxShadow: isDark
                    ? "0 18px 44px rgba(0,0,0,0.22)"
                    : "0 12px 32px rgba(15,23,42,0.08)",
                  cursor: "default",
                }}
              >
                <h2
                  style={{
                    ...styles.cardTitle,
                    color: isDark ? "white" : "#111827",
                  }}
                >
                  Project Microcharter
                </h2>
                <p
                  style={{
                    ...styles.cardDescription,
                    color: isDark ? "rgba(255,255,255,0.72)" : "#4b5563",
                  }}
                >
                  Define the project vision, scope, goals, and shared direction
                  for the team at a high level.
                </p>
                <div
                  style={{
                    ...styles.imageWrap,
                    background: isDark ? "rgba(255,255,255,0.04)" : "#f8fafc",
                    border: isDark
                      ? "1px solid rgba(255,255,255,0.06)"
                      : "1px solid rgba(17,24,39,0.08)",
                  }}
                >
                  <img
                    src="/task-board-placeholder.png"
                    alt="Project microcharter preview"
                    style={styles.image}
                  />
                </div>
              </div>

              <div
                style={{
                  ...styles.card,
                  background: isDark ? "rgba(255,255,255,0.05)" : "#ffffff",
                  border: isDark
                    ? "1px solid rgba(255,255,255,0.08)"
                    : "1px solid rgba(17,24,39,0.08)",
                  boxShadow: isDark
                    ? "0 18px 44px rgba(0,0,0,0.22)"
                    : "0 12px 32px rgba(15,23,42,0.08)",
                }}
                onClick={() => {
                  if (activeProjectId && role) {
                    navigate(`/projects/${activeProjectId}/${role}/product-backlog`);
                  }
                }}
              >
                <h2
                  style={{
                    ...styles.cardTitle,
                    color: isDark ? "white" : "#111827",
                  }}
                >
                  Product Backlog
                </h2>
                <p
                  style={{
                    ...styles.cardDescription,
                    color: isDark ? "rgba(255,255,255,0.72)" : "#4b5563",
                  }}
                >
                  Manage user stories, prioritize work, and organize sprint
                  assignments with a backlog-driven planning view.
                </p>

                <div style={styles.backlogPreviewWrap}>
                  {backlogLoading ? (
                    <p
                      style={{
                        ...styles.backlogEmpty,
                        color: isDark ? "rgba(255,255,255,0.6)" : "#6b7280",
                      }}
                    >
                      Loading...
                    </p>
                  ) : backlogError ? (
                    <p
                      style={{
                        ...styles.backlogEmpty,
                        color: isDark ? "rgba(255,255,255,0.6)" : "#6b7280",
                      }}
                    >
                      {backlogError}
                    </p>
                  ) : previewStories.length === 0 ? (
                    <p
                      style={{
                        ...styles.backlogEmpty,
                        color: isDark ? "rgba(255,255,255,0.6)" : "#6b7280",
                      }}
                    >
                      No backlog items yet.
                    </p>
                  ) : (
                    previewStories.map((story, index) => (
                      <div
                        key={story.id}
                        style={{
                          ...styles.backlogPreviewItem,
                          background: isDark ? "rgba(15,23,42,0.7)" : "#f8fafc",
                          border: isDark
                            ? "1px solid rgba(255,255,255,0.08)"
                            : "1px solid rgba(17,24,39,0.08)",
                        }}
                      >
                        <div style={styles.backlogPreviewTopRow}>
                          <span
                            style={{
                              ...styles.backlogPreviewIndex,
                              color: isDark ? "rgba(255,255,255,0.55)" : "#6b7280",
                            }}
                          >
                            #{index + 1}
                          </span>
                          <span
                            style={{
                              ...styles.backlogPreviewStatus,
                              color: isDark ? "rgba(255,255,255,0.7)" : "#6b7280",
                            }}
                          >
                            {story.isDone ? "Done" : "Open"}
                          </span>
                        </div>
                        <p
                          style={{
                            ...styles.backlogPreviewTitle,
                            color: isDark ? "white" : "#111827",
                          }}
                        >
                          {story.title}
                        </p>
                        <p
                          style={{
                            ...styles.backlogPreviewMeta,
                            color: isDark ? "rgba(255,255,255,0.6)" : "#6b7280",
                          }}
                        >
                          {story.points ?? 0} pts
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>

            <section style={styles.bottomGrid}>
              <div
                style={{
                  ...styles.card,
                  background: isDark ? "rgba(255,255,255,0.05)" : "#ffffff",
                  border: isDark
                    ? "1px solid rgba(255,255,255,0.08)"
                    : "1px solid rgba(17,24,39,0.08)",
                  boxShadow: isDark
                    ? "0 18px 44px rgba(0,0,0,0.22)"
                    : "0 12px 32px rgba(15,23,42,0.08)",
                  cursor: "default",
                }}
              >
                <h2
                  style={{
                    ...styles.cardTitle,
                    color: isDark ? "white" : "#111827",
                  }}
                >
                  Product Roadmap
                </h2>
                <p
                  style={{
                    ...styles.cardDescription,
                    color: isDark ? "rgba(255,255,255,0.72)" : "#4b5563",
                  }}
                >
                  Visualize product development direction, milestones, and
                  longer-term planning across the lifecycle.
                </p>
                <div
                  style={{
                    ...styles.imageWrap,
                    background: isDark ? "rgba(255,255,255,0.04)" : "#f8fafc",
                    border: isDark
                      ? "1px solid rgba(255,255,255,0.06)"
                      : "1px solid rgba(17,24,39,0.08)",
                  }}
                >
                  <img
                    src="/roadmap-placeholder.png"
                    alt="Product roadmap preview"
                    style={styles.image}
                  />
                </div>
              </div>

              <div
                style={{
                  ...styles.card,
                  background: isDark ? "rgba(255,255,255,0.05)" : "#ffffff",
                  border: isDark
                    ? "1px solid rgba(255,255,255,0.08)"
                    : "1px solid rgba(17,24,39,0.08)",
                  boxShadow: isDark
                    ? "0 18px 44px rgba(0,0,0,0.22)"
                    : "0 12px 32px rgba(15,23,42,0.08)",
                  cursor: "default",
                }}
              >
                <h2
                  style={{
                    ...styles.cardTitle,
                    color: isDark ? "white" : "#111827",
                  }}
                >
                  Insights & Progress
                </h2>
                <p
                  style={{
                    ...styles.cardDescription,
                    color: isDark ? "rgba(255,255,255,0.72)" : "#4b5563",
                  }}
                >
                  Track how the product is moving forward and identify areas
                  that need prioritization or refinement.
                </p>
                <div
                  style={{
                    ...styles.imageWrap,
                    background: isDark ? "rgba(255,255,255,0.04)" : "#f8fafc",
                    border: isDark
                      ? "1px solid rgba(255,255,255,0.06)"
                      : "1px solid rgba(17,24,39,0.08)",
                  }}
                >
                  <img
                    src="/analytics-placeholder.png"
                    alt="Insights and progress preview"
                    style={styles.image}
                  />
                </div>
              </div>
            </section>

            {projectId && role && (
              <section style={styles.calendarSection}>
                <DashboardCalendarPreview
                  projectId={projectId}
                  role={role}
                  title="All Projects Calendar"
                  subtitle="View this week’s events across all projects. Click anywhere to open the full calendar page."
                />
              </section>
            )}
          </motion.div>
        </div>
      </main>
    </SidebarLayout>
  );
} */ 

  import { motion, AnimatePresence } from "framer-motion";
  import { useEffect, useMemo, useState } from "react";
  import type { CSSProperties, JSX } from "react";
  import { useNavigate, useParams } from "react-router-dom";
  import { me } from "../../api/auth";
  import { listProjects, type Project } from "../../api/projects";
  import SidebarLayout from "../../components/SidebarLayout";
  import DashboardCalendarPreview from "../../components/DashboardCalendarPreview";
  import { useTheme } from "../ThemeContext";
  
  type User = { id: string; name: string; email: string; role: string };
  type BacklogStory = { id: string; title: string; description: string | null; points: number | null; isDone: boolean };
  
  //  Preview Components 
  
  function BacklogPreview({ stories, loading, error, isDark }: { stories: BacklogStory[]; loading: boolean; error: string; isDark: boolean }) {
    if (loading) return <p style={{ marginTop: 14, fontSize: 13, color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>Loading…</p>;
    if (error)   return <p style={{ marginTop: 14, fontSize: 13, color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>{error}</p>;
    if (stories.length === 0) return <p style={{ marginTop: 14, fontSize: 13, color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>No backlog items yet.</p>;
    return (
      <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 7 }}>
        {stories.slice(0, 4).map((story, i) => (
          <div key={story.id} style={{ background: isDark ? "rgba(255,255,255,0.05)" : "#f8fafc", borderRadius: 10, padding: "8px 12px", border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "#e5e7eb"}`, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 22, height: 22, borderRadius: "50%", background: story.isDone ? "#22c55e" : "#6366f1", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 10, color: "white", fontWeight: 800 }}>
              {story.isDone ? "✓" : i + 1}
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: isDark ? "rgba(255,255,255,0.85)" : "#374151", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{story.title}</span>
            <span style={{ fontSize: 11, color: isDark ? "rgba(255,255,255,0.38)" : "#9ca3af", flexShrink: 0 }}>{story.points ?? 0}pt</span>
          </div>
        ))}
      </div>
    );
  }
  
  function RoadmapPreview({ isDark }: { isDark: boolean }) {
    const milestones = [
      { label: "MVP",    done: true,  q: "Q1" },
      { label: "Beta",   done: true,  q: "Q2" },
      { label: "Launch", done: false, q: "Q3" },
      { label: "v2.0",   done: false, q: "Q4" },
    ];
    return (
      <div style={{ marginTop: 14, position: "relative", paddingBottom: 4 }}>
        {/* Track */}
        <div style={{ position: "absolute", top: 15, left: 20, right: 20, height: 3, background: isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb", borderRadius: 99 }}>
          <div style={{ height: "100%", width: "50%", background: "#6366f1", borderRadius: 99 }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
          {milestones.map((m) => (
            <div key={m.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: m.done ? "#6366f1" : (isDark ? "rgba(255,255,255,0.1)" : "#e5e7eb"), border: `3px solid ${m.done ? "#818cf8" : (isDark ? "rgba(255,255,255,0.2)" : "#d1d5db")}`, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1 }}>
                {m.done && <span style={{ color: "white", fontSize: 12, fontWeight: 800 }}>✓</span>}
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: isDark ? "white" : "#111827" }}>{m.label}</div>
                <div style={{ fontSize: 10, color: isDark ? "rgba(255,255,255,0.4)" : "#9ca3af" }}>{m.q}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  function InsightsPreview({ isDark }: { isDark: boolean }) {
    const stats = [
      { label: "Velocity",    value: "42 pts", trend: "+12%", up: true },
      { label: "Completion",  value: "87%",    trend: "+5%",  up: true },
      { label: "Defect Rate", value: "2.3%",   trend: "-0.8%", up: false },
      { label: "Cycle Time",  value: "3.2d",   trend: "-0.4d", up: false },
    ];
    return (
      <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {stats.map((s) => (
          <div key={s.label} style={{ background: isDark ? "rgba(255,255,255,0.05)" : "#f8fafc", borderRadius: 10, padding: "9px 10px", border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "#e5e7eb"}` }}>
            <div style={{ fontSize: 10, color: isDark ? "rgba(255,255,255,0.45)" : "#6b7280" }}>{s.label}</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: isDark ? "white" : "#111827", marginTop: 2, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 10, color: s.up ? "#22c55e" : "#f97316", marginTop: 3 }}>{s.trend}</div>
          </div>
        ))}
      </div>
    );
  }
  
  function MicrocharterPreview({ isDark }: { isDark: boolean }) {
    const sections = [
      { label: "Vision",       pct: 80, color: "#6366f1" },
      { label: "Scope",        pct: 60, color: "#22c55e" },
      { label: "Goals",        pct: 90, color: "#f59e0b" },
      { label: "Stakeholders", pct: 45, color: "#ec4899" },
    ];
    return (
      <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
        {sections.map((s) => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 10, background: isDark ? "rgba(255,255,255,0.05)" : "#f8fafc", borderRadius: 8, padding: "7px 10px", border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "#e5e7eb"}` }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: isDark ? "rgba(255,255,255,0.8)" : "#374151", flex: 1 }}>{s.label}</span>
            <div style={{ width: 60, height: 4, borderRadius: 99, background: isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb", overflow: "hidden", flexShrink: 0 }}>
              <div style={{ height: "100%", width: `${s.pct}%`, background: s.color, borderRadius: 99 }} />
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  // Page 
  
  export default function ProductOwnerPage(): JSX.Element {
    const navigate = useNavigate();
    const { projectId, role } = useParams();
    const { theme } = useTheme();
    const isDark = theme === "dark";
  
    const [user, setUser] = useState<User | null>(() => {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    });
    const [projects, setProjects] = useState<Project[]>([]);
    const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
    const [loadingProjects, setLoadingProjects] = useState(false);
    const [projectError, setProjectError] = useState("");
    const [revealed, setRevealed] = useState(() => sessionStorage.getItem("dashboard_revealed") === "true");
    const [backlogStories, setBacklogStories] = useState<BacklogStory[]>([]);
    const [backlogLoading, setBacklogLoading] = useState(false);
    const [backlogError, setBacklogError] = useState("");
  
    useEffect(() => {
      const token = localStorage.getItem("token");
      if (!token) { navigate("/login", { replace: true }); return; }
      me(token)
        .then((u: User) => { setUser(u); localStorage.setItem("user", JSON.stringify(u)); })
        .catch(() => { localStorage.removeItem("token"); localStorage.removeItem("user"); navigate("/login", { replace: true }); });
    }, [navigate]);
  
    useEffect(() => {
      if (!activeProjectId) return;
      setBacklogLoading(true);
      setBacklogError("");
      fetch(`http://127.0.0.1:8000/stories/backlog?project_id=${activeProjectId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
        .then(async (res) => { if (!res.ok) throw new Error(await res.text()); return res.json(); })
        .then((data: BacklogStory[]) => { setBacklogStories(data); setBacklogLoading(false); })
        .catch(() => { setBacklogStories([]); setBacklogError("Unable to load backlog."); setBacklogLoading(false); });
    }, [activeProjectId]);
  
    useEffect(() => {
      if (!user) return;
      setLoadingProjects(true);
      listProjects()
        .then((data) => { setProjects(data); setActiveProjectId(projectId ?? (data[0]?.id ?? null)); })
        .catch((e: any) => setProjectError(e?.message ?? "Unable to load projects."))
        .finally(() => setLoadingProjects(false));
    }, [user, projectId]);
  
    const activeProject = useMemo(() => projects.find((p) => p.id === activeProjectId) ?? null, [projects, activeProjectId]);
    const dismiss = () => { sessionStorage.setItem("dashboard_revealed", "true"); setRevealed(true); };
  
    // Build page-linked paths
    const backlogPath     = activeProjectId && role ? `/projects/${activeProjectId}/${role}/product-backlog` : "";
    const progressPath    = activeProjectId && role ? `/projects/${activeProjectId}/${role}/progress` : "";
    const microcharterPath = activeProjectId && role ? `/projects/${activeProjectId}/${role}/microcharter` : "";
    const roadmapPath     = activeProjectId && role ? `/projects/${activeProjectId}/${role}/roadmap` : "";
  
    const bg = isDark
      ? "radial-gradient(circle at top left, rgba(99,102,241,0.14), transparent 28%), linear-gradient(180deg, #0b0f17 0%, #0f172a 45%, #0b0f17 100%)"
      : "#f1f5f9";
  
    const card: CSSProperties = {
      background: isDark ? "rgba(255,255,255,0.05)" : "#ffffff",
      border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(17,24,39,0.08)"}`,
      borderRadius: 20,
      padding: 20,
      boxShadow: isDark ? "0 12px 32px rgba(0,0,0,0.18)" : "0 4px 24px rgba(15,23,42,0.07)",
      transition: "box-shadow 0.15s",
    };
    const hoverShadow = isDark ? "0 18px 44px rgba(0,0,0,0.3)" : "0 8px 32px rgba(15,23,42,0.13)";
    const cardTitle: CSSProperties = { margin: 0, fontSize: 17, fontWeight: 700, color: isDark ? "white" : "#111827" };
    const cardDesc: CSSProperties  = { margin: "5px 0 0", fontSize: 13, lineHeight: 1.5, color: isDark ? "rgba(255,255,255,0.58)" : "#6b7280" };
    const eyebrow: CSSProperties   = { margin: "0 0 4px", fontSize: 11, fontWeight: 700, letterSpacing: 1.4, textTransform: "uppercase" as const, color: isDark ? "rgba(255,255,255,0.38)" : "#9ca3af" };
    const sectionLabel: CSSProperties = { fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" as const, color: isDark ? "rgba(255,255,255,0.38)" : "#9ca3af", margin: "0 0 12px" };
    const arrow = <span style={{ fontSize: 16, color: isDark ? "rgba(255,255,255,0.38)" : "#9ca3af", flexShrink: 0, marginTop: 2 }}>↗</span>;
  
    const clickCard = (path: string): CSSProperties => ({ ...card, cursor: path ? "pointer" : "default" });
    const onEnter = (e: React.MouseEvent<HTMLDivElement>, active: boolean) => {
      if (active) (e.currentTarget as HTMLDivElement).style.boxShadow = hoverShadow;
    };
    const onLeave = (e: React.MouseEvent<HTMLDivElement>) => {
      (e.currentTarget as HTMLDivElement).style.boxShadow = isDark ? "0 12px 32px rgba(0,0,0,0.18)" : "0 4px 24px rgba(15,23,42,0.07)";
    };
  
    return (
      <SidebarLayout>
        <main style={{ width: "100%", minHeight: "100vh", padding: 24, background: bg, color: isDark ? "white" : "#111827", position: "relative" }}>
  
          {/* ── Splash overlay ── */}
          <AnimatePresence>
            {!revealed && (
              <motion.div
                style={{ position: "absolute", inset: 0, zIndex: 30, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "70px 24px", background: isDark ? "rgba(11,15,23,0.62)" : "rgba(241,245,249,0.82)", cursor: "pointer", backdropFilter: "blur(6px)" }}
                initial={{ opacity: 1 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
                onClick={dismiss}
              >
                <motion.div
                  style={{ width: "min(580px,94%)", borderRadius: 28, padding: "44px 36px", textAlign: "center", background: isDark ? "rgba(255,255,255,0.07)" : "#ffffff", border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "rgba(17,24,39,0.08)"}`, backdropFilter: "blur(24px)", boxShadow: isDark ? "0 24px 70px rgba(0,0,0,0.4)" : "0 24px 70px rgba(15,23,42,0.12)" }}
                  initial={{ opacity: 0, y: 28, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.97 }}
                  transition={{ duration: 0.5, ease: "easeOut" }} onClick={(e) => e.stopPropagation()}
                >
                  <p style={{ margin: "0 0 10px", fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: isDark ? "rgba(255,255,255,0.4)" : "#9ca3af" }}>Product Owner</p>
                  <h1 style={{ margin: "0 0 12px", fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 800, color: isDark ? "white" : "#111827", lineHeight: 1.1 }}>
                    Hi {user?.name ?? "there"}, welcome!
                  </h1>
                  <p style={{ margin: "0 auto 24px", maxWidth: 420, fontSize: 15, lineHeight: 1.6, color: isDark ? "rgba(255,255,255,0.65)" : "#4b5563" }}>
                    Manage backlog strategy, roadmap planning, team progress, and product direction from one central page.
                  </p>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); dismiss(); }}
                    style={{ padding: "12px 28px", borderRadius: 999, border: `1px solid ${isDark ? "rgba(255,255,255,0.15)" : "rgba(17,24,39,0.1)"}`, background: isDark ? "rgba(34,197,94,0.22)" : "#dcfce7", color: isDark ? "white" : "#15803d", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
                  >
                    Enter Workspace →
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
  
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
  
            {/* ── Header ── */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 28 }}>
              <div>
                <motion.h1
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
                  style={{ margin: 0, fontSize: "clamp(1.8rem,4vw,2.6rem)", fontWeight: 800, color: isDark ? "white" : "#111827", lineHeight: 1.05 }}
                >
                  Product Owner
                </motion.h1>
                <p style={{ margin: "5px 0 0", fontSize: 14, color: isDark ? "rgba(255,255,255,0.55)" : "#6b7280" }}>Backlog · Roadmap · Insights</p>
              </div>
              <div style={{ ...card, padding: "12px 18px", minWidth: 200 }}>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: isDark ? "rgba(255,255,255,0.38)" : "#9ca3af" }}>Active Project</p>
                <p style={{ margin: "4px 0 0", fontSize: 16, fontWeight: 700, color: isDark ? "white" : "#111827" }}>{activeProject?.name ?? "—"}</p>
                <p style={{ margin: "3px 0 0", fontSize: 12, color: isDark ? "rgba(255,255,255,0.45)" : "#6b7280" }}>
                  {loadingProjects ? "Loading…" : projectError ? projectError : `${projects.length} project${projects.length === 1 ? "" : "s"}`}
                </p>
              </div>
            </div>
  
            {/* ── Calendar ── */}
            {projectId && role && (
              <div style={{ marginBottom: 28 }}>
                <p style={sectionLabel}>📅 Calendar</p>
                <DashboardCalendarPreview
                  projectId={projectId}
                  role={role}
                  title="All Projects Calendar"
                  subtitle="This week's events. Click to open the full calendar."
                />
              </div>
            )}
  
            {/* ── Cards grid ── */}
            <p style={sectionLabel}>📦 Product Workspace</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: 16 }}>
  
              {/* Product Backlog */}
              <div
                style={clickCard(backlogPath)}
                onClick={() => backlogPath && navigate(backlogPath)}
                onMouseEnter={(e) => onEnter(e, !!backlogPath)}
                onMouseLeave={onLeave}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                  <div>
                    <p style={eyebrow}>Backlog</p>
                    <h2 style={cardTitle}>Product Backlog</h2>
                    <p style={cardDesc}>Manage user stories and prioritize sprint work.</p>
                  </div>
                  {backlogPath && arrow}
                </div>
                <BacklogPreview stories={backlogStories} loading={backlogLoading} error={backlogError} isDark={isDark} />
              </div>
  
              {/* Project Microcharter */}
              <div
                style={clickCard(microcharterPath)}
                onClick={() => microcharterPath && navigate(microcharterPath)}
                onMouseEnter={(e) => onEnter(e, !!microcharterPath)}
                onMouseLeave={onLeave}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                  <div>
                    <p style={eyebrow}>Vision</p>
                    <h2 style={cardTitle}>Project Microcharter</h2>
                    <p style={cardDesc}>Define project vision, scope, goals, and shared direction.</p>
                  </div>
                  {microcharterPath && arrow}
                </div>
                <MicrocharterPreview isDark={isDark} />
              </div>
  
              {/* Product Roadmap */}
              <div
                style={clickCard(roadmapPath)}
                onClick={() => roadmapPath && navigate(roadmapPath)}
                onMouseEnter={(e) => onEnter(e, !!roadmapPath)}
                onMouseLeave={onLeave}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                  <div>
                    <p style={eyebrow}>Planning</p>
                    <h2 style={cardTitle}>Product Roadmap</h2>
                    <p style={cardDesc}>Milestones and longer-term development direction.</p>
                  </div>
                  {roadmapPath && arrow}
                </div>
                <RoadmapPreview isDark={isDark} />
              </div>
  
              {/* Insights & Progress */}
              <div
                style={clickCard(progressPath)}
                onClick={() => progressPath && navigate(progressPath)}
                onMouseEnter={(e) => onEnter(e, !!progressPath)}
                onMouseLeave={onLeave}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                  <div>
                    <p style={eyebrow}>Analytics</p>
                    <h2 style={cardTitle}>Insights & Progress</h2>
                    <p style={cardDesc}>Track delivery health and identify refinement areas.</p>
                  </div>
                  {progressPath && arrow}
                </div>
                <InsightsPreview isDark={isDark} />
              </div>
  
            </div>
          </motion.div>
        </main>
      </SidebarLayout>
    );
  }