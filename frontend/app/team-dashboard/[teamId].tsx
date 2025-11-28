import { useCallback, useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../../contexts/AuthContext";
import DashboardScreen from "../../components/DashboardScreen";
import type { Task, Assignee } from "../../components/types";

const API = process.env.EXPO_PUBLIC_API_BASE ?? "http://localhost:8000";

type TeamMember = { userID: number; userName: string; role: string };

const stringToColor = (str: string): string => {
  const colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4"];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

export default function TeamDashboard() {
  const router = useRouter();
  const params = useLocalSearchParams<{ teamId?: string }>();
  const teamId = params.teamId;
  
  const { user, loading: authLoading } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamName, setTeamName] = useState("");
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user]);

  const load = useCallback(async () => {
    if (!teamId || !user) return;
    
    setLoading(true);
    try {
      // Load team info and members
      const teamRes = await fetch(`${API}/api/teams/${teamId}`, { credentials: "include" });
      if (teamRes.status === 401) { router.replace("/login"); return; }
      if (teamRes.ok) {
        const teamData = await teamRes.json();
        setTeamName(teamData.teamName);
        setTeamMembers(teamData.members || []);
      }

      // Load team tasks
      const tasksRes = await fetch(`${API}/api/teams/${teamId}/tasks`, { credentials: "include" });
      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        setTasks(tasksData.map((t: any) => ({
          id: t.id,
          title: t.title,
          status: t.status || "Pending",
          description: t.description || null,
          due: t.due || null,
          teamId: teamId,
          assignees: (t.assignees || []).map((a: any) => ({
            id: String(a.userID),
            name: a.userName,
            initials: a.userName.substring(0, 2).toUpperCase(),
            color: stringToColor(a.userName),
          })),
        })));
      }
    } catch (error) {
      console.error("Error loading team data:", error);
    } finally {
      setLoading(false);
    }
  }, [teamId, user]);

  useFocusEffect(
    useCallback(() => {
      if (user && teamId) load();
    }, [user, teamId, load])
  );

  const onAddTask = async (title: string, description?: string | null, due?: string | null) => {
    if (!user || !teamId) return;
    
    try {
      const res = await fetch(`${API}/api/teams/${teamId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, due }),
        credentials: "include",
      });
      if (res.status === 401) { router.replace("/login"); return; }
      if (res.ok) load();
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const onSelectTask = async (taskId: Task["id"]) => {
    if (!user || !teamId) return;
    
    const cur = tasks.find((t) => t.id === taskId);
    if (!cur) return;
    const next = cur.status === "Pending" ? "In Progress" : cur.status === "In Progress" ? "Completed" : "Pending";
    
    setTasks((ts) => ts.map((t) => (t.id === taskId ? { ...t, status: next } : t)));
    
    try {
      await fetch(`${API}/api/teams/${teamId}/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
        credentials: "include",
      });
    } catch (error) {
      console.error("Error updating task:", error);
      load();
    }
  };

  const onEditTask = async (taskId: Task["id"], patch: Partial<Task>) => {
    if (!user || !teamId) return;
    
    const prev = tasks;
    setTasks((ts) => ts.map((t) => (t.id === taskId ? { ...t, ...patch } : t)));
    
    try {
      const res = await fetch(`${API}/api/teams/${teamId}/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed");
    } catch (error) {
      console.error("Error updating task:", error);
      setTasks(prev);
    }
  };

  const onDeleteTask = async (taskId: Task["id"]) => {
    if (!user || !teamId) return;
    
    const prev = tasks;
    setTasks((ts) => ts.filter((t) => t.id !== taskId));
    
    try {
      await fetch(`${API}/api/teams/${teamId}/tasks/${taskId}`, {
        method: "DELETE",
        credentials: "include",
      });
    } catch (error) {
      console.error("Error deleting task:", error);
      setTasks(prev);
    }
  };

  const onAssign = async (taskId: Task["id"], userID: number) => {
    if (!teamId) return;
    try {
      await fetch(`${API}/api/teams/${teamId}/tasks/${taskId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userID }),
        credentials: "include",
      });
      load();
    } catch (error) {
      console.error("Error assigning:", error);
    }
  };

  const onUnassign = async (taskId: Task["id"], userID: number) => {
    if (!teamId) return;
    try {
      await fetch(`${API}/api/teams/${teamId}/tasks/${taskId}/assign/${userID}`, {
        method: "DELETE",
        credentials: "include",
      });
      load();
    } catch (error) {
      console.error("Error unassigning:", error);
    }
  };

  if (authLoading || !user) return null;
  if (!teamId) return null;

  return (
    <DashboardScreen
      mode="team"
      teamId={teamId}
      tasks={tasks}
      loading={loading}
      onAddTask={onAddTask}
      onSelectTask={onSelectTask}
      onEditTask={onEditTask}
      onDeleteTask={onDeleteTask}
      onAssign={onAssign}
      onUnassign={onUnassign}
      currentUserInitials={user.userName.substring(0, 2).toUpperCase()}
      currentUserName={user.userName}
      currentUserId={user.userId}
      titleOverride={teamName || "Team Tasks"}
      teams={[]}
      teamMembers={teamMembers}
    />
  );
}