/* import type { CSSProperties, JSX} from "react";

export default function ToDoPage(): JSX.Element {
    return (
        <div style={{ color: "white", padding: 40 }}>
            <h1>To-Do/Planning</h1>
            <p>This is the To-Do / Planning page.</p>
            <p> This is where the Task Board, Calendar, & Product Backlog will live</p>
            <p> Calendar Feature (Sprint #4)</p>
            <img src="/calendar-placeholder.png" alt="Calendar showing sprint schedule and important dates" style={{ maxWidth: "100%", height: "auto", marginTop: 20 }} />
            <p>Task Board</p>
            <img src="/task-board-placeholder.png" alt="Task Board showing tasks in different columns based on their status" style={{ maxWidth: "100%", height: "auto", marginTop: 20 }} />
            <p> Product Backlog</p>
            <img src="/product_backlog_framework.jpeg" alt="Product Backlog showing list of user stories and tasks" style={{ maxWidth: "100%", height: "auto", marginTop: 20 }} />

        </div>
    );
}*/ 

/* import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { JSX, CSSProperties } from "react";

import {
  DndContext,
  useDraggable,
  useDroppable,
  type DragEndEvent
} from "@dnd-kit/core";

interface Task {
  id: string;
  title: string;
  status: "todo" | "in_progress" | "done";
}

interface Board {
  todo: Task[];
  in_progress: Task[];
  done: Task[];
}

interface PendingDelete {
  taskId: string;
  status: keyof Board;
  title: string;
}

export default function ToDoPage(): JSX.Element {
  const { projectId } = useParams();

  const [board, setBoard] = useState<Board>({
    todo: [],
    in_progress: [],
    done: []
  });

  const [inputs, setInputs] = useState({
    todo: "",
    in_progress: "",
    done: ""
  });

  const [storyId, setStoryId] = useState<string | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<PendingDelete | null>(null);

  useEffect(() => {
    if (!projectId) return;

    fetch(`http://127.0.0.1:8000/projects/${projectId}/board`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setStoryId(data.story_id);

        setBoard({
          todo: data.todo,
          in_progress: data.in_progress,
          done: data.done
        });
      })
      .catch(err => console.error("Error fetching board:", err));
  }, [projectId]);

  function createTask(status: keyof Board) {
    const title = inputs[status].trim();
    if (!title || !projectId || !storyId) return;

    fetch("http://127.0.0.1:8000/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({
        title,
        description: "",
        story_id: storyId,
        status
      })
    })
      .then(res => res.json())
      .then(responseData => {
        const newTask: Task = {
          id: responseData.id,
          title: responseData.title || title,
          status
        };

        setBoard(prev => ({
          ...prev,
          [status]: [...prev[status], newTask]
        }));

        setInputs(prev => ({ ...prev, [status]: "" }));
      })
      .catch(err => console.error("Error creating task:", err));
  }

  function deleteTask(taskId: string, status: keyof Board) {
    setBoard(prev => ({
      ...prev,
      [status]: prev[status].filter(task => task.id !== taskId)
    }));

    fetch(`http://127.0.0.1:8000/tasks/${taskId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    }).catch(err => console.error("Error deleting task:", err));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.data.current?.column as keyof Board;

    if (!newStatus) return;

    let movedTask: Task | undefined;

    const newBoard: Board = {
      todo: [...board.todo],
      in_progress: [...board.in_progress],
      done: [...board.done]
    };

    for (const column of Object.keys(newBoard) as (keyof Board)[]) {
      const index = newBoard[column].findIndex(
        t => String(t.id) === String(taskId)
      );

      if (index !== -1) {
        movedTask = newBoard[column][index];
        newBoard[column].splice(index, 1);
        break;
      }
    }

    if (!movedTask) return;

    movedTask = { ...movedTask, status: newStatus };
    newBoard[newStatus].push(movedTask);

    setBoard(newBoard);

    fetch(`http://127.0.0.1:8000/tasks/${taskId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({
        status: newStatus
      })
    }).then(async res => {
      if (!res.ok) {
        console.error("PATCH error:", await res.text());
      }
    });
  }

  return (
    <div style={pageStyle}>
      <h1 style={{ marginBottom: 30, textAlign: "center" }}>Task Board</h1>

      <DndContext onDragEnd={handleDragEnd}>
        <div style={boardStyle}>
          <Column
            id="todo"
            title="TO DO"
            tasks={board.todo}
            color="#fca5a5"
            input={inputs.todo}
            setInput={(v: string) =>
              setInputs(prev => ({ ...prev, todo: v }))
            }
            createTask={() => createTask("todo")}
            setTaskToDelete={setTaskToDelete}
          />

          <Column
            id="in_progress"
            title="IN PROGRESS"
            tasks={board.in_progress}
            color="#fde68a"
            input={inputs.in_progress}
            setInput={(v: string) =>
              setInputs(prev => ({ ...prev, in_progress: v }))
            }
            createTask={() => createTask("in_progress")}
            setTaskToDelete={setTaskToDelete}
          />

          <Column
            id="done"
            title="DONE"
            tasks={board.done}
            color="#86efac"
            input={inputs.done}
            setInput={(v: string) =>
              setInputs(prev => ({ ...prev, done: v }))
            }
            createTask={() => createTask("done")}
            setTaskToDelete={setTaskToDelete}
          />
        </div>
      </DndContext>

      {taskToDelete && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <h3 style={modalTitleStyle}>Delete task?</h3>
            <p style={modalTextStyle}>
              Are you sure you want to delete "{taskToDelete.title}"?
            </p>

            <div style={modalButtonRowStyle}>
              <button
                style={cancelButtonStyle}
                onClick={() => setTaskToDelete(null)}
              >
                Cancel
              </button>

              <button
                style={confirmDeleteButtonStyle}
                onClick={() => {
                  deleteTask(taskToDelete.taskId, taskToDelete.status);
                  setTaskToDelete(null);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface ColumnProps {
  id: keyof Board;
  title: string;
  tasks: Task[];
  color: string;
  input: string;
  setInput: (value: string) => void;
  createTask: () => void;
  setTaskToDelete: (task: PendingDelete | null) => void;
}

function Column({
  id,
  title,
  tasks,
  color,
  input,
  setInput,
  createTask,
  setTaskToDelete
}: ColumnProps) {
  const { setNodeRef } = useDroppable({
    id,
    data: { column: id }
  });

  return (
    <div ref={setNodeRef} style={{ ...columnStyle, background: color }}>
      <h3 style={columnTitleStyle}>{title}</h3>

      <div style={addTaskContainer}>
        <input
          style={inputStyle}
          value={input}
          placeholder="Add note..."
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter") {
              createTask();
            }
          }}
        />

        <button style={addButtonStyle} onClick={createTask}>
          +
        </button>
      </div>

      <div style={stackContainer}>
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onDelete={() =>
              setTaskToDelete({
                taskId: task.id,
                status: id,
                title: task.title
              })
            }
          />
        ))}
      </div>
    </div>
  );
}

function TaskCard({
  task,
  onDelete
}: {
  task: Task;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id
  });

  const style: CSSProperties = {
    ...cardStyle,
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined
  };

  return (
    <div ref={setNodeRef} {...listeners} {...attributes} style={style}>
      <span>{task.title}</span>
      <button
        style={deleteButtonStyle}
        onPointerDown={e => e.stopPropagation()}
        onClick={e => {
          e.stopPropagation();
          onDelete();
        }}
      >
        ✕
      </button>
    </div>
  );
}

const pageStyle: CSSProperties = {
  color: "white",
  padding: 40,
  background: "#0f172a",
  minHeight: "100vh"
};

const boardStyle: CSSProperties = {
  display: "flex",
  gap: 30
};

const columnStyle: CSSProperties = {
  flex: 1,
  padding: 20,
  borderRadius: 14,
  minHeight: 450
};

const columnTitleStyle: CSSProperties = {
  color: "#111",
  fontWeight: 700,
  letterSpacing: "0.5px"
};

const stackContainer: CSSProperties = {
  marginTop: 20,
  display: "flex",
  flexDirection: "column",
  gap: 12
};

const cardStyle: CSSProperties = {
  background: "white",
  padding: 14,
  borderRadius: 8,
  color: "#111",
  fontWeight: 500,
  boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
  cursor: "grab",
  touchAction: "none",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
};

const addTaskContainer: CSSProperties = {
  display: "flex",
  gap: 6,
  marginTop: 10
};

const inputStyle: CSSProperties = {
  flex: 1,
  padding: 8,
  borderRadius: 6,
  border: "none",
  outline: "none",
  color: "#111",
  background: "white"
};

const addButtonStyle: CSSProperties = {
  padding: "6px 10px",
  borderRadius: 6,
  border: "none",
  cursor: "pointer",
  background: "#111",
  color: "white"
};

const deleteButtonStyle: CSSProperties = {
  background: "transparent",
  border: "none",
  color: "#999",
  cursor: "pointer",
  fontSize: "16px",
  padding: "4px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const modalOverlayStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0, 0, 0, 0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000
};

const modalStyle: CSSProperties = {
  background: "white",
  borderRadius: 16,
  padding: 24,
  width: "90%",
  maxWidth: 400,
  boxShadow: "0 10px 30px rgba(0,0,0,0.25)"
};

const modalTitleStyle: CSSProperties = {
  marginTop: 0,
  marginBottom: 10,
  color: "#111"
};

const modalTextStyle: CSSProperties = {
  color: "#444",
  marginBottom: 20
};

const modalButtonRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 12
};

const cancelButtonStyle: CSSProperties = {
  padding: "8px 16px",
  borderRadius: 8,
  border: "1px solid #ccc",
  background: "white",
  color: "#111",
  cursor: "pointer"
};

const confirmDeleteButtonStyle: CSSProperties = {
  padding: "8px 16px",
  borderRadius: 8,
  border: "none",
  background: "#dc2626",
  color: "white",
  cursor: "pointer"
}; */
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { JSX, CSSProperties } from "react";
import { DndContext, useDraggable, useDroppable, type DragEndEvent } from "@dnd-kit/core";
import SidebarLayout from "../components/SidebarLayout";
import { useTheme } from "./ThemeContext";

interface Task {
  id: string;
  title: string;
  status: "todo" | "in_progress" | "done";
  assignee_id: string | null;
}

interface Member {
  user_id: string;
  name: string;
  email: string;
  role: string;
}

interface Board {
  todo: Task[];
  in_progress: Task[];
  done: Task[];
}

interface PendingDelete {
  taskId: string;
  status: keyof Board;
  title: string;
}

const API = "http://127.0.0.1:8000";

function authHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem("token")}` };
}

export default function ToDoPage(): JSX.Element {
  const { projectId } = useParams();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [board, setBoard] = useState<Board>({ todo: [], in_progress: [], done: [] });
  const [inputs, setInputs] = useState({ todo: "", in_progress: "", done: "" });
  const [assignees, setAssignees] = useState<Record<string, string>>({ todo: "", in_progress: "", done: "" });
  const [storyId, setStoryId] = useState<string | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<PendingDelete | null>(null);
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    if (!projectId) return;
    fetch(`${API}/projects/${projectId}/board`, { headers: authHeaders() })
      .then(r => r.json())
      .then(data => {
        setStoryId(data.story_id);
        setBoard({ todo: data.todo, in_progress: data.in_progress, done: data.done });
      })
      .catch(err => console.error("Error fetching board:", err));
  }, [projectId]);

  useEffect(() => {
    if (!projectId) return;
    fetch(`${API}/projects/${projectId}/members`, { headers: authHeaders() })
      .then(r => r.ok ? r.json() : [])
      .then(data => setMembers(Array.isArray(data) ? data : []))
      .catch(() => setMembers([]));
  }, [projectId]);

  function createTask(status: keyof Board) {
    const title = inputs[status].trim();
    if (!title || !projectId || !storyId) return;
    const assignee_id = assignees[status] || null;

    fetch(`${API}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ title, description: "", story_id: storyId, status, assignee_id }),
    })
      .then(r => r.json())
      .then(data => {
        setBoard(prev => ({
          ...prev,
          [status]: [...prev[status], { id: data.id, title: data.title || title, status, assignee_id: data.assignee_id }]
        }));
        setInputs(prev => ({ ...prev, [status]: "" }));
        setAssignees(prev => ({ ...prev, [status]: "" }));
      })
      .catch(err => console.error("Error creating task:", err));
  }

  function deleteTask(taskId: string, status: keyof Board) {
    setBoard(prev => ({ ...prev, [status]: prev[status].filter(t => t.id !== taskId) }));
    fetch(`${API}/tasks/${taskId}`, { method: "DELETE", headers: authHeaders() })
      .catch(err => console.error("Error deleting task:", err));
  }

  function reassignTask(taskId: string, newAssigneeId: string | null) {
    setBoard(prev => {
      const updated = { ...prev };
      for (const col of Object.keys(updated) as (keyof Board)[]) {
        updated[col] = updated[col].map(t =>
          t.id === taskId ? { ...t, assignee_id: newAssigneeId } : t
        );
      }
      return updated;
    });

    fetch(`${API}/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ assignee_id: newAssigneeId }),
    }).catch(err => console.error("Reassign error:", err));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const taskId = active.id as string;
    const newStatus = over.data.current?.column as keyof Board;
    if (!newStatus) return;

    const newBoard: Board = {
      todo: [...board.todo],
      in_progress: [...board.in_progress],
      done: [...board.done]
    };
    let movedTask: Task | undefined;

    for (const col of Object.keys(newBoard) as (keyof Board)[]) {
      const idx = newBoard[col].findIndex(t => String(t.id) === String(taskId));
      if (idx !== -1) {
        movedTask = newBoard[col][idx];
        newBoard[col].splice(idx, 1);
        break;
      }
    }
    if (!movedTask) return;

    movedTask = { ...movedTask, status: newStatus };
    newBoard[newStatus].push(movedTask);
    setBoard(newBoard);

    fetch(`${API}/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ status: newStatus }),
    }).catch(err => console.error("PATCH error:", err));
  }

  function getMemberName(userId: string | null): string {
    if (!userId) return "";
    const m = members.find(m => m.user_id === userId);
    return m ? (m.name || m.email) : "";
  }

  return (
    <SidebarLayout>
      <div
        style={{
          ...pageStyle,
          background: isDark ? "#0b0f17" : "#f8fafc",
          color: isDark ? "white" : "#111827",
        }}
      >
        <h1 style={{ marginBottom: 30, textAlign: "left" }}>Task Board</h1>
        <p>Track, assign, and move tasks across your sprint board.</p>
        <p>Drag cards into designated columns to keep your team's work organized and moving forward.</p>

        <DndContext onDragEnd={handleDragEnd}>
          <div style={boardStyle}>
            {(["todo", "in_progress", "done"] as (keyof Board)[]).map(col => (
              <Column
                key={col}
                id={col}
                title={col === "todo" ? "TO DO" : col === "in_progress" ? "IN PROGRESS" : "DONE"}
                tasks={board[col]}
                color={col === "todo" ? "#fca5a5" : col === "in_progress" ? "#fde68a" : "#86efac"}
                input={inputs[col]}
                assigneeId={assignees[col]}
                members={members}
                isDark={isDark}
                setInput={v => setInputs(prev => ({ ...prev, [col]: v }))}
                setAssigneeId={v => setAssignees(prev => ({ ...prev, [col]: v }))}
                createTask={() => createTask(col)}
                setTaskToDelete={setTaskToDelete}
                getMemberName={getMemberName}
                onReassign={reassignTask}
              />
            ))}
          </div>
        </DndContext>

        {taskToDelete && (
          <div style={modalOverlayStyle}>
            <div
              style={{
                ...modalStyle,
                background: isDark ? modalStyle.background : "#ffffff",
                border: isDark ? modalStyle.border : "1px solid rgba(0,0,0,0.08)",
                boxShadow: isDark ? modalStyle.boxShadow : "0 10px 30px rgba(0,0,0,0.12)",
              }}
            >
              <h3 style={{ ...modalTitleStyle, color: isDark ? "white" : "#111827" }}>Delete task?</h3>
              <p style={{ ...modalTextStyle, color: isDark ? "rgba(255,255,255,0.85)" : "#4b5563" }}>
                Are you sure you want to delete "{taskToDelete.title}"?
              </p>
              <div style={modalButtonRowStyle}>
                <button
                  style={{
                    ...cancelButtonStyle,
                    background: isDark ? cancelButtonStyle.background : "#f3f4f6",
                    border: isDark ? cancelButtonStyle.border : "1px solid rgba(0,0,0,0.08)",
                    color: isDark ? "white" : "#111827",
                  }}
                  onClick={() => setTaskToDelete(null)}
                >
                  Cancel
                </button>
                <button
                  style={confirmDeleteButtonStyle}
                  onClick={() => {
                    deleteTask(taskToDelete.taskId, taskToDelete.status);
                    setTaskToDelete(null);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}

interface ColumnProps {
  id: keyof Board;
  title: string;
  tasks: Task[];
  color: string;
  input: string;
  assigneeId: string;
  members: Member[];
  isDark: boolean;
  setInput: (v: string) => void;
  setAssigneeId: (v: string) => void;
  createTask: () => void;
  setTaskToDelete: (t: PendingDelete | null) => void;
  getMemberName: (id: string | null) => string;
  onReassign: (taskId: string, newAssigneeId: string | null) => void;
}

function Column({ id, title, tasks, color, input, assigneeId, members, isDark, setInput, setAssigneeId, createTask, setTaskToDelete, getMemberName, onReassign }: ColumnProps) {
  const { setNodeRef } = useDroppable({ id, data: { column: id } });

  return (
    <div
      ref={setNodeRef}
      style={{
        ...columnStyle,
        background: isDark ? "rgba(255,255,255,0.12)" : "#ffffff",
        border: isDark
          ? "1px solid rgba(255,255,255,0.18)"
          : "1px solid rgba(0,0,0,0.08)",
        boxShadow: isDark
          ? "0 8px 32px rgba(0, 0, 0, 0.25)"
          : "0 8px 24px rgba(0,0,0,0.08)",
        borderTop: `4px solid ${color}`,
      }}
    >
      <h3 style={{ ...columnTitleStyle, color: isDark ? "white" : "#111827" }}>{title}</h3>

      {members.length > 0 && (
        <select
          value={assigneeId}
          onChange={e => setAssigneeId(e.target.value)}
          style={{
            ...assigneeSelectStyle,
            background: isDark ? "rgba(255, 255, 255, 0.14)" : "#f9fafb",
            color: isDark ? "white" : "#111827",
            border: isDark
              ? "1px solid rgba(255,255,255,0.18)"
              : "1px solid rgba(0,0,0,0.08)",
          }}
        >
          <option value="">Assign to... </option>
          {members.map(m => (
            <option key={m.user_id} value={m.user_id}>
              {m.name || m.email} — {m.role}
            </option>
          ))}
        </select>
      )}

      <div style={addTaskContainer}>
        <input
          style={{
            ...inputStyle,
            background: isDark ? "rgba(255,255,255,0.14)" : "#f9fafb",
            color: isDark ? "white" : "#111827",
            border: isDark
              ? "1px solid rgba(255,255,255,0.18)"
              : "1px solid rgba(0,0,0,0.08)",
          }}
          value={input}
          placeholder="Add task..."
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") createTask(); }}
        />
        <button
          style={{
            ...addButtonStyle,
            background: isDark ? "rgba(255,255,255,0.14)" : "#f3f4f6",
            color: isDark ? "white" : "#111827",
            border: isDark
              ? "1px solid rgba(255,255,255,0.18)"
              : "1px solid rgba(0,0,0,0.08)",
          }}
          onClick={createTask}
        >
          +
        </button>
      </div>

      <div style={stackContainer}>
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            assigneeName={getMemberName(task.assignee_id)}
            members={members}
            isDark={isDark}
            onDelete={() => setTaskToDelete({ taskId: task.id, status: id, title: task.title })}
            onReassign={onReassign}
          />
        ))}
      </div>
    </div>
  );
}

function TaskCard({
  task,
  assigneeName,
  members,
  isDark,
  onDelete,
  onReassign,
}: {
  task: Task;
  assigneeName: string;
  members: Member[];
  isDark: boolean;
  onDelete: () => void;
  onReassign: (taskId: string, newAssigneeId: string | null) => void;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: task.id });
  const [showReassign, setShowReassign] = useState(false);

  function handleReassign(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value;
    onReassign(task.id, val === "" ? null : val);
    setShowReassign(false);
  }

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        ...cardStyle,
        background: isDark ? "rgba(255, 255, 255, 0.18)" : "#ffffff",
        border: isDark
          ? "1px solid rgba(255, 255, 255, 0.2)"
          : "1px solid rgba(0,0,0,0.08)",
        boxShadow: isDark
          ? "0 6px 20px rgba(0,0,0,0.18)"
          : "0 4px 12px rgba(0,0,0,0.08)",
        color: isDark ? "white" : "#111827",
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 500, color: isDark ? "white" : "#111827" }}>{task.title}</div>

        <div
          onPointerDown={e => e.stopPropagation()}
          style={{ marginTop: 6 }}
        >
          {!showReassign ? (
            <button
              onClick={e => { e.stopPropagation(); setShowReassign(true); }}
              style={{
                background: assigneeName
                  ? (isDark ? "rgba(127,119,221,0.12)" : "rgba(127,119,221,0.10)")
                  : (isDark ? "rgba(0,0,0,0.06)" : "#f3f4f6"),
                border: "1px dashed " + (assigneeName ? (isDark ? "white" : "#6d28d9") : (isDark ? "#ccc" : "#d1d5db")),
                borderRadius: 6,
                padding: "3px 8px",
                fontSize: 11,
                color: assigneeName
                  ? (isDark ? "white" : "#6d28d9")
                  : (isDark ? "#888" : "#6b7280"),
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <span>👤</span>
              {assigneeName || "Assign"}
              <span style={{ opacity: 0.5, fontSize: 10 }}>✏️</span>
            </button>
          ) : (
            <select
              autoFocus
              value={task.assignee_id ?? ""}
              onChange={handleReassign}
              onBlur={() => setShowReassign(false)}
              style={{
                width: "100%",
                padding: "4px 8px",
                borderRadius: 6,
                border: isDark ? "1px solid #afa9ec" : "1px solid #c4b5fd",
                fontSize: 12,
                color: isDark ? "white" : "#111827",
                background: isDark ? "rgba(255,255,255,0.14)" : "#ffffff",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                outline: "none",
              }}
            >
              <option value="">— Unassign —</option>
              {members.map(m => (
                <option key={m.user_id} value={m.user_id}>
                  {m.name || m.email}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <button
        style={{
          ...deleteButtonStyle,
          color: isDark ? "rgba(255,255,255,0.7)" : "#6b7280",
        }}
        onPointerDown={e => e.stopPropagation()}
        onClick={e => { e.stopPropagation(); onDelete(); }}
      >
        ✕
      </button>
    </div>
  );
}

const pageStyle: CSSProperties = {
  color: "white",
  padding: 40,
  minHeight: "100vh",
  background: "#0b0f17",
};

const boardStyle: CSSProperties = {
  display: "flex",
  gap: 30,
  marginTop: 24,
  alignItems: "stretch",
};

const columnStyle: CSSProperties = {
  flex: 1,
  padding: 20,
  borderRadius: 20,
  minHeight: 450,
  background: "rgba(255, 255, 255, 0.12)",
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",
  border: "1px solid rgba(255, 255, 255, 0.18)",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.25)",
};

const columnTitleStyle: CSSProperties = {
  color: "white",
  fontWeight: 700,
  letterSpacing: "0.5px",
  marginBottom: 8,
};

const stackContainer: CSSProperties = {
  marginTop: 12,
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const cardStyle: CSSProperties = {
  background: "rgba(255, 255, 255, 0.18)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  padding: 14,
  borderRadius: 14,
  color: "white",
  boxShadow: "0 6px 20px rgba(0,0,0,0.18)",
  cursor: "grab",
  touchAction: "none",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 8,
};

const addTaskContainer: CSSProperties = {
  display: "flex",
  gap: 6,
  marginTop: 8,
};

const inputStyle: CSSProperties = {
  flex: 1,
  padding: 8,
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.18)",
  outline: "none",
  color: "white",
  background: "rgba(255,255,255,0.14)",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
};

const addButtonStyle: CSSProperties = {
  padding: "6px 10px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.18)",
  cursor: "pointer",
  background: "rgba(255,255,255,0.14)",
  color: "white",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
};

const assigneeSelectStyle: CSSProperties = {
  width: "100%",
  marginTop: 10,
  padding: "7px 10px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.18)",
  outline: "none",
  fontSize: 13,
  color: "white",
  background: "rgba(255, 255, 255, 0.14)",
  cursor: "pointer",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
};

const deleteButtonStyle: CSSProperties = {
  background: "transparent",
  border: "none",
  color: "rgba(255,255,255,0.7)",
  cursor: "pointer",
  fontSize: "16px",
  padding: "2px",
  flexShrink: 0,
};

const modalOverlayStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
  backdropFilter: "blur(6px)",
  WebkitBackdropFilter: "blur(6px)",
};

const modalStyle: CSSProperties = {
  background: "rgba(255,255,255,0.16)",
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",
  border: "1px solid rgba(255,255,255,0.18)",
  borderRadius: 16,
  padding: 24,
  width: "90%",
  maxWidth: 400,
  boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
};

const modalTitleStyle: CSSProperties = {
  marginTop: 0,
  marginBottom: 10,
  color: "white",
};

const modalTextStyle: CSSProperties = {
  color: "rgba(255,255,255,0.85)",
  marginBottom: 20,
};

const modalButtonRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 12,
};

const cancelButtonStyle: CSSProperties = {
  padding: "8px 16px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.18)",
  background: "rgba(255,255,255,0.12)",
  color: "white",
  cursor: "pointer",
};

const confirmDeleteButtonStyle: CSSProperties = {
  padding: "8px 16px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(220,38,38,0.75)",
  color: "white",
  cursor: "pointer",
};