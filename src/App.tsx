import React, { useState, useRef, useEffect } from "react";
import "./App.css";

interface Task {
  id: string;
  text: string;
  isCompleted: boolean;
  assignedTo?: string | null;
}

function App() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem("spotlight_tasks");
    return saved ? JSON.parse(saved) : [];
  });

  const [pills, setPills] = useState<string[]>(() => {
    const saved = localStorage.getItem("spotlight_pills");
    return saved ? JSON.parse(saved) : ["School", "Work"];
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const [draggedPill, setDraggedPill] = useState<string | null>(null);
  const [activePill, setActivePill] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem("spotlight_tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("spotlight_pills", JSON.stringify(pills));
  }, [pills]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsExpanded(false);
        setActivePill(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (isExpanded) {
      const timer = setTimeout(() => inputRef.current?.focus(), 400);
      return () => clearTimeout(timer);
    }
  }, [isExpanded]);

  const addTask = () => {
    if (!query.trim()) return;
    const newTask: Task = {
      id: Math.random().toString(36).substring(2, 9),
      text: query,
      isCompleted: false,
      assignedTo: null,
    };
    setTasks((prev) => [newTask, ...prev]);
    setQuery("");
    setIsExpanded(false);
  };

  const handleTaskClick = (id: string) => {
    if (activePill) {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, assignedTo: activePill } : t))
      );
      setActivePill(null);
    } else {
      toggleTask(id);
    }
  };

  const toggleTask = (id: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, isCompleted: !task.isCompleted } : task
      )
    );
    setTimeout(() => {
      setTasks((prev) => prev.filter((t) => t.id !== id || !t.isCompleted));
    }, 2000);
  };

  const deletePill = (e: React.MouseEvent, pillToDelete: string) => {
    e.stopPropagation();
    if (window.confirm(`Delete "${pillToDelete}"?`)) {
      setPills(pills.filter((p) => p !== pillToDelete));
      setTasks((prev) =>
        prev.map((t) =>
          t.assignedTo === pillToDelete ? { ...t, assignedTo: null } : t
        )
      );
    }
  };

  return (
    <div className="app-viewport" onClick={() => setActivePill(null)}>
      <div className="main-container" onClick={(e) => e.stopPropagation()}>
        <div
          className={`spotlight-bar ${isExpanded ? "expanded" : "collapsed"}`}
          onClick={() => !isExpanded && setIsExpanded(true)}
        >
          <div className="trigger-circle">
            <span
              className={`plus-icon ${isExpanded ? "rotated" : ""}`}
              onClick={(e) => {
                if (isExpanded) {
                  e.stopPropagation();
                  setIsExpanded(false);
                }
              }}
            >
              +
            </span>
          </div>
          <div className="input-area">
            <input
              ref={inputRef}
              placeholder="What's the plan?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
            />
          </div>
        </div>

        <div className="list-content">
          <div className="pills-row">
            {pills.map((p) => (
              <div
                key={p}
                className={`pill draggable ${
                  activePill === p ? "active-selection" : ""
                }`}
                draggable
                onDragStart={() => setDraggedPill(p)}
                onClick={(e) => {
                  e.stopPropagation();
                  setActivePill(activePill === p ? null : p);
                }}
              >
                {p}
                <button
                  className="pill-delete-btn"
                  onClick={(e) => deletePill(e, p)}
                >
                  ✕
                </button>
              </div>
            ))}
            <div
              className="pill dashed"
              onClick={() => {
                const name = prompt("Enter assignee name:");
                if (name) setPills([...pills, name]);
              }}
            >
              + Assign
            </div>
          </div>

          <div className="task-list">
            {tasks.map((t) => (
              <div
                key={t.id}
                className={`task-item ${t.isCompleted ? "checked" : ""} ${
                  activePill ? "assign-mode" : ""
                }`}
                onClick={() => handleTaskClick(t.id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (!draggedPill) return;
                  setTasks((prev) =>
                    prev.map((task) =>
                      task.id === t.id
                        ? { ...task, assignedTo: draggedPill }
                        : task
                    )
                  );
                  setDraggedPill(null);
                }}
              >
                <div className="task-row">
                  <span className="task-text">{t.text}</span>
                  {t.assignedTo && (
                    <span className="assignment-tag">{t.assignedTo}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
