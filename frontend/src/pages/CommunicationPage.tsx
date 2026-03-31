import { useState } from "react";
import type { JSX, CSSProperties } from "react";
import { motion } from "framer-motion";
import SidebarLayout from "../components/SidebarLayout";
import {
  DndContext,
  useDraggable,
  useDroppable,
  type DragEndEvent,
} from "@dnd-kit/core";
import { useTheme } from "./ThemeContext";

interface CommCard {
  id: string;
  title: string;
  status: "announcements" | "available_tasks" | "blocked";
}

interface CommBoard {
  announcements: CommCard[];
  available_tasks: CommCard[];
  blocked: CommCard[];
}

export default function CommunicationPage(): JSX.Element {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [board, setBoard] = useState<CommBoard>({
    announcements: [
      { id: "1", title: "Sprint planning meeting Friday at 2 PM", status: "announcements" },
      { id: "2", title: "Reminder: update task owners before standup", status: "announcements" },
    ],
    available_tasks: [
      { id: "3", title: "Set up login page validation", status: "available_tasks" },
      { id: "4", title: "Connect dashboard project selector to backend", status: "available_tasks" },
    ],
    blocked: [
      { id: "5", title: "Waiting on API endpoint for notifications", status: "blocked" },
    ],
  });

  const [inputs, setInputs] = useState({
    announcements: "",
    available_tasks: "",
    blocked: "",
  });

  function createCard(status: keyof CommBoard) {
    const title = inputs[status].trim();
    if (!title) return;

    const newCard: CommCard = {
      id: crypto.randomUUID(),
      title,
      status,
    };

    setBoard((prev) => ({
      ...prev,
      [status]: [...prev[status], newCard],
    }));

    setInputs((prev) => ({
      ...prev,
      [status]: "",
    }));
  }

  function deleteCard(cardId: string, status: keyof CommBoard) {
    setBoard((prev) => ({
      ...prev,
      [status]: prev[status].filter((card) => card.id !== cardId),
    }));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const cardId = String(active.id);
    const newStatus = over.data.current?.column as keyof CommBoard;
    if (!newStatus) return;

    let movedCard: CommCard | undefined;

    const newBoard: CommBoard = {
      announcements: [...board.announcements],
      available_tasks: [...board.available_tasks],
      blocked: [...board.blocked],
    };

    for (const column of Object.keys(newBoard) as (keyof CommBoard)[]) {
      const index = newBoard[column].findIndex((card) => card.id === cardId);
      if (index !== -1) {
        movedCard = newBoard[column][index];
        newBoard[column].splice(index, 1);
        break;
      }
    }

    if (!movedCard) return;

    movedCard = { ...movedCard, status: newStatus };
    newBoard[newStatus].push(movedCard);
    setBoard(newBoard);
  }

  return (
    <SidebarLayout>
      <div
        style={{
          ...pageStyle,
          background: isDark
            ? "radial-gradient(circle at top left, rgba(124,58,237,0.20), transparent 24%), radial-gradient(circle at top right, rgba(59,130,246,0.16), transparent 24%), linear-gradient(180deg, #0b0f17 0%, #111827 100%)"
            : "#f8fafc",
          color: isDark ? "white" : "#111827",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{
            ...heroCardStyle,
            background: isDark ? heroCardStyle.background : "#ffffff",
            border: isDark
              ? heroCardStyle.border
              : "1px solid rgba(17,24,39,0.08)",
            boxShadow: isDark
              ? heroCardStyle.boxShadow
              : "0 14px 40px rgba(15,23,42,0.08)",
          }}
        >
          <p style={eyebrowStyle}>Team Communication</p>
          <h1
            style={{
              ...headingStyle,
              color: isDark ? "white" : "#111827",
            }}
          >
            Communication Hub
          </h1>
          <div style={introStyle}>
            <p
              style={{
                ...subtitleStyle,
                color: isDark ? "white" : "#4b5563",
              }}
            >
              Information Radiator / Kanban Board
            </p>
            <p
              style={{
                ...bodyTextStyle,
                color: isDark ? bodyTextStyle.color : "#4b5563",
              }}
            >
              This is where the Information Radiator and Kanban Board will live.
            </p>
            <p
              style={{
                ...bodyTextStyle,
                color: isDark ? bodyTextStyle.color : "#4b5563",
              }}
            >
              It functions as a message board displaying available tasks sourced from
              the Product Backlog, plus announcements and blockers the team should see.
            </p>
          </div>
        </motion.div>

        <DndContext onDragEnd={handleDragEnd}>
          <div style={boardStyle}>
            <Column
              id="announcements"
              title="ANNOUNCEMENTS"
              tasks={board.announcements}
              color="#93c5fd"
              input={inputs.announcements}
              setInput={(value: string) =>
                setInputs((prev) => ({ ...prev, announcements: value }))
              }
              createTask={() => createCard("announcements")}
              deleteTask={deleteCard}
            />

            <Column
              id="available_tasks"
              title="AVAILABLE TASKS"
              tasks={board.available_tasks}
              color="#86efac"
              input={inputs.available_tasks}
              setInput={(value: string) =>
                setInputs((prev) => ({ ...prev, available_tasks: value }))
              }
              createTask={() => createCard("available_tasks")}
              deleteTask={deleteCard}
            />

            <Column
              id="blocked"
              title="BLOCKED / NEEDS ATTENTION"
              tasks={board.blocked}
              color="#fca5a5"
              input={inputs.blocked}
              setInput={(value: string) =>
                setInputs((prev) => ({ ...prev, blocked: value }))
              }
              createTask={() => createCard("blocked")}
              deleteTask={deleteCard}
            />
          </div>
        </DndContext>
      </div>
    </SidebarLayout>
  );
}

function Column({
  id,
  title,
  tasks,
  color,
  input,
  setInput,
  createTask,
  deleteTask,
}: {
  id: string;
  title: string;
  tasks: CommCard[];
  color: string;
  input: string;
  setInput: (value: string) => void;
  createTask: () => void;
  deleteTask: (cardId: string, status: keyof CommBoard) => void;
}): JSX.Element {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const { setNodeRef } = useDroppable({
    id,
    data: { column: id },
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        ...columnStyle,
        background: isDark ? columnStyle.background : "#ffffff",
        border: isDark
          ? columnStyle.border
          : "1px solid rgba(17,24,39,0.08)",
        boxShadow: isDark
          ? columnStyle.boxShadow
          : "0 10px 30px rgba(15,23,42,0.08)",
        borderTop: `4px solid ${color}`,
      }}
    >
      <div style={columnHeaderStyle}>
        <h3
          style={{
            ...columnTitleStyle,
            color: isDark ? "white" : "#111827",
          }}
        >
          {title}
        </h3>
        <span
          style={{
            ...columnCountStyle,
            borderColor: color,
            color: isDark ? "white" : "#111827",
            background: isDark ? columnCountStyle.background : "#f3f4f6",
          }}
        >
          {tasks.length}
        </span>
      </div>

      <div style={addCardContainer}>
        <input
          style={{
            ...inputStyle,
            color: isDark ? "white" : "#111827",
            background: isDark ? inputStyle.background : "#f3f4f6",
            border: isDark
              ? inputStyle.border
              : "1px solid rgba(17,24,39,0.08)",
          }}
          value={input}
          placeholder="Add card..."
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") createTask();
          }}
        />
        <button
          style={{
            ...addButtonStyle,
            background: isDark ? addButtonStyle.background : "#ffffff",
            color: isDark ? "white" : "#111827",
            border: isDark
              ? addButtonStyle.border
              : "1px solid rgba(17,24,39,0.08)",
          }}
          onClick={createTask}
        >
          +
        </button>
      </div>

      <div style={stackContainer}>
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onDelete={() => deleteTask(task.id, id as keyof CommBoard)}
          />
        ))}
      </div>
    </div>
  );
}

function TaskCard({
  task,
  onDelete,
}: {
  task: CommCard;
  onDelete: () => void;
}): JSX.Element {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
  });

  const style: CSSProperties = {
    ...cardStyle,
    background: isDark ? cardStyle.background : "#ffffff",
    color: isDark ? "white" : "#111827",
    border: isDark
      ? cardStyle.border
      : "1px solid rgba(17,24,39,0.08)",
    boxShadow: isDark
      ? cardStyle.boxShadow
      : "0 6px 20px rgba(15,23,42,0.06)",
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
  };

  return (
    <div ref={setNodeRef} {...listeners} {...attributes} style={style}>
      <div style={cardTextWrapStyle}>
        <span style={cardTitleStyle}>{task.title}</span>
      </div>
      <button
        style={{
          ...deleteButtonStyle,
          color: isDark ? deleteButtonStyle.color : "#6b7280",
        }}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
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
  padding: 36,
  minHeight: "100vh",
  textAlign: "left",
  background:
    "radial-gradient(circle at top left, rgba(124,58,237,0.20), transparent 24%), radial-gradient(circle at top right, rgba(59,130,246,0.16), transparent 24%), linear-gradient(180deg, #0b0f17 0%, #111827 100%)",
};

const heroCardStyle: CSSProperties = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 24,
  padding: "28px 30px",
  marginBottom: 28,
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  boxShadow: "0 14px 40px rgba(0,0,0,0.22)",
};

const eyebrowStyle: CSSProperties = {
  margin: 0,
  marginBottom: 10,
  fontSize: 13,
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#c4b5fd",
};

const headingStyle: CSSProperties = {
  margin: 0,
  marginBottom: 12,
  textAlign: "left",
  fontSize: 36,
  fontWeight: 800,
  lineHeight: 1.1,
};

const introStyle: CSSProperties = {
  textAlign: "left",
  lineHeight: 1.6,
};

const subtitleStyle: CSSProperties = {
  fontWeight: 700,
  fontSize: 18,
  marginBottom: 8,
  color: "white",
};

const bodyTextStyle: CSSProperties = {
  margin: "6px 0",
  color: "rgba(255,255,255,0.82)",
  maxWidth: 820,
};

const boardStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 24,
  alignItems: "start",
  marginTop: 6,
};

const columnStyle: CSSProperties = {
  padding: 20,
  borderRadius: 22,
  minHeight: 520,
  background: "rgba(255,255,255,0.10)",
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",
  border: "1px solid rgba(255,255,255,0.16)",
  boxShadow: "0 10px 30px rgba(0,0,0,0.22)",
};

const columnHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  marginBottom: 12,
};

const columnTitleStyle: CSSProperties = {
  color: "white",
  margin: 0,
  fontWeight: 800,
  letterSpacing: "0.04em",
  fontSize: 15,
};

const columnCountStyle: CSSProperties = {
  minWidth: 28,
  height: 28,
  borderRadius: 999,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 12,
  fontWeight: 700,
  color: "white",
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.14)",
};

const stackContainer: CSSProperties = {
  marginTop: 16,
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const cardStyle: CSSProperties = {
  background: "rgba(255,255,255,0.16)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  padding: 14,
  borderRadius: 16,
  color: "white",
  fontWeight: 500,
  border: "1px solid rgba(255,255,255,0.18)",
  boxShadow: "0 6px 20px rgba(0,0,0,0.16)",
  cursor: "grab",
  touchAction: "none",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 10,
};

const cardTextWrapStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
};

const cardTitleStyle: CSSProperties = {
  display: "block",
  lineHeight: 1.45,
  wordBreak: "break-word",
  fontSize: 14,
};

const addCardContainer: CSSProperties = {
  display: "flex",
  gap: 8,
  marginTop: 10,
};

const inputStyle: CSSProperties = {
  flex: 1,
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.16)",
  outline: "none",
  color: "white",
  background: "rgba(255,255,255,0.12)",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
  fontSize: 14,
};

const addButtonStyle: CSSProperties = {
  width: 42,
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.16)",
  cursor: "pointer",
  background: "rgba(255,255,255,0.14)",
  color: "white",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
  fontSize: 18,
  fontWeight: 700,
};

const deleteButtonStyle: CSSProperties = {
  background: "transparent",
  border: "none",
  color: "rgba(255,255,255,0.72)",
  cursor: "pointer",
  fontSize: 16,
  padding: 4,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};