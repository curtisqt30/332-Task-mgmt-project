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
  currentUserId?: number;
  onAssign?: (taskId: Task["id"], userID: number) => void;
  onUnassign?: (taskId: Task["id"], userID: number) => void;
};

const stringToColor = (str: string): string => {
  const colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4"];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

export default function TaskModal({ 
  visible, 
  mode, 
  task, 
  onClose, 
  onSave, 
  onDelete, 
  teamMode, 
  teamMembers = [], 
  currentUserId,
  onAssign, 
  onUnassign 
}: TaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState<Status>("Pending");
  const [errors, setErrors] = useState<{ title?: string }>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showAssignDropdown, setShowAssignDropdown] = useState(false);

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
      setShowAssignDropdown(false);
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

  // Check if current user is assigned
  const isSelfAssigned = currentUserId ? currentAssigneeIds.includes(currentUserId) : false;

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

            {/* Assignment Section (team mode, edit only) */}
            {teamMode && mode === "edit" && task && teamMembers.length > 0 && (
              <>
                <Text style={{ fontWeight: "600", marginBottom: 6 }}>Assigned</Text>
                
                {/* Quick self-assign button */}
                {currentUserId && (
                  <Pressable 
                    onPress={() => toggleAssignee(currentUserId)}
                    style={{ 
                      flexDirection: "row", 
                      alignItems: "center", 
                      gap: 8, 
                      padding: 10, 
                      borderWidth: 1, 
                      borderColor: isSelfAssigned ? Colors.primary : Colors.border, 
                      borderRadius: 8, 
                      marginBottom: 8,
                      backgroundColor: isSelfAssigned ? Colors.primary + "10" : "white"
                    }}
                  >
                    <Text style={{ flex: 1, color: Colors.text }}>
                      {isSelfAssigned ? "✓ Assigned to me" : "Assign to myself"}
                    </Text>
                    <Text style={{ color: isSelfAssigned ? Colors.primary : Colors.secondary }}>
                      {isSelfAssigned ? "Remove" : "Add"}
                    </Text>
                  </Pressable>
                )}

                {/* Dropdown toggle */}
                <Pressable 
                  onPress={() => setShowAssignDropdown(!showAssignDropdown)}
                  style={{ 
                    flexDirection: "row", 
                    alignItems: "center", 
                    justifyContent: "space-between",
                    padding: 10, 
                    borderWidth: 1, 
                    borderColor: Colors.border, 
                    borderRadius: 8,
                    marginBottom: showAssignDropdown ? 0 : 16,
                    borderBottomLeftRadius: showAssignDropdown ? 0 : 8,
                    borderBottomRightRadius: showAssignDropdown ? 0 : 8,
                  }}
                >
                  <Text style={{ color: Colors.text }}>
                    {currentAssigneeIds.length === 0 
                      ? "No one assigned" 
                      : `${currentAssigneeIds.length} assigned`}
                  </Text>
                  <Text style={{ color: Colors.secondary }}>{showAssignDropdown ? "▲" : "▼"}</Text>
                </Pressable>

                {/* Dropdown list */}
                {showAssignDropdown && (
                  <View style={{ 
                    borderWidth: 1, 
                    borderTopWidth: 0,
                    borderColor: Colors.border, 
                    borderBottomLeftRadius: 8,
                    borderBottomRightRadius: 8,
                    marginBottom: 16,
                    maxHeight: 200,
                  }}>
                    <ScrollView nestedScrollEnabled>
                      {teamMembers.map(m => {
                        const isAssigned = currentAssigneeIds.includes(m.userID);
                        const isMe = m.userID === currentUserId;
                        return (
                          <Pressable 
                            key={m.userID} 
                            onPress={() => toggleAssignee(m.userID)}
                            style={{ 
                              flexDirection: "row", 
                              alignItems: "center", 
                              gap: 10, 
                              padding: 10,
                              borderBottomWidth: 1,
                              borderBottomColor: Colors.border,
                              backgroundColor: isAssigned ? Colors.primary + "08" : "white"
                            }}
                          >
                            <View style={{ 
                              width: 28, 
                              height: 28, 
                              borderRadius: 14, 
                              backgroundColor: stringToColor(m.userName), 
                              alignItems: "center", 
                              justifyContent: "center" 
                            }}>
                              <Text style={{ color: "white", fontSize: 11, fontWeight: "700" }}>
                                {m.userName.substring(0, 2).toUpperCase()}
                              </Text>
                            </View>
                            <Text style={{ flex: 1, color: Colors.text }}>
                              {m.userName}{isMe ? " (me)" : ""}
                            </Text>
                            {m.role === "owner" && (
                              <Text style={{ fontSize: 10, color: Colors.secondary, backgroundColor: "#F1F5F9", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                                Owner
                              </Text>
                            )}
                            <View style={{ 
                              width: 20, 
                              height: 20, 
                              borderRadius: 4, 
                              borderWidth: 1, 
                              borderColor: isAssigned ? Colors.primary : Colors.border,
                              backgroundColor: isAssigned ? Colors.primary : "white",
                              alignItems: "center",
                              justifyContent: "center"
                            }}>
                              {isAssigned && <Text style={{ color: "white", fontSize: 12 }}>✓</Text>}
                            </View>
                          </Pressable>
                        );
                      })}
                    </ScrollView>
                  </View>
                )}

                {/* Show current assignees */}
                {!showAssignDropdown && currentAssigneeIds.length > 0 && (
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 16, marginTop: -8 }}>
                    {task.assignees?.map(a => (
                      <View key={a.id} style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#F1F5F9", paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12 }}>
                        <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: a.color, alignItems: "center", justifyContent: "center" }}>
                          <Text style={{ color: "white", fontSize: 8, fontWeight: "700" }}>{a.initials}</Text>
                        </View>
                        <Text style={{ fontSize: 12, color: Colors.text }}>{a.name}</Text>
                      </View>
                    ))}
                  </View>
                )}
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