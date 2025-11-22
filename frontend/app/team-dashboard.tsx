import { useCallback, useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import DashboardScreen from "@/components/DashboardScreen";
import type { Task } from "@/components/types";

const API = process.env.EXPO_PUBLIC_API_BASE ?? "http://localhost:8000";

export default function TeamDashboard() {
  const { teamId } = useLocalSearchParams<{ teamId: string }>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamName, setTeamName] = useState("");
  const [teamMembers, setTeamMembers] = useState<Array<{ id: string; name: string; initials: string }>>([]);

  // Load team info and tasks
  const load = useCallback(async () => {
    if (!teamId) return;
    
    setLoading(true);
    try {
      // In a real app, this would fetch from the API
      // For now, we'll use mock data or localStorage
      
      // Mock team data
      setTeamName(`Team ${teamId}`);
      setTeamMembers([
        { id: "1", name: "test1", initials: "t1" },
        { id: "2", name: "test2", initials: "t2" },
        { id: "3", name: "test3", initials: "t3" },
      ]);
      
      // Mock team tasks
      setTasks([
        {
          id: `team-task-1`,
          title: "Complete Project Synopsis",
          status: "In Progress",
          description: "Finalize the project documentation for CPSC 332",
          due: "2025-01-15",
          category: "Documentation",
          teamId: teamId,
          assignees: [
            { name: "test1", initials: "t1", color: "#3B82F6" },
            { name: "test2", initials: "t2", color: "#10B981" },
          ],
        },
        {
          id: `team-task-2`,
          title: "Database Schema Review",
          status: "Pending",
          description: "Review and optimize the relational schema",
          due: "2025-01-10",
          category: "Technical",
          teamId: teamId,
          assignees: [
            { name: "test2", initials: "t2", color: "#10B981" },
          ],
        },
        {
          id: `team-task-3`,
          title: "Implement User Authentication",
          status: "Completed",
          description: "Add login and registration functionality",
          due: "2024-12-20",
          category: "Development",
          teamId: teamId,
          assignees: [
            { name: "test1", initials: "test1", color: "#3B82F6" },
          ],
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    load();
  }, [load]);

  // Add team task
  const onAddTask = async (title: string, description?: string | null, due?: string | null) => {
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
    
    // In real app, would POST to API
    // await fetch(`${API}/api/teams/${teamId}/tasks`, { ... });
  };

  // Cycle status
  const cycle = (s: Task["status"]): Task["status"] =>
    s === "Pending" ? "In Progress" : s === "In Progress" ? "Completed" : "Pending";

  const onSelectTask = async (taskId: Task["id"]) => {
    const cur = tasks.find((t) => t.id === taskId);
    if (!cur) return;
    const next = cycle(cur.status);
    
    setTasks((ts) => ts.map((t) => (t.id === taskId ? { ...t, status: next } : t)));
    
    // In real app, would PATCH to API
  };

  // Edit task
  const onEditTask = async (taskId: Task["id"], patch: Partial<Task>) => {
    setTasks((ts) => ts.map((t) => (t.id === taskId ? { ...t, ...patch } : t)));
    
    // In real app, would PATCH to API
  };

  // Delete task
  const onDeleteTask = async (taskId: Task["id"]) => {
    setTasks((ts) => ts.filter((t) => t.id !== taskId));
    
    // In real app, would DELETE from API
  };

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
      currentUserInitials="CT"
      titleOverride={teamName ? `${teamName} Tasks` : "Team Tasks"}
    />
  );
}