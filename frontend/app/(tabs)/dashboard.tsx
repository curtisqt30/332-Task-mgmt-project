import { useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Animated,
  Easing,
} from "react-native";
import { Colors } from "@/constants/theme";

type Task = {
  id: number;
  title: string;
  status: "Pending" | "In Progress" | "Completed" | "Overdue";
  due?: string;
  category?: string;
  assignees?: { name: string; initials: string; color: string }[];
};

const MOCK_TASKS: Task[] = [
  {
    id: 1,
    title: "ExampleTask1",
    status: "In Progress",
    due: "2025-10-25",
    category: "medium priority",
    assignees: [
      { name: "Alice", initials: "AL", color: "#60A5FA" },
      { name: "Bob", initials: "BK", color: "#34D399" },
      { name: "Charlie", initials: "CT", color: "#FBBF24" },
    ],
  },
  {
    id: 2,
    title: "ExampleTask2",
    status: "Completed",
    due: "2025-10-22",
    category: "low priority",
    assignees: [{ name: "Dana", initials: "DA", color: "#A78BFA" }],
  },
  {
    id: 3,
    title: "ExampleTask3",
    status: "Pending",
    due: "2025-10-27",
    category: "high priority",
    assignees: [
      { name: "Evan", initials: "EV", color: "#F472B6" },
      { name: "Charlie", initials: "CT", color: "#FBBF24" },
    ],
  },
  {
    id: 4,
    title: "ExampleTask4",
    status: "Overdue",
    due: "2025-10-20",
    category: "critical priority",
    assignees: [{ name: "You", initials: "XY", color: "#22D3EE" }],
  },
];

const statusColor = (s: Task["status"]) =>
  ({
    Pending: Colors.statusPending,
    "In Progress": Colors.statusInProgress,
    Completed: Colors.statusCompleted,
    Overdue: Colors.statusOverdue,
  }[s]);

const DRAWER_W = 260;

export default function Dashboard() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"All" | Task["status"]>("All");
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
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

  const addTask = () => {
    if (!newTitle.trim()) return;
    setTasks((prev) => [
      {
        id: Date.now(),
        title: newTitle.trim(),
        status: "Pending",
        assignees: [{ name: "You", initials: "XY", color: "#22D3EE" }],
      },
      ...prev,
    ]);
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

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* Header */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderColor: Colors.border,
          backgroundColor: Colors.surface,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        }}
      >
        {/* Hamburger */}
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
            backgroundColor: "#fff",
          }}
        >
          {/* three lines */}
          <View style={{ width: 18, height: 2, backgroundColor: Colors.text, marginBottom: 3 }} />
          <View style={{ width: 18, height: 2, backgroundColor: Colors.text, marginBottom: 3 }} />
          <View style={{ width: 18, height: 2, backgroundColor: Colors.text }} />
        </Pressable>

        <Text style={{ color: Colors.primary, fontSize: 20, fontWeight: "700" }}>
          Task Manager
        </Text>

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
            marginLeft: 8,
          }}
        />

        <Pressable
          onPress={addTask}
          style={{
            backgroundColor: Colors.primary,
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: "white", fontWeight: "600" }}>+ New Task</Text>
        </Pressable>

        {/* PFP (top-right) */}
        <Pressable
          onPress={() => {}}
          aria-label="Profile"
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: "#0EA5E9",
            alignItems: "center",
            justifyContent: "center",
            marginLeft: 8,
          }}
        >
          <Text style={{ color: "white", fontWeight: "700" }}>CT</Text>
        </Pressable>
      </View>

      {/* Filters */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderColor: Colors.border,
          backgroundColor: Colors.surface,
          gap: 10,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
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
              backgroundColor: s === status ? "#EEF2FF" : "transparent",
            }}
          >
            <Text style={{ color: Colors.text, fontWeight: s === status ? "700" : "500" }}>
              {s}
            </Text>
          </Pressable>
        ))}

        {/* Inline quick add */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginLeft: "auto" }}>
          <TextInput
            placeholder="Quick add task…"
            value={newTitle}
            onChangeText={setNewTitle}
            onSubmitEditing={addTask}
            style={{
              width: 260,
              borderWidth: 1,
              borderColor: Colors.border,
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 8,
              backgroundColor: "white",
            }}
          />
          <Pressable
            onPress={addTask}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: Colors.border,
              backgroundColor: "#fff",
            }}
          >
            <Text style={{ color: Colors.text }}>Add</Text>
          </Pressable>
        </View>
      </View>

      {/* Content grid */}
      <View style={{ flex: 1, flexDirection: "row", gap: 16, padding: 16 }}>
        {/* Left: List */}
        <View
          style={{
            flex: 1,
            backgroundColor: Colors.surface,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: Colors.border,
          }}
        >
          <ScrollView contentContainerStyle={{ padding: 12 }}>
            {filtered.length === 0 ? (
              <Text style={{ color: Colors.secondary, textAlign: "center", padding: 24 }}>
                No tasks match your filters.
              </Text>
            ) : (
              filtered.map((t) => (
                <View
                  key={t.id}
                  style={{
                    borderLeftWidth: 4,
                    borderLeftColor: statusColor(t.status),
                    backgroundColor: "white",
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 10,
                    borderWidth: 1,
                    borderColor: Colors.border,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    <Text style={{ color: Colors.text, fontWeight: "600", flex: 1 }}>
                      {t.title}
                    </Text>

                    {/* Overlapping assignees */}
                    {t.assignees && t.assignees.length > 0 && (
                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                        {t.assignees.slice(0, 4).map((a, idx) => (
                          <View
                            key={a.name + idx}
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: 14,
                              backgroundColor: a.color,
                              alignItems: "center",
                              justifyContent: "center",
                              borderWidth: 2,
                              borderColor: "#fff",
                              marginLeft: idx === 0 ? 0 : -8, // overlap
                            }}
                          >
                            <Text style={{ color: "white", fontSize: 11, fontWeight: "700" }}>
                              {a.initials}
                            </Text>
                          </View>
                        ))}
                        {t.assignees.length > 4 && (
                          <View
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: 14,
                              backgroundColor: "#E2E8F0",
                              alignItems: "center",
                              justifyContent: "center",
                              borderWidth: 2,
                              borderColor: "#fff",
                              marginLeft: -8,
                            }}
                          >
                            <Text style={{ color: Colors.text, fontSize: 11, fontWeight: "700" }}>
                              +{t.assignees.length - 4}
                            </Text>
                          </View>
                        )}
                      </View>
                    )}

                    <Text style={{ color: statusColor(t.status), fontWeight: "600" }}>
                      {t.status}
                    </Text>
                  </View>

                  <View style={{ flexDirection: "row", gap: 12, marginTop: 6 }}>
                    {t.due && <Text style={{ color: Colors.icon }}>📅 {t.due}</Text>}
                    {t.category && (
                      <Text
                        style={{
                          color: Colors.text,
                          backgroundColor: "#F1F5F9",
                          borderRadius: 6,
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                        }}
                      >
                        {t.category}
                      </Text>
                    )}
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>

        {/* Right: Mini calendar + metrics (placeholder blocks) */}
        <View style={{ width: 340, gap: 16 }}>
          <View
            style={{
              backgroundColor: Colors.surface,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: Colors.border,
              padding: 12,
            }}
          >
            <Text style={{ color: Colors.text, fontWeight: "700", marginBottom: 8 }}>
              Calendar
            </Text>
            <Text style={{ color: Colors.secondary }}>Mini calendar placeholder</Text>
          </View>
          <View style={{ flexDirection: "row", gap: 12 }}>
            {[
              { label: "Due Today", value: filtered.filter((t) => t.due === "2025-10-24").length },
              { label: "Overdue", value: filtered.filter((t) => t.status === "Overdue").length },
              { label: "This Week", value: 3 },
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
                  padding: 12,
                }}
              >
                <Text style={{ color: Colors.secondary, fontSize: 12 }}>{kpi.label}</Text>
                <Text style={{ color: Colors.text, fontWeight: "800", fontSize: 18 }}>
                  {kpi.value}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Drawer overlay */}
      {drawerOpen && (
        <Pressable
          onPress={() => toggleDrawer(false)}
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.2)",
          }}
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
        <Text style={{ color: Colors.text, fontWeight: "800", fontSize: 18, marginBottom: 12 }}>
          Navigation
        </Text>
        {[
          { label: "Dashboard", onPress: () => toggleDrawer(false) },
          { label: "My Tasks", onPress: () => toggleDrawer(false) },
          { label: "Categories", onPress: () => toggleDrawer(false) },
          { label: "Settings", onPress: () => toggleDrawer(false) },
          { label: "Sign Out", onPress: () => toggleDrawer(false) },
        ].map((item) => (
          <Pressable
            key={item.label}
            onPress={item.onPress}
            style={{
              paddingVertical: 10,
              borderRadius: 8,
              paddingHorizontal: 8,
              marginBottom: 6,
            }}
          >
            <Text style={{ color: Colors.text }}>{item.label}</Text>
          </Pressable>
        ))}
      </Animated.View>
    </View>
  );
}
