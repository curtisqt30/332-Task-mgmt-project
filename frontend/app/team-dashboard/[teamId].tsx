import { useCallback, useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../../contexts/AuthContext";
import DashboardScreen from "../../components/DashboardScreen";
import type { Task } from "../../components/types";
import { getTeams } from "../../lib/storage";

export default function TeamDashboard() {
  const router = useRouter();
  const params = useLocalSearchParams<{ teamId?: string }>();
  const teamId = params.teamId;
  
  const { user, loading: authLoading } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamName, setTeamName] = useState("");

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user]);

  // Load team info and tasks
  const load = useCallback(async () => {
    if (!teamId || !user) return;
    
    setLoading(true);
    try {
      // Load team name from storage
      const teams = await getTeams();
      const team = teams.find(t => t.id === teamId);
      
      if (team) {
        setTeamName(team.name);
      } else {
        setTeamName("Unknown Team");
      }
      
      // TODO: Load actual team tasks from API when backend supports it
      // For now, start with empty tasks
      setTasks([]);
      
    } catch (error) {
      console.error("Error loading team data:", error);
    } finally {
      setLoading(false);
    }
  }, [teamId, user]);

  // Reload on focus
  useFocusEffect(
    useCallback(() => {
      if (user && teamId) {
        load();
      }
    }, [user, teamId, load])
  );

  // Add team task (local only for now)
  const onAddTask = async (title: string, description?: string | null, due?: string | null) => {
    if (!user || !teamId) return;
    
    const newTask: Task = {
      id: `team-task-${Date.now()}`,
      title,
      status: "Pending",
      description: description || null,
      due: due || null,
      teamId: teamId,
      assignees: [],
    };
    
    setTasks(prev => [newTask, ...prev]);
    
    // TODO: POST to API when backend supports team tasks
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
  };

  const onEditTask = async (taskId: Task["id"], patch: Partial<Task>) => {
    if (!user) return;
    setTasks((ts) => ts.map((t) => (t.id === taskId ? { ...t, ...patch } : t)));
  };

  const onDeleteTask = async (taskId: Task["id"]) => {
    if (!user) return;
    setTasks((ts) => ts.filter((t) => t.id !== taskId));
  };

  if (authLoading || !user) return null;
  if (!teamId) return null;

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
      titleOverride={teamName || "Team Tasks"}
      teams={[]}
    />
  );
}