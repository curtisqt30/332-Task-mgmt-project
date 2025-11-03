import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import DashboardScreen from "../../../features/dashboard/DashboardScreen";
import type { Task } from "../../../features/dashboard/types";

export default function TeamDashboard() {
  const { teamId } = useLocalSearchParams<{ teamId: string }>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!teamId) return;
    // TODO: fetch /teams/:teamId/tasks
    setLoading(false);
  }, [teamId]);

  const onAddTask = (title: string) => {
    setTasks((prev) => [
      { id: Date.now(), title, status: "Pending", teamId: String(teamId), assignees: [{ name: "You", initials: "U", color: "#22D3EE" }] },
      ...prev,
    ]);
  };

  return <DashboardScreen mode="team" teamId={String(teamId)} tasks={tasks} loading={loading} onAddTask={onAddTask} currentUserInitials="CT" />;
}
