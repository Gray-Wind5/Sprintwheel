import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { CSSProperties, JSX } from "react";
import { useNavigate } from "react-router-dom";
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
  content: {
    color: "white",
    padding: 40,
  },
  image: {
    maxWidth: "100%",
    height: "auto",
    marginTop: 20,
  },
};

export default function ScrumFacilitatorPage(): JSX.Element {
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

          <div style={styles.content}>
            <p>This is the Scrum Facilitator page.</p>

            <h2>Impediment Tracker</h2>
            <img
              src="/impediment_tracker.jpeg"
              alt="Impediment Task Board shows problems from message board"
              style={styles.image}
            />
            <p>Impediment Tracker details will be found here.</p>

            <h2>Retrospective Notes</h2>
            <p>
              Function: takes data from Task Board and computes it here allows PO to drag & drop
              assignments for particular sprints
            </p>

            <h2>Set a Meeting</h2>
            <p>Meeting scheduling feature will be found here.</p>

            <h2>Admin Scrum Edu</h2>
            <p>Assign Modules to Devs & PO</p>
          </div>
        </div>
      </main>
    </SidebarLayout>
  );
}