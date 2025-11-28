import { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, Modal, ScrollView } from "react-native";
import { Colors } from "@/constants/theme";
import DeleteConfirmModal from "./DeleteConfirmModal";
import DatePicker from "./DatePicker";
import type { Task, Status } from "./types";

type TaskModalProps = {
  visible: boolean;
  mode: "create" | "edit";
  task?: Task | null; // For edit mode
  onClose: () => void;
  onSave: (data: {
    title: string;
    description?: string | null;
    due?: string | null;
    status?: Status;
    assignees?: string[]; // TODO: Implement assignee selection based on team roster
  }) => void;
  onDelete?: (taskId: Task["id"]) => void; // For delete in edit mode
  teamMode?: boolean; // TODO: When true, show assignee selection
};

export default function TaskModal({
  visible,
  mode,
  task,
  onClose,
  onSave,
  onDelete,
  teamMode = false,
}: TaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState<Status>("Pending");
  const [errors, setErrors] = useState<{ title?: string; due?: string }>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (visible) {
      if (mode === "edit" && task) {
        setTitle(task.title);
        setDescription(task.description || "");
        setDueDate(task.due || "");
        setStatus(task.status);
      } else {
        // Reset for create mode
        setTitle("");
        setDescription("");
        setDueDate("");
        setStatus("Pending");
      }
      setErrors({});
    }
  }, [visible, mode, task]);

  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    if (!title.trim()) {
      newErrors.title = "Title is required";
    }
    
    if (dueDate && !isValidDate(dueDate)) {
      newErrors.due = "Please enter a valid date (YYYY-MM-DD)";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidDate = (dateString: string) => {
    if (!dateString) return true; // Empty is valid (optional)
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const data = {
      title: title.trim(),
      description: description.trim() || null,
      due: dueDate.trim() || null,
      status: mode === "edit" ? status : undefined,
      // TODO: Add assignees when implementing team features
      // assignees: selectedAssignees,
    };

    onSave(data);
    handleClose();
  };

  const handleDelete = () => {
    if (!task) return;
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (task) {
      onDelete?.(task.id);
      setShowDeleteConfirm(false);
      handleClose();
    }
  };

  const handleClose = () => {
    setTitle("");
    setDescription("");
    setDueDate("");
    setStatus("Pending");
    setErrors({});
    onClose();
  };

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString + "T00:00:00");
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={{
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}>
        <View style={{
          backgroundColor: Colors.surface,
          borderRadius: 16,
          width: "100%",
          maxWidth: 500,
          maxHeight: "90%",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 8,
        }}>
          {/* Header */}
          <View style={{
            padding: 20,
            borderBottomWidth: 1,
            borderBottomColor: Colors.border,
          }}>
            <Text style={{
              fontSize: 22,
              fontWeight: "700",
              color: Colors.primary,
            }}>
              {mode === "create" ? "Create New Task" : "Edit Task"}
            </Text>
          </View>

          {/* Form Content */}
          <ScrollView style={{ padding: 20 }} showsVerticalScrollIndicator={false}>
            {/* Title Input */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{
                fontSize: 14,
                fontWeight: "600",
                color: Colors.text,
                marginBottom: 8,
              }}>
                Title <Text style={{ color: "#ef4444" }}>*</Text>
              </Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Enter task title"
                placeholderTextColor={Colors.secondary}
                style={{
                  borderWidth: 1,
                  borderColor: errors.title ? "#ef4444" : Colors.border,
                  borderRadius: 10,
                  padding: 12,
                  fontSize: 15,
                  backgroundColor: "#FAFAFA",
                  color: Colors.text,
                }}
              />
              {errors.title && (
                <Text style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>
                  {errors.title}
                </Text>
              )}
            </View>

            {/* Description Input */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{
                fontSize: 14,
                fontWeight: "600",
                color: Colors.text,
                marginBottom: 8,
              }}>
                Description
              </Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Add task details (optional)"
                placeholderTextColor={Colors.secondary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                style={{
                  borderWidth: 1,
                  borderColor: Colors.border,
                  borderRadius: 10,
                  padding: 12,
                  fontSize: 15,
                  minHeight: 100,
                  backgroundColor: "#FAFAFA",
                  color: Colors.text,
                }}
              />
            </View>

            {/* Due Date Input */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{
                fontSize: 14,
                fontWeight: "600",
                color: Colors.text,
                marginBottom: 8,
              }}>
                Due Date
              </Text>
              <Pressable
                onPress={() => setShowDatePicker(true)}
                style={{
                  borderWidth: 1,
                  borderColor: errors.due ? "#ef4444" : Colors.border,
                  borderRadius: 10,
                  padding: 12,
                  backgroundColor: "#FAFAFA",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={{
                  fontSize: 15,
                  color: dueDate ? Colors.text : Colors.secondary,
                }}>
                  {dueDate ? formatDisplayDate(dueDate) : "Select a due date"}
                </Text>
                <Text style={{ fontSize: 18 }}>📅</Text>
              </Pressable>
              {dueDate && (
                <Pressable
                  onPress={() => setDueDate("")}
                  style={{
                    marginTop: 8,
                    alignSelf: "flex-start",
                  }}
                >
                  <Text style={{
                    color: Colors.accent,
                    fontSize: 13,
                    textDecorationLine: "underline",
                  }}>
                    Clear date
                  </Text>
                </Pressable>
              )}
              {errors.due && (
                <Text style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>
                  {errors.due}
                </Text>
              )}
            </View>

            {/* Status Selection (Edit mode only) */}
            {mode === "edit" && (
              <View style={{ marginBottom: 20 }}>
                <Text style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: Colors.text,
                  marginBottom: 8,
                }}>
                  Status
                </Text>
                <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                  {(["Pending", "In Progress", "Completed"] as Status[]).map((s) => (
                    <Pressable
                      key={s}
                      onPress={() => setStatus(s)}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderRadius: 20,
                        borderWidth: 2,
                        borderColor: s === status ? 
                          s === "Pending" ? Colors.statusPending :
                          s === "In Progress" ? Colors.statusInProgress :
                          Colors.statusCompleted : Colors.border,
                        backgroundColor: s === status ?
                          s === "Pending" ? `${Colors.statusPending}20` :
                          s === "In Progress" ? `${Colors.statusInProgress}20` :
                          `${Colors.statusCompleted}20` : "transparent",
                      }}
                    >
                      <Text style={{
                        color: s === status ?
                          s === "Pending" ? Colors.statusPending :
                          s === "In Progress" ? Colors.statusInProgress :
                          Colors.statusCompleted : Colors.text,
                        fontWeight: s === status ? "700" : "500",
                      }}>
                        {s}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {/* TODO: Assignee Selection for Team Mode */}
            {teamMode && (
              <View style={{
                padding: 16,
                backgroundColor: "#F0F9FF",
                borderRadius: 10,
                marginBottom: 20,
              }}>
                <Text style={{ color: Colors.secondary, fontSize: 13 }}>
                  TODO: Add assignee selection based on team roster
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Footer Buttons */}
          <View style={{
            padding: 20,
            borderTopWidth: 1,
            borderTopColor: Colors.border,
            flexDirection: "row",
            justifyContent: mode === "edit" ? "space-between" : "flex-end",
            gap: 12,
          }}>
            {/* Delete button (Edit mode only, left side) */}
            {mode === "edit" && onDelete && (
              <Pressable
                onPress={handleDelete}
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: "#ef4444",
                  backgroundColor: "white",
                }}
              >
                <Text style={{
                  color: "#ef4444",
                  fontWeight: "600",
                  fontSize: 15,
                }}>
                  Delete Task
                </Text>
              </Pressable>
            )}

            {/* Right side buttons container */}
            <View style={{
              flexDirection: "row",
              gap: 12,
              marginLeft: mode === "edit" ? "auto" : 0,
            }}>
              <Pressable
                onPress={handleClose}
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: Colors.border,
                  backgroundColor: "white",
                }}
              >
                <Text style={{
                  color: Colors.text,
                  fontWeight: "600",
                  fontSize: 15,
                }}>
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                onPress={handleSave}
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 8,
                  backgroundColor: Colors.primary,
                }}
              >
                <Text style={{
                  color: "white",
                  fontWeight: "600",
                  fontSize: 15,
                }}>
                  {mode === "create" ? "Create Task" : "Save Changes"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        visible={showDeleteConfirm}
        taskTitle={task?.title || ""}
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      {/* Date Picker Modal */}
      <DatePicker
        visible={showDatePicker}
        selectedDate={dueDate || null}
        onSelectDate={(date) => {
          setDueDate(date || "");
          setShowDatePicker(false);
        }}
        onClose={() => setShowDatePicker(false)}
      />
    </Modal>
  );
}