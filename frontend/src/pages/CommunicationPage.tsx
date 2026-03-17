import { useState } from "react";
import type { JSX, CSSProperties } from "react";
import { motion } from "framer-motion";
import {
  DndContext,
  useDraggable,
  useDroppable,
  type DragEndEvent,
} from "@dnd-kit/core";

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
    <div style={pageStyle}>
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={headingStyle}
      >
        Communication
      </motion.h1>

      <div style={introStyle}>
        <p style={subtitleStyle}>Information Radiator / Kanban Board</p>
        <p>
          This is where the Information Radiator and Kanban Board will live.
        </p>
        <p>
          It functions as a message board displaying available tasks sourced from
          the Product Backlog, plus announcements and blockers the team should see.
        </p>
      </div>

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
  const { setNodeRef } = useDroppable({
    id,
    data: { column: id },
  });

  return (
    <div ref={setNodeRef} style={{ ...columnStyle, background: color }}>
      <h3 style={columnTitleStyle}>{title}</h3>

      <div style={addCardContainer}>
        <input
          style={inputStyle}
          value={input}
          placeholder="Add card..."
          onChange={(e) => setInput(e.target.value)}
        />
        <button style={addButtonStyle} onClick={createTask}>
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
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
  });

  const style: CSSProperties = {
    ...cardStyle,
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
  };

  return (
    <div ref={setNodeRef} {...listeners} {...attributes} style={style}>
      <span>{task.title}</span>
      <button
        style={deleteButtonStyle}
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
  padding: 40,
  background: "#0f172a",
  minHeight: "100vh",
};

const headingStyle: CSSProperties = {
  textAlign: "center",
  marginBottom: 10,
};

const introStyle: CSSProperties = {
  textAlign: "center",
  marginBottom: 30,
  lineHeight: 1.6,
};

const subtitleStyle: CSSProperties = {
  fontWeight: 700,
  fontSize: 18,
  marginBottom: 8,
};

const boardStyle: CSSProperties = {
  display: "flex",
  gap: 24,
  alignItems: "flex-start",
};

const columnStyle: CSSProperties = {
  flex: 1,
  padding: 20,
  borderRadius: 16,
  minHeight: 500,
};

const columnTitleStyle: CSSProperties = {
  color: "#111",
  marginTop: 0,
  marginBottom: 10,
};

const stackContainer: CSSProperties = {
  marginTop: 20,
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const cardStyle: CSSProperties = {
  background: "white",
  padding: 14,
  borderRadius: 10,
  color: "#111",
  fontWeight: 500,
  boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
  cursor: "grab",
  touchAction: "none",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 10,
};

const addCardContainer: CSSProperties = {
  display: "flex",
  gap: 6,
  marginTop: 10,
};

const inputStyle: CSSProperties = {
  flex: 1,
  padding: 8,
  borderRadius: 6,
  border: "none",
  outline: "none",
  color: "#111",
  background: "white",
};

const addButtonStyle: CSSProperties = {
  padding: "6px 10px",
  borderRadius: 6,
  border: "none",
  cursor: "pointer",
  background: "#111",
  color: "white",
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
  justifyContent: "center",
};
