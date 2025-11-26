import { useState } from "react";
import { View, Text, TextInput, Pressable, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";

export default function Register() {
  const router = useRouter();
  const { register } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!username.trim() || !password.trim() || !confirm.trim()) {
      Alert.alert("Missing fields", "Please fill out all fields.");
      return;
    }
    
    if (password !== confirm) {
      Alert.alert("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await register(username, password);
      Alert.alert("Success!", "Account created", [{ text: "OK", onPress: () => router.replace("/dashboard") }]);
    } catch (error: any) {
      Alert.alert("Registration Failed", error.message || "Username may be taken");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.background, paddingHorizontal: 24 }}>
      <View style={{ width: "100%", maxWidth: 400, backgroundColor: Colors.surface, borderRadius: 12, padding: 24, borderWidth: 2, borderColor: Colors.primary }}>
        <Text style={{ fontSize: 28, fontWeight: "700", color: Colors.primary, textAlign: "center", marginBottom: 20 }}>
          Create Account
        </Text>

        <Text style={{ marginBottom: 6, color: Colors.text, fontWeight: "600" }}>Username</Text>
        <TextInput
          style={{ borderWidth: 1, borderColor: Colors.border, borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 15 }}
          placeholder="Choose a username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          editable={!loading}
        />

        <Text style={{ marginBottom: 6, color: Colors.text, fontWeight: "600" }}>Password</Text>
        <TextInput
          style={{ borderWidth: 1, borderColor: Colors.border, borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 15 }}
          placeholder="Create a password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          editable={!loading}
        />

        <Text style={{ marginBottom: 6, color: Colors.text, fontWeight: "600" }}>Confirm Password</Text>
        <TextInput
          style={{ borderWidth: 1, borderColor: Colors.border, borderRadius: 8, padding: 12, marginBottom: 24, fontSize: 15 }}
          placeholder="Re-enter password"
          secureTextEntry
          value={confirm}
          onChangeText={setConfirm}
          editable={!loading}
        />

        <Pressable
          onPress={handleRegister}
          disabled={loading}
          style={{ backgroundColor: loading ? "#94A3B8" : Colors.primary, paddingVertical: 12, borderRadius: 8, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8 }}
        >
          {loading && <ActivityIndicator color="white" />}
          <Text style={{ color: "white", fontWeight: "600", textAlign: "center", fontSize: 16 }}>
            {loading ? "Creating account..." : "Register"}
          </Text>
        </Pressable>

        <Pressable onPress={() => router.push("/login")} style={{ marginTop: 16 }} disabled={loading}>
          <Text style={{ textAlign: "center", color: Colors.accent, fontWeight: "500" }}>
            Already have an account? Log in
          </Text>
        </Pressable>
      </View>
    </View>
  );
}