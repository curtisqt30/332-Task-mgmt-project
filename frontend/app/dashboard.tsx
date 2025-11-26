import { useCallback, useEffect, useState } from "react";
import DashboardScreen from "@/components/DashboardScreen";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import type { Task } from "@/components/types";

const API = process.env.EXPO_PUBLIC_API_BASE ?? "http://localhost:8000";

export default function PersonalDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user]);

  // Load tasks
  const load = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/tasks`, { credentials: "include" });
      if (!r.ok) {
        if (r.status === 401) {
          router.replace("/login");
          return;
        }
        throw new Error("Failed to fetch");
      }
      const data = await r.json();
      setTasks(data.map((t: any) => ({ id: t.id, title: t.title, status: t.status, description: t.description ?? null, due: t.due ?? null, category: t.category ?? null, assignees: t.assignees ?? [] })));
    } catch (error) {
      console.error("Error loading tasks:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) load();
  }, [load, user]);

  const onAddTask = async (title: string, description?: string | null, due?: string | null) => {
    if (!user) return;
    
    const body: any = { title };
    if (description) body.description = description;
    if (due) body.due = due;
    
    try {
      const response = await fetch(`${API}/api/tasks`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
      });
      
      if (response.status === 401) {
        router.replace("/login");
        return;
      }
      if (!response.ok) throw new Error("Failed");
      load();
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const cycle = (s: Task["status"]): Task["status"] =>
    s === "Pending" ? "In Progress" : s === "In Progress" ? "Completed" : "Pending";

  const onSelectTask = async (taskId: Task["id"]) => {
    if (!user) return;
    
    const cur = tasks.find((t) => t.id === taskId);
    if (!cur) return;
    const next = cycle(cur.status);

    setTasks((ts) => ts.map((t) => (t.id === taskId ? { ...t, status: next } : t)));
    try {
      const response = await fetch(`${API}/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: next }),
        credentials: "include",
      });
      
      if (response.status === 401) {
        router.replace("/login");
        return;
      }
      if (!response.ok) throw new Error("Failed");
    } catch (error) {
      console.error("Error updating:", error);
      setTasks((ts) => ts.map((t) => (t.id === taskId ? { ...t, status: cur.status } : t)));
    }
  };

  const onEditTask = async (taskId: Task["id"], patch: Partial<Task>) => {
    if (!user) return;
    
    const prev = tasks;
    setTasks((ts) => ts.map((t) => (t.id === taskId ? { ...t, ...patch } : t)));

    const body: any = {};
    if (patch.title !== undefined) body.title = patch.title;
    if (patch.description !== undefined) body.description = patch.description;
    if (patch.due !== undefined) body.due = patch.due;
    if (patch.status !== undefined) body.status = patch.status;
    if (patch.category !== undefined) body.category = patch.category;

    try {
      const r = await fetch(`${API}/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
      });
      
      if (r.status === 401) {
        router.replace("/login");
        return;
      }
      if (!r.ok) throw new Error("Failed");
    } catch (e) {
      console.error(e);
      setTasks(prev);
    }
  };

  const onDeleteTask = async (taskId: Task["id"]) => {
    if (!user) return;
    
    const prev = tasks;
    setTasks((ts) => ts.filter((t) => t.id !== taskId));
    try {
      const res = await fetch(`${API}/api/tasks/${taskId}`, { method: "DELETE", credentials: "include" });
      
      if (res.status === 401) {
        router.replace("/login");
        return;
      }
      if (!res.ok && res.status !== 204) throw new Error("Failed");
    } catch (error) {
      console.error("Error deleting:", error);
      setTasks(prev);
    }
  };

  if (authLoading || !user) {
    return null;
  }

  const userInitials = user.userName.substring(0, 2).toUpperCase();

  return (
    <DashboardScreen
      mode="personal"
      tasks={tasks}
      loading={loading}
      onAddTask={onAddTask}
      onSelectTask={onSelectTask}
      onEditTask={onEditTask}
      onDeleteTask={onDeleteTask}
      currentUserInitials={userInitials}
      currentUserName={user.userName}
      titleOverride="My Tasks"
      teams={[]}
    />
  );
}