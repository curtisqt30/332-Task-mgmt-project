import { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, Modal, ScrollView } from "react-native";
import { Colors } from "@/constants/theme";
import DeleteConfirmModal from "./DeleteConfirmModal";
import DatePicker from "./DatePicker";
import type { Task, Status } from "./types";

type TeamMember = { userID: number; userName: string; role: string };

type TaskModalProps = {
  visible: boolean;
  mode: "create" | "edit";
  task?: Task | null;
  onClose: () => void;
  onSave: (data: { title: string; description?: string | null; due?: string | null; status?: Status }) => void;
  onDelete?: (taskId: Task["id"]) => void;
  teamMode?: boolean;
  teamMembers?: TeamMember[];
  onAssign?: (taskId: Task["id"], userID: number) => void;
  onUnassign?: (taskId: Task["id"], userID: number) => void;
};

const stringToColor = (str: string): string => {
  const colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4"];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

export default function TaskModal({ visible, mode, task, onClose, onSave, onDelete, teamMode, teamMembers, onAssign, onUnassign }: TaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState<Status>("Pending");
  const [errors, setErrors] = useState<{ title?: string }>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (visible) {
      if (mode === "edit" && task) {
        setTitle(task.title);
        setDescription(task.description || "");
        setDueDate(task.due || "");
        setStatus(task.status);
      } else {
        setTitle(""); setDescription(""); setDueDate(""); setStatus("Pending");
      }
      setErrors({});
    }
  }, [visible, mode, task]);

  const handleSave = () => {
    if (!title.trim()) { setErrors({ title: "Required" }); return; }
    onSave({
      title: title.trim(),
      description: description.trim() || null,
      due: dueDate.trim() || null,
      status: mode === "edit" ? status : undefined
    });
    onClose();
  };

  const handleDelete = () => setShowDeleteConfirm(true);
  const confirmDelete = () => { if (task) { onDelete?.(task.id); setShowDeleteConfirm(false); onClose(); } };

  const currentAssigneeIds = (task?.assignees || []).map(a => Number(a.id));

  const toggleAssignee = (userID: number) => {
    if (!task) return;
    if (currentAssigneeIds.includes(userID)) {
      onUnassign?.(task.id, userID);
    } else {
      onAssign?.(task.id, userID);
    }
  };

  const formatDate = (d: string) => d ? new Date(d + "T00:00:00").toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : "";

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 20 }}>
        <View style={{ backgroundColor: Colors.surface, borderRadius: 16, width: "100%", maxWidth: 500, maxHeight: "90%" }}>
          <View style={{ padding: 20, borderBottomWidth: 1, borderColor: Colors.border }}>
            <Text style={{ fontSize: 20, fontWeight: "700", color: Colors.primary }}>{mode === "create" ? "Create Task" : "Edit Task"}</Text>
          </View>

          <ScrollView style={{ padding: 20 }}>
            {/* Title */}
            <Text style={{ fontWeight: "600", marginBottom: 6 }}>Title</Text>
            <TextInput value={title} onChangeText={setTitle} placeholder="Task title" style={{ borderWidth: 1, borderColor: errors.title ? "#ef4444" : Colors.border, borderRadius: 8, padding: 10, marginBottom: 16 }} />

            {/* Description */}
            <Text style={{ fontWeight: "600", marginBottom: 6 }}>Description</Text>
            <TextInput value={description} onChangeText={setDescription} placeholder="Description" multiline style={{ borderWidth: 1, borderColor: Colors.border, borderRadius: 8, padding: 10, minHeight: 60, marginBottom: 16 }} />

            {/* Due Date */}
            <Text style={{ fontWeight: "600", marginBottom: 6 }}>Due Date</Text>
            <Pressable onPress={() => setShowDatePicker(true)} style={{ borderWidth: 1, borderColor: Colors.border, borderRadius: 8, padding: 10, marginBottom: 16, flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ color: dueDate ? Colors.text : Colors.secondary }}>{dueDate ? formatDate(dueDate) : "Select date"}</Text>
              <Text>📅</Text>
            </Pressable>

            {/* Status (edit only) */}
            {mode === "edit" && (
              <>
                <Text style={{ fontWeight: "600", marginBottom: 6 }}>Status</Text>
                <View style={{ flexDirection: "row", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                  {(["Pending", "In Progress", "Completed"] as Status[]).map(s => (
                    <Pressable key={s} onPress={() => setStatus(s)} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: s === status ? Colors.primary : Colors.border, backgroundColor: s === status ? Colors.primary + "20" : "white" }}>
                      <Text style={{ color: s === status ? Colors.primary : Colors.text, fontWeight: s === status ? "600" : "400" }}>{s}</Text>
                    </Pressable>
                  ))}
                </View>
              </>
            )}

            {/* Assignees (team mode, edit only) */}
            {teamMode && mode === "edit" && teamMembers && teamMembers.length > 0 && (
              <>
                <Text style={{ fontWeight: "600", marginBottom: 6 }}>Assign To</Text>
                <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                  {teamMembers.map(m => {
                    const isAssigned = currentAssigneeIds.includes(m.userID);
                    return (
                      <Pressable key={m.userID} onPress={() => toggleAssignee(m.userID)} style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 16, borderWidth: 1, borderColor: isAssigned ? Colors.primary : Colors.border, backgroundColor: isAssigned ? Colors.primary + "15" : "white" }}>
                        <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: stringToColor(m.userName), alignItems: "center", justifyContent: "center" }}>
                          <Text style={{ color: "white", fontSize: 10, fontWeight: "700" }}>{m.userName.substring(0, 2).toUpperCase()}</Text>
                        </View>
                        <Text style={{ color: isAssigned ? Colors.primary : Colors.text }}>{m.userName}</Text>
                        {isAssigned && <Text style={{ color: Colors.primary }}>✓</Text>}
                      </Pressable>
                    );
                  })}
                </View>
              </>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={{ padding: 16, borderTopWidth: 1, borderColor: Colors.border, flexDirection: "row", justifyContent: mode === "edit" ? "space-between" : "flex-end", gap: 12 }}>
            {mode === "edit" && onDelete && (
              <Pressable onPress={handleDelete} style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: "#ef4444" }}>
                <Text style={{ color: "#ef4444", fontWeight: "600" }}>Delete</Text>
              </Pressable>
            )}
            <View style={{ flexDirection: "row", gap: 12 }}>
              <Pressable onPress={onClose} style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: Colors.border }}>
                <Text style={{ color: Colors.text }}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleSave} style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, backgroundColor: Colors.primary }}>
                <Text style={{ color: "white", fontWeight: "600" }}>{mode === "create" ? "Create" : "Save"}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>

      <DeleteConfirmModal visible={showDeleteConfirm} taskTitle={task?.title || ""} onConfirm={confirmDelete} onCancel={() => setShowDeleteConfirm(false)} />
      <DatePicker visible={showDatePicker} selectedDate={dueDate || null} onSelectDate={(d) => { setDueDate(d || ""); setShowDatePicker(false); }} onClose={() => setShowDatePicker(false)} />
    </Modal>
  );
}