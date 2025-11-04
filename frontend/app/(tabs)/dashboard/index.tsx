import { useCallback, useEffect, useState } from "react";
import DashboardScreen from "@/components/DashboardScreen";
import type { Task } from "@/components/types";

const API = process.env.EXPO_PUBLIC_API_BASE ?? "http://localhost:8000";

export default function PersonalDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/tasks`);
      const data = await r.json();
      setTasks(
        data.map((t: any) => ({
          id: t.id,
          title: t.title,
          status: t.status,             // "Pending" | "In Progress" | "Completed" | "Overdue"
          due: t.due ?? undefined,
          category: t.category ?? undefined,
        }))
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onAddTask = async (title: string) => {
    await fetch(`${API}/api/tasks`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title }), // backend defaults status="Pending"
    });
    load();
  };

  const cycle = (s: Task["status"]): Task["status"] =>
    s === "Pending" ? "In Progress" : s === "In Progress" ? "Completed" : "Pending";

  const onSelectTask = async (taskId: Task["id"]) => {
    const cur = tasks.find(t => t.id === taskId);
    if (!cur) return;
    const next = cycle(cur.status);

    // optimistic update
    setTasks(ts => ts.map(t => t.id === taskId ? { ...t, status: next } : t));
    try {
      await fetch(`${API}/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
    } catch {
      // rollback if failed
      setTasks(ts => ts.map(t => t.id === taskId ? { ...t, status: cur.status } : t));
    }
  };

  const onEditTask = async (taskId: Task["id"], title: string) => {
    const prev = tasks.find(t => t.id === taskId);
    if (!prev) return;
    setTasks(ts => ts.map(t => t.id === taskId ? { ...t, title } : t)); // optimistic
    try {
      await fetch(`${API}/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title }),
      });
    } catch {
      setTasks(ts => ts.map(t => t.id === taskId ? { ...t, title: prev.title } : t)); // rollback
    }
  };

  const onDeleteTask = async (taskId: Task["id"]) => {
    const snapshot = tasks;
    setTasks(ts => ts.filter(t => t.id !== taskId)); // optimistic
    try {
      await fetch(`${API}/api/tasks/${taskId}`, { method: "DELETE" });
    } catch {
      setTasks(snapshot); // rollback
    }
  };

  return (
    <DashboardScreen
      mode="personal"
      tasks={tasks}
      loading={loading}
      onAddTask={onAddTask}
      onSelectTask={onSelectTask}
      onEditTask={onEditTask}
      onDeleteTask={onDeleteTask}
      currentUserInitials="CT"
      titleOverride="My Tasks"
    />
  );
}
