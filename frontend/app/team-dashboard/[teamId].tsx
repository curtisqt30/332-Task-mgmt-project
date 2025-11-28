import { useCallback, useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";
import DashboardScreen from "../../components/DashboardScreen";
import type { Task } from "../../components/types";
import { getTeams } from "../../lib/storage";

const API = process.env.EXPO_PUBLIC_API_BASE ?? "http://localhost:8000";

export default function TeamDashboard() {
  const router = useRouter();
  // This will get the teamId from the URL path: /team-dashboard/[teamId]
  const params = useLocalSearchParams<{ teamId?: string }>();
  const teamId = params.teamId;
  
  const { user, loading: authLoading } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamName, setTeamName] = useState("");

  console.log("Team Dashboard - params:", params);
  console.log("Team Dashboard - teamId:", teamId);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      console.log("Not authenticated, redirecting to login");
      router.replace("/login");
    }
  }, [authLoading, user]);

  // Load team info and tasks
  const load = useCallback(async () => {
    if (!teamId || !user) {
      console.log("Missing teamId or user", { teamId, user: !!user });
      return;
    }
    
    console.log("Loading team data for teamId:", teamId);
    setLoading(true);
    try {
      // Load team name from storage
      const teams = await getTeams();
      console.log("All teams:", teams);
      
      const team = teams.find(t => t.id === teamId);
      console.log("Found team:", team);
      
      if (team) {
        setTeamName(team.name);
      } else {
        console.warn("Team not found in storage:", teamId);
      }
      
      // TODO: Load actual team tasks from API when backend is ready
      // For now, mock data
      setTasks([
        {
          id: `team-task-1-${teamId}`,
          title: "Complete Project Synopsis",
          status: "In Progress",
          description: "Finalize the project documentation for CPSC 332",
          due: "2025-01-15",
          category: "Documentation",
          teamId: teamId,
          assignees: [
            { name: "Member 1", initials: "M1", color: "#3B82F6" },
            { name: "Member 2", initials: "M2", color: "#10B981" },
          ],
        },
        {
          id: `team-task-2-${teamId}`,
          title: "Database Schema Review",
          status: "Pending",
          description: "Review and optimize the relational schema",
          due: "2025-01-10",
          category: "Technical",
          teamId: teamId,
          assignees: [
            { name: "Member 2", initials: "M2", color: "#10B981" },
          ],
        },
        {
          id: `team-task-3-${teamId}`,
          title: "Implement User Authentication",
          status: "Completed",
          description: "Add login and registration functionality",
          due: "2024-12-20",
          category: "Development",
          teamId: teamId,
          assignees: [
            { name: "Member 1", initials: "M1", color: "#3B82F6" },
          ],
        },
      ]);
    } catch (error) {
      console.error("Error loading team data:", error);
    } finally {
      setLoading(false);
    }
  }, [teamId, user]);

  useEffect(() => {
    if (user && teamId) {
      console.log("Calling load()");
      load();
    }
  }, [load, user, teamId]);

  // Add team task
  const onAddTask = async (title: string, description?: string | null, due?: string | null) => {
    if (!user || !teamId) return;
    
    const newTask: Task = {
      id: `team-task-${Date.now()}`,
      title,
      status: "Pending",
      description: description || null,
      due: due || null,
      teamId: teamId,
      assignees: [], // TODO: Add assignee selection in modal
    };
    
    setTasks([...tasks, newTask]);
    
    // TODO: POST to API when backend is ready
    // await fetch(`${API}/api/teams/${teamId}/tasks`, { ... });
  };

  // Cycle status
  const cycle = (s: Task["status"]): Task["status"] =>
    s === "Pending" ? "In Progress" : s === "In Progress" ? "Completed" : "Pending";

  const onSelectTask = async (taskId: Task["id"]) => {
    if (!user) return;
    
    const cur = tasks.find((t) => t.id === taskId);
    if (!cur) return;
    const next = cycle(cur.status);
    
    setTasks((ts) => ts.map((t) => (t.id === taskId ? { ...t, status: next } : t)));
    
    // TODO: PATCH to API when backend is ready
  };

  // Edit task
  const onEditTask = async (taskId: Task["id"], patch: Partial<Task>) => {
    if (!user) return;
    
    setTasks((ts) => ts.map((t) => (t.id === taskId ? { ...t, ...patch } : t)));
    
    // TODO: PATCH to API when backend is ready
  };

  // Delete task
  const onDeleteTask = async (taskId: Task["id"]) => {
    if (!user) return;
    
    setTasks((ts) => ts.filter((t) => t.id !== taskId));
    
    // TODO: DELETE from API when backend is ready
  };

  if (authLoading || !user) {
    console.log("Waiting for auth...");
    return null;
  }

  if (!teamId) {
    console.log("No teamId provided!");
    return null;
  }

  const userInitials = user.userName.substring(0, 2).toUpperCase();

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
      currentUserInitials={userInitials}
      currentUserName={user.userName}
      titleOverride={teamName ? `${teamName} Tasks` : "Team Tasks"}
      teams={[]}
    />
  );
}