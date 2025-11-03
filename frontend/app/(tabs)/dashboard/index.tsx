import { useEffect, useState } from "react";
import DashboardScreen from "../../../features/dashboard/DashboardScreen";
import type { Task } from "../../../features/dashboard/types";

export default function PersonalDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: fetch /tasks?owner=me
    setLoading(false);
  }, []);

  const onAddTask = (title: string) => {
    setTasks((prev) => [{ id: Date.now(), title, status: "Pending", ownerId: "me" }, ...prev]);
  };

  return <DashboardScreen mode="personal" tasks={tasks} loading={loading} onAddTask={onAddTask} currentUserInitials="CT" />;
}
