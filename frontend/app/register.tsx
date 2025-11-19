import { useState } from "react";
import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/theme";

export default function Register() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleRegister = () => {
    if (!username || !password || !confirm) {
      Alert.alert("Missing fields", "Please fill out all fields.");
      return;
    }
    if (password !== confirm) {
      Alert.alert("Passwords do not match");
      return;
    }
    Alert.alert("Registration successful!", "You can now log in.", [
      { text: "OK", onPress: () => router.push("/login") },
    ]);
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.background,
        paddingHorizontal: 24,
      }}
    >
      <View
        style={{
          width: "100%",
          maxWidth: 400,
          height: 560, // taller form
          backgroundColor: Colors.surface,
          borderRadius: 12,
          padding: 24,
          borderWidth: 2,
          borderColor: Colors.primary,
          shadowColor: "#000",
          shadowOpacity: 0.05,
          shadowOffset: { width: 0, height: 2 },
          shadowRadius: 4,
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            fontSize: 28,
            fontWeight: "700",
            color: Colors.primary,
            textAlign: "center",
            marginBottom: 20,
          }}
        >
          Create Account
        </Text>

        <Text style={{ marginBottom: 6, color: Colors.text }}>Username</Text>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: Colors.border,
            borderRadius: 8,
            padding: 10,
            marginBottom: 16,
          }}
          placeholder="Choose a username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        <Text style={{ marginBottom: 6, color: Colors.text }}>Password</Text>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: Colors.border,
            borderRadius: 8,
            padding: 10,
            marginBottom: 16,
          }}
          placeholder="Create a password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Text style={{ marginBottom: 6, color: Colors.text }}>
          Confirm Password
        </Text>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: Colors.border,
            borderRadius: 8,
            padding: 10,
            marginBottom: 24,
          }}
          placeholder="Re-enter password"
          secureTextEntry
          value={confirm}
          onChangeText={setConfirm}
        />

        <Pressable
          onPress={handleRegister}
          style={{
            backgroundColor: Colors.primary,
            paddingVertical: 12,
            borderRadius: 8,
          }}
        >
          <Text
            style={{
              color: "white",
              fontWeight: "600",
              textAlign: "center",
              fontSize: 16,
            }}
          >
            Register
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.push("/login")}
          style={{ marginTop: 16 }}
        >
          <Text
            style={{
              textAlign: "center",
              color: Colors.accent,
              fontWeight: "500",
            }}
          >
            Already have an account? Log in
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
