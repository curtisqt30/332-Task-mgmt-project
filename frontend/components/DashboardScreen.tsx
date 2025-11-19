import { useMemo, useRef, useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, Animated, Easing } from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/theme";
import TaskModal from "./TaskModal";
import type { Task, Status } from "./types";

type Props = {
  mode: "personal" | "team";
  teamId?: string;
  tasks: Task[];
  loading?: boolean;
  onAddTask?: (title: string, description?: string | null, due?: string | null) => void;
  onSelectTask?: (taskId: Task["id"]) => void;
  onEditTask?: (taskId: Task["id"], patch: Partial<Task>) => void;
  onDeleteTask?: (taskId: Task["id"]) => void;
  currentUserInitials?: string;
  titleOverride?: string;
};

const statusColor = (s: Status) =>
  ({ Pending: Colors.statusPending, "In Progress": Colors.statusInProgress, Completed: Colors.statusCompleted, Overdue: Colors.statusOverdue }[s]);

const DRAWER_W = 260;

export default function DashboardScreen({
  mode,
  teamId,
  tasks,
  loading = false,
  onAddTask,
  onSelectTask,
  onEditTask,
  onDeleteTask,
  currentUserInitials = "U",
  titleOverride,
}: Props) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"All" | Status>("All");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerX = useRef(new Animated.Value(-DRAWER_W)).current;
  
  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      const byStatus = status === "All" ? true : t.status === status;
      const byQuery = q ? t.title.toLowerCase().includes(q.toLowerCase()) : true;
      return byStatus && byQuery;
    });
  }, [tasks, q, status]);

  const toggleDrawer = (open?: boolean) => {
    const next = typeof open === "boolean" ? open : !drawerOpen;
    setDrawerOpen(next);
    Animated.timing(drawerX, {
      toValue: next ? 0 : -DRAWER_W,
      duration: 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const headerTitle = titleOverride ?? (mode === "personal" ? "My Tasks" : `Team Tasks · ${teamId ?? ""}`);

  const drawerItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Sign Out", href: "/login" },
  ];

  // Modal handlers
  const openCreateModal = () => {
    setModalMode("create");
    setSelectedTask(null);
    setModalVisible(true);
  };

  const openEditModal = (task: Task) => {
    setModalMode("edit");
    setSelectedTask(task);
    setModalVisible(true);
  };

  const handleModalSave = (data: any) => {
    if (modalMode === "create") {
      onAddTask?.(data.title, data.description, data.due);
    } else if (modalMode === "edit" && selectedTask) {
      onEditTask?.(selectedTask.id, data);
    }
    setModalVisible(false);
  };

  const handleModalDelete = (taskId: Task["id"]) => {
    onDeleteTask?.(taskId);
    setModalVisible(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* Header */}
      <View style={{ 
        paddingHorizontal: 20, 
        paddingVertical: 12, 
        borderBottomWidth: 1, 
        borderColor: Colors.border, 
        backgroundColor: Colors.surface, 
        flexDirection: "row", 
        alignItems: "center", 
        gap: 12 
      }}>
        <Pressable 
          onPress={() => toggleDrawer()} 
          aria-label="Open menu" 
          style={{ 
            width: 40, 
            height: 40, 
            alignItems: "center", 
            justifyContent: "center", 
            borderRadius: 8, 
            borderWidth: 1, 
            borderColor: Colors.border, 
            backgroundColor: "#fff" 
          }}
        >
          <View style={{ width: 18, height: 2, backgroundColor: Colors.text, marginBottom: 3 }} />
          <View style={{ width: 18, height: 2, backgroundColor: Colors.text, marginBottom: 3 }} />
          <View style={{ width: 18, height: 2, backgroundColor: Colors.text }} />
        </Pressable>

        <Text style={{ color: Colors.primary, fontSize: 20, fontWeight: "700" }}>{headerTitle}</Text>

        <TextInput
          placeholder="Search tasks…"
          value={q}
          onChangeText={setQ}
          style={{ 
            flex: 1, 
            borderWidth: 1, 
            borderColor: Colors.border, 
            borderRadius: 8, 
            paddingHorizontal: 12, 
            paddingVertical: 8, 
            backgroundColor: "white", 
            marginLeft: 8 
          }}
        />

        <Pressable 
          onPress={openCreateModal} 
          disabled={!onAddTask} 
          style={{ 
            backgroundColor: onAddTask ? Colors.primary : "#94A3B8", 
            paddingHorizontal: 16, 
            paddingVertical: 10, 
            borderRadius: 8 
          }}
        >
          <Text style={{ color: "white", fontWeight: "600" }}>+ New Task</Text>
        </Pressable>
      </View>

      {/* Filters */}
      <View style={{ 
        paddingHorizontal: 20, 
        paddingVertical: 12, 
        borderBottomWidth: 1, 
        borderColor: Colors.border, 
        backgroundColor: Colors.surface, 
        gap: 10, 
        flexDirection: "row", 
        alignItems: "center" 
      }}>
        {(["All", "Pending", "In Progress", "Completed", "Overdue"] as const).map((s) => (
          <Pressable 
            key={s} 
            onPress={() => setStatus(s as any)} 
            style={{ 
              paddingHorizontal: 12, 
              paddingVertical: 6, 
              borderRadius: 999, 
              borderWidth: 1, 
              borderColor: s === status ? Colors.primary : Colors.border, 
              backgroundColor: s === status ? "#EEF2FF" : "transparent" 
            }}
          >
            <Text style={{ color: Colors.text, fontWeight: s === status ? "700" : "500" }}>{s}</Text>
          </Pressable>
        ))}
      </View>

      {/* Content grid */}
      <View style={{ flex: 1, flexDirection: "row", gap: 16, padding: 16 }}>
        {/* Left: Task List */}
        <View style={{ flex: 1, backgroundColor: Colors.surface, borderRadius: 12, borderWidth: 1, borderColor: Colors.border }}>
          <ScrollView contentContainerStyle={{ padding: 12 }}>
            {loading ? (
              <Text style={{ color: Colors.secondary, textAlign: "center", padding: 24 }}>Loading…</Text>
            ) : filtered.length === 0 ? (
              <Text style={{ color: Colors.secondary, textAlign: "center", padding: 24 }}>No tasks match your filters.</Text>
            ) : (
              filtered.map((t) => (
                <Pressable
                  key={t.id}
                  onPress={() => openEditModal(t)}
                  style={{ 
                    borderLeftWidth: 4, 
                    borderLeftColor: statusColor(t.status), 
                    backgroundColor: "white", 
                    borderRadius: 8, 
                    padding: 12, 
                    marginBottom: 10, 
                    borderWidth: 1, 
                    borderColor: Colors.border,
                    // Add hover effect on web
                    cursor: "pointer",
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <Text style={{ color: Colors.text, fontWeight: "600", flex: 1 }}>{t.title}</Text>

                    {t.assignees && t.assignees.length > 0 && (
                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                        {t.assignees.slice(0, 4).map((a, idx) => (
                          <View 
                            key={(a.id ?? a.name) + idx} 
                            style={{ 
                              width: 28, 
                              height: 28, 
                              borderRadius: 14, 
                              backgroundColor: a.color, 
                              alignItems: "center", 
                              justifyContent: "center", 
                              borderWidth: 2, 
                              borderColor: "#fff", 
                              marginLeft: idx === 0 ? 0 : -8 
                            }}
                          >
                            <Text style={{ color: "white", fontSize: 11, fontWeight: "700" }}>{a.initials}</Text>
                          </View>
                        ))}
                        {t.assignees.length > 4 && (
                          <View style={{ 
                            width: 28, 
                            height: 28, 
                            borderRadius: 14, 
                            backgroundColor: "#E2E8F0", 
                            alignItems: "center", 
                            justifyContent: "center", 
                            borderWidth: 2, 
                            borderColor: "#fff", 
                            marginLeft: -8 
                          }}>
                            <Text style={{ color: Colors.text, fontSize: 11, fontWeight: "700" }}>
                              +{t.assignees.length - 4}
                            </Text>
                          </View>
                        )}
                      </View>
                    )}

                    <Text style={{ color: statusColor(t.status), fontWeight: "600" }}>{t.status}</Text>
                  </View>

                  {/* Show description below the title row */}
                  {t.description && (
                    <Text 
                      style={{ 
                        color: Colors.secondary, 
                        marginTop: 6, 
                        fontSize: 13,
                        lineHeight: 18,
                      }} 
                      numberOfLines={2}
                    >
                      {t.description}
                    </Text>
                  )}

                  <View style={{ flexDirection: "row", gap: 12, marginTop: 6 }}>
                    {t.due && <Text style={{ color: Colors.icon, fontSize: 12 }}>📅 {t.due}</Text>}
                    {t.category && (
                      <Text style={{ 
                        color: Colors.text, 
                        backgroundColor: "#F1F5F9", 
                        borderRadius: 6, 
                        paddingHorizontal: 8, 
                        paddingVertical: 2,
                        fontSize: 12,
                      }}>
                        {t.category}
                      </Text>
                    )}
                  </View>
                </Pressable>
              ))
            )}
          </ScrollView>
        </View>

        {/* Right rail - Stats */}
        <View style={{ width: 340, gap: 16 }}>
          <View style={{ flexDirection: "row", gap: 12 }}>
            {[
              { label: "Due Today", value: filtered.filter((t) => t.due === new Date().toISOString().slice(0, 10)).length },
              { label: "Overdue", value: filtered.filter((t) => t.status === "Overdue").length },
              { label: "This Week", value: 0 },
              { label: "Completed", value: filtered.filter((t) => t.status === "Completed").length },
            ].map((kpi) => (
              <View 
                key={kpi.label} 
                style={{ 
                  flex: 1, 
                  backgroundColor: Colors.surface, 
                  borderRadius: 12, 
                  borderWidth: 1, 
                  borderColor: Colors.border, 
                  padding: 12 
                }}
              >
                <Text style={{ color: Colors.secondary, fontSize: 12 }}>{kpi.label}</Text>
                <Text style={{ color: Colors.text, fontWeight: "800", fontSize: 18 }}>{kpi.value}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Task Modal */}
      <TaskModal
        visible={modalVisible}
        mode={modalMode}
        task={selectedTask}
        onClose={() => setModalVisible(false)}
        onSave={handleModalSave}
        onDelete={handleModalDelete}
        teamMode={mode === "team"}
      />

      {/* Drawer overlay */}
      {drawerOpen && (
        <Pressable 
          onPress={() => toggleDrawer(false)} 
          style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.2)" }} 
        />
      )}

      {/* Drawer panel */}
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          width: DRAWER_W,
          backgroundColor: Colors.surface,
          borderRightWidth: 1,
          borderColor: Colors.border,
          padding: 16,
          transform: [{ translateX: drawerX }],
          shadowColor: "#000",
          shadowOpacity: 0.08,
          shadowOffset: { width: 2, height: 0 },
          shadowRadius: 6,
        }}
      >
        <Text style={{ color: Colors.text, fontWeight: "800", fontSize: 18, marginBottom: 12 }}>Navigation</Text>
        {drawerItems.map((item) => (
          <Pressable
            key={item.href}
            onPress={() => {
              toggleDrawer(false);
              router.push(item.href);
            }}
            style={{ paddingVertical: 10, borderRadius: 8, paddingHorizontal: 8, marginBottom: 6 }}
          >
            <Text style={{ color: Colors.text }}>{item.label}</Text>
          </Pressable>
        ))}
      </Animated.View>
    </View>
  );
}