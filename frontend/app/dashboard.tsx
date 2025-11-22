import { useCallback, useEffect, useState } from "react";
import DashboardScreen from "@/components/DashboardScreen";
import { getTeams, getMemberships, getUser } from "@/lib/storage";
import type { Task } from "@/components/types";
import type { Team } from "@/lib/storage";

const API = process.env.EXPO_PUBLIC_API_BASE ?? "http://localhost:8000";

export default function PersonalDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState<Team[]>([]);
  const [userTeams, setUserTeams] = useState<Team[]>([]);
  const [userName, setUserName] = useState("User");
  const [userInitials, setUserInitials] = useState("U");

  // Load user info and teams
  useEffect(() => {
    (async () => {
      try {
        // Get user info
        const user = await getUser();
        if (user) {
          setUserName(user.name);
          setUserInitials(user.initials);
        }
        
        // Get all teams and memberships
        const allTeams = await getTeams();
        const memberships = await getMemberships();
        
        // Filter user's teams
        if (user) {
          const userTeamIds = memberships
            .filter(m => m.userId === user.id)
            .map(m => m.teamId);
          const filtered = allTeams.filter(t => userTeamIds.includes(t.id));
          setUserTeams(filtered);
        }
        
        setTeams(allTeams);
      } catch (error) {
        console.error("Error loading user/teams:", error);
      }
    })();
  }, []);

  // Load tasks
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
    } catch (error) {
      console.error("Error loading tasks:", error);
      // Use mock data if API fails
      setTasks([
        {
          id: 1,
          title: "Complete project documentation",
          status: "In Progress",
          description: "Finish writing the technical documentation",
          due: "2025-01-15",
          category: "Documentation",
        },
        {
          id: 2,
          title: "Review pull requests",
          status: "Pending",
          description: null,
          due: "2025-01-10",
          category: "Code Review",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Add task with title, description, and due date
  const onAddTask = async (title: string, description?: string | null, due?: string | null) => {
    const body: any = { title };
    if (description) body.description = description;
    if (due) body.due = due;
    
    try {
      await fetch(`${API}/api/tasks`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      load();
    } catch (error) {
      console.error("Error adding task:", error);
      // Add locally if API fails
      const newTask: Task = {
        id: Date.now(),
        title,
        status: "Pending",
        description: description || null,
        due: due || null,
      };
      setTasks([...tasks, newTask]);
    }
  };

  // Cycle status on tap
  const cycle = (s: Task["status"]): Task["status"] =>
    s === "Pending" ? "In Progress" : s === "In Progress" ? "Completed" : "Pending";

  const onSelectTask = async (taskId: Task["id"]) => {
    const cur = tasks.find((t) => t.id === taskId);
    if (!cur) return;
    const next = cycle(cur.status);

    setTasks((ts) => ts.map((t) => (t.id === taskId ? { ...t, status: next } : t)));
    try {
      await fetch(`${API}/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
    } catch {
      setTasks((ts) => ts.map((t) => (t.id === taskId ? { ...t, status: cur.status } : t)));
    }
  };

  // Edit task
  const onEditTask = async (taskId: Task["id"], patch: Partial<Task>) => {
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
      });
      if (!r.ok) throw new Error("Update failed");
    } catch (e) {
      console.error(e);
      setTasks(prev); // rollback
    }
  };

  // Delete task
  const onDeleteTask = async (taskId: Task["id"]) => {
    const prev = tasks;
    setTasks((ts) => ts.filter((t) => t.id !== taskId));
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
      currentUserInitials={userInitials}
      currentUserName={userName}
      titleOverride="My Tasks"
      teams={userTeams}
    />
  );
}