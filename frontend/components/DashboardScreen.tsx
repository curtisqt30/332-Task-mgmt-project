import { useMemo, useRef, useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, Animated, Easing } from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/theme";
import type { Task, Status } from "./types";

type Props = {
  mode: "personal" | "team";
  teamId?: string;
  tasks: Task[];
  loading?: boolean;
  onAddTask?: (title: string) => void;
  onSelectTask?: (taskId: Task["id"]) => void;        // tap card cycles status
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
  const [newTitle, setNewTitle] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerX = useRef(new Animated.Value(-DRAWER_W)).current;

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      const byStatus = status === "All" ? true : t.status === status;
      const byQuery = q ? t.title.toLowerCase().includes(q.toLowerCase()) : true;
      return byStatus && byQuery;
    });
  }, [tasks, q, status]);

  const addTaskLocal = () => {
    const title = newTitle.trim();
    if (!title) return;
    onAddTask?.(title);
    setNewTitle("");
  };

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
    { label: "Dashboard", href: "/(tabs)/dashboard" },
    { label: "Sign Out", href: "/(tabs)/login" },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface, flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Pressable onPress={() => toggleDrawer()} aria-label="Open menu" style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 8, borderWidth: 1, borderColor: Colors.border, backgroundColor: "#fff" }}>
          <View style={{ width: 18, height: 2, backgroundColor: Colors.text, marginBottom: 3 }} />
          <View style={{ width: 18, height: 2, backgroundColor: Colors.text, marginBottom: 3 }} />
          <View style={{ width: 18, height: 2, backgroundColor: Colors.text }} />
        </Pressable>

        <Text style={{ color: Colors.primary, fontSize: 20, fontWeight: "700" }}>{headerTitle}</Text>

        <TextInput
          placeholder="Search tasks…"
          value={q}
          onChangeText={setQ}
          style={{ flex: 1, borderWidth: 1, borderColor: Colors.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: "white", marginLeft: 8 }}
        />

        <Pressable onPress={addTaskLocal} disabled={!onAddTask} style={{ backgroundColor: onAddTask ? Colors.primary : "#94A3B8", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 }}>
          <Text style={{ color: "white", fontWeight: "600" }}>+ New Task</Text>
        </Pressable>

      </View>

      {/* Filters */}
      <View style={{ paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface, gap: 10, flexDirection: "row", alignItems: "center" }}>
        {(["All", "Pending", "In Progress", "Completed", "Overdue"] as const).map((s) => (
          <Pressable key={s} onPress={() => setStatus(s as any)} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: s === status ? Colors.primary : Colors.border, backgroundColor: s === status ? "#EEF2FF" : "transparent" }}>
            <Text style={{ color: Colors.text, fontWeight: s === status ? "700" : "500" }}>{s}</Text>
          </Pressable>
        ))}

        {/* Inline quick add */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginLeft: "auto" }}>
          <TextInput
            placeholder="Quick add task…"
            value={newTitle}
            onChangeText={setNewTitle}
            onSubmitEditing={addTaskLocal}
            style={{ width: 260, borderWidth: 1, borderColor: Colors.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: "white" }}
          />
          <Pressable onPress={addTaskLocal} disabled={!onAddTask} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: Colors.border, backgroundColor: "#fff", opacity: onAddTask ? 1 : 0.6 }}>
            <Text style={{ color: Colors.text }}>Add</Text>
          </Pressable>
        </View>
      </View>

      {/* Content grid */}
      <View style={{ flex: 1, flexDirection: "row", gap: 16, padding: 16 }}>
        {/* Left: List */}
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
                  onPress={() => onSelectTask?.(t.id)}
                  style={{ borderLeftWidth: 4, borderLeftColor: statusColor(t.status), backgroundColor: "white", borderRadius: 8, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: Colors.border }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <Text style={{ color: Colors.text, fontWeight: "600", flex: 1 }}>{t.title}</Text>

                    {t.assignees && t.assignees.length > 0 && (
                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                        {t.assignees.slice(0, 4).map((a, idx) => (
                          <View key={(a.id ?? a.name) + idx} style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: a.color, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#fff", marginLeft: idx === 0 ? 0 : -8 }}>
                            <Text style={{ color: "white", fontSize: 11, fontWeight: "700" }}>{a.initials}</Text>
                          </View>
                        ))}
                        {t.assignees.length > 4 && (
                          <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: "#E2E8F0", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#fff", marginLeft: -8 }}>
                            <Text style={{ color: Colors.text, fontSize: 11, fontWeight: "700" }}>+{t.assignees.length - 4}</Text>
                          </View>
                        )}
                      </View>
                    )}
                                          
                    {t.description ? (
                      <Text style={{ color: Colors.secondary, marginTop: 6 }}>
                        {t.description}
                      </Text>
                    ) : null}

                    <Text style={{ color: statusColor(t.status), fontWeight: "600" }}>{t.status}</Text>
                  </View>

                  <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
                    {/* Edit */}
                    <Pressable
                      onPress={() => {
                        // @ts-ignore
                        const suggested = (typeof window !== "undefined" && window.prompt)
                          ? // @ts-ignore
                            window.prompt("Edit task title", t.title)
                          : null;

                        if (suggested != null && suggested.trim()) {
                          onEditTask?.(t.id, { title: suggested.trim() } );
                          
                        }
                      }}
                      style={{ paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: Colors.border, borderRadius: 6, backgroundColor: "#fff" }}
                    >
                      <Text style={{ color: Colors.text }}>Edit</Text>
                    </Pressable>

                    {/* Edit Description + Due Date */}
                    <Pressable
                      onPress={() => {
                        // Description
                        // @ts-ignore
                        const nextDesc = (typeof window !== "undefined" && window.prompt)
                          ? // @ts-ignore
                            window.prompt("Edit description (optional)", t.description ?? "")
                          : null;
                        // Due date (YYYY-MM-DD)
                        // @ts-ignore
                        const nextDue = (typeof window !== "undefined" && window.prompt)
                          ? // @ts-ignore
                            window.prompt("Edit due date (YYYY-MM-DD)", t.due ?? "")
                          : null;

                        const patch: Partial<Task> = {};
                        if (nextDesc !== null) patch.description = nextDesc?.trim() || null as any;
                        if (nextDue !== null)  patch.due = nextDue?.trim() || null as any;
                        if (Object.keys(patch).length) onEditTask?.(t.id, patch);
                      }}
                      style={{ paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: Colors.border, borderRadius: 6, backgroundColor: "#fff" }}
                    >
                      <Text style={{ color: Colors.text }}>Details</Text>
                    </Pressable>

                    {/* Delete */}
                    <Pressable
                      onPress={() => onDeleteTask?.(t.id)}
                      style={{ paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: "#ef4444", borderRadius: 6, backgroundColor: "#fff" }}
                    >
                      <Text style={{ color: "#ef4444" }}>Delete</Text>
                    </Pressable>
                  </View>

                  <View style={{ flexDirection: "row", gap: 12, marginTop: 6 }}>
                    {t.due && <Text style={{ color: Colors.icon }}>📅 {t.due}</Text>}
                    {t.category && <Text style={{ color: Colors.text, backgroundColor: "#F1F5F9", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 }}>{t.category}</Text>}
                  </View>
                </Pressable>
              ))
            )}
          </ScrollView>
        </View>

        {/* Right rail placeholders */}
        <View style={{ width: 340, gap: 16 }}>
          <View style={{ flexDirection: "row", gap: 12 }}>
            {[
              { label: "Due Today", value: filtered.filter((t) => t.due === new Date().toISOString().slice(0, 10)).length },
              { label: "Overdue", value: filtered.filter((t) => t.status === "Overdue").length },
              { label: "This Week", value: 0 },
              { label: "Completed", value: filtered.filter((t) => t.status === "Completed").length },
            ].map((kpi) => (
              <View key={kpi.label} style={{ flex: 1, backgroundColor: Colors.surface, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, padding: 12 }}>
                <Text style={{ color: Colors.secondary, fontSize: 12 }}>{kpi.label}</Text>
                <Text style={{ color: Colors.text, fontWeight: "800", fontSize: 18 }}>{kpi.value}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Drawer overlay */}
      {drawerOpen && <Pressable onPress={() => toggleDrawer(false)} style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.2)" }} />}

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
