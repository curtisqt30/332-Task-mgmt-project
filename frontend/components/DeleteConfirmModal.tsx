import { View, Text, Pressable, Modal } from "react-native";
import { Colors } from "@/constants/theme";

type DeleteConfirmModalProps = {
  visible: boolean;
  taskTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function DeleteConfirmModal({
  visible,
  taskTitle,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
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
          borderRadius: 12,
          width: "100%",
          maxWidth: 400,
          padding: 24,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 8,
        }}>
          {/* Icon */}
          <View style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: "#FEE2E2",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
            alignSelf: "center",
          }}>
            <Text style={{ fontSize: 24 }}>⚠️</Text>
          </View>

          {/* Title */}
          <Text style={{
            fontSize: 18,
            fontWeight: "700",
            color: Colors.text,
            textAlign: "center",
            marginBottom: 12,
          }}>
            Delete Task
          </Text>

          {/* Message */}
          <Text style={{
            fontSize: 15,
            color: Colors.secondary,
            textAlign: "center",
            marginBottom: 24,
            lineHeight: 22,
          }}>
            Are you sure you want to delete "{taskTitle}"? This action cannot be undone.
          </Text>

          {/* Buttons */}
          <View style={{
            flexDirection: "row",
            gap: 12,
          }}>
            <Pressable
              onPress={onCancel}
              style={{
                flex: 1,
                paddingVertical: 12,
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
                textAlign: "center",
              }}>
                Cancel
              </Text>
            </Pressable>

            <Pressable
              onPress={onConfirm}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 8,
                backgroundColor: "#ef4444",
              }}
            >
              <Text style={{
                color: "white",
                fontWeight: "600",
                fontSize: 15,
                textAlign: "center",
              }}>
                Delete
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}