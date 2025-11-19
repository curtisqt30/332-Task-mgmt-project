import { useCallback, useEffect, useState } from "react";
import DashboardScreen from "@/components/DashboardScreen";
import type { Task } from "@/components/types";

const API = process.env.EXPO_PUBLIC_API_BASE ?? "http://localhost:8000";

export default function PersonalDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // ---- Load tasks (now includes description + due) ----
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/tasks`);
      if (!r.ok) throw new Error("Failed to fetch tasks");
      const data = await r.json();
        setTasks(
          data.map((t: any) => ({
            id: t.id,
            title: t.title,
            status: t.status,
            description: t.description ?? null,
            due: t.due ?? null,       
            category: t.category ?? null,
            assignees: t.assignees ?? [],
          }))
        );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ---- Add task (title only; backend will default status) ----
  const onAddTask = async (title: string) => {
    await fetch(`${API}/api/tasks`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title }),
    });
    load();
  };

  // ---- Cycle status on tap (optimistic) ----
  const cycle = (s: Task["status"]): Task["status"] =>
    s === "Pending" ? "In Progress" : s === "In Progress" ? "Completed" : "Pending";

  const onSelectTask = async (taskId: Task["id"]) => {
    const cur = tasks.find(t => t.id === taskId);
    if (!cur) return;
    const next = cycle(cur.status);

    setTasks(ts => ts.map(t => (t.id === taskId ? { ...t, status: next } : t)));
    try {
      await fetch(`${API}/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
    } catch {
      setTasks(ts => ts.map(t => (t.id === taskId ? { ...t, status: cur.status } : t)));
    }
  };

  // ---- EDIT: title / description / due (partial patch, optimistic) ----
  const onEditTask = async (taskId: Task["id"], patch: Partial<Task>) => {
    const prev = tasks;
    setTasks(ts => ts.map(t => (t.id === taskId ? { ...t, ...patch } : t)));

    // Only send fields the API understands
    const body: any = {};
    if (patch.title !== undefined) body.title = patch.title;
    if (patch.description !== undefined) body.description = patch.description; // string|null
    if (patch.due !== undefined) body.due = patch.due;                         // "YYYY-MM-DD"|null
    if (patch.status !== undefined) body.status = patch.status;
    if (patch.category !== undefined) body.category = patch.category;

    try {
      const r = await fetch(`${API}/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) throw new Error("Update failed");
    } catch (e) {
      console.error(e);
      setTasks(prev); // rollback
    }
  };

  // ---- DELETE (optimistic) ----
  const onDeleteTask = async (taskId: Task["id"]) => {
    const prev = tasks;
    setTasks(ts => ts.filter(t => t.id !== taskId));
    try {
      const res = await fetch(`${API}/api/tasks/${taskId}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) throw new Error("Delete failed");
    } catch {
      setTasks(prev);
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
