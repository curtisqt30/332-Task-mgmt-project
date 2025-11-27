import { useState } from "react";
import { View, Text, TextInput, Pressable, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert("Missing fields", "Please enter both username and password.");
      return;
    }

    setLoading(true);
    try {
      await login(username, password);
      router.replace("/dashboard");
    } catch (error: any) {
      Alert.alert("Login Failed", error.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleClearStorage = async () => {
    Alert.alert(
      "Clear App Data",
      "This will delete all local data including teams. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear Data",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              Alert.alert("Success", "App data cleared. Please restart the app.");
            } catch (error) {
              Alert.alert("Error", "Failed to clear storage");
            }
          },
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.background, paddingHorizontal: 24 }}>
      <View style={{ width: "100%", maxWidth: 400, backgroundColor: Colors.surface, borderRadius: 12, padding: 24, borderWidth: 2, borderColor: Colors.primary }}>
        <Text style={{ fontSize: 28, fontWeight: "700", color: Colors.primary, textAlign: "center", marginBottom: 20 }}>
          Task Manager Login
        </Text>

        <Text style={{ marginBottom: 6, color: Colors.text, fontWeight: "600" }}>Username</Text>
        <TextInput
          style={{ borderWidth: 1, borderColor: Colors.border, borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 15 }}
          placeholder="Enter username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          editable={!loading}
        />

        <Text style={{ marginBottom: 6, color: Colors.text, fontWeight: "600" }}>Password</Text>
        <TextInput
          style={{ borderWidth: 1, borderColor: Colors.border, borderRadius: 8, padding: 12, marginBottom: 24, fontSize: 15 }}
          placeholder="Enter password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          editable={!loading}
        />

        <Pressable
          onPress={handleLogin}
          disabled={loading}
          style={{ backgroundColor: loading ? "#94A3B8" : Colors.primary, paddingVertical: 12, borderRadius: 8, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8, marginBottom: 12 }}
        >
          {loading && <ActivityIndicator color="white" />}
          <Text style={{ color: "white", fontWeight: "600", textAlign: "center", fontSize: 16 }}>
            {loading ? "Logging in..." : "Log In"}
          </Text>
        </Pressable>

        <Pressable onPress={() => router.push("/register")} style={{ marginBottom: 16 }} disabled={loading}>
          <Text style={{ textAlign: "center", color: Colors.accent, fontWeight: "500" }}>
            Don't have an account? Register
          </Text>
        </Pressable>

        {/* Clear Storage Button */}
        <View style={{ borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 16, marginTop: 8 }}>
          <Pressable
            onPress={handleClearStorage}
            disabled={loading}
            style={{ 
              backgroundColor: "#fee2e2", 
              paddingVertical: 10, 
              borderRadius: 8,
              borderWidth: 1,
              borderColor: "#fecaca",
            }}
          >
            <Text style={{ color: "#dc2626", fontWeight: "600", textAlign: "center", fontSize: 14 }}>
              Clear App Data
            </Text>
          </Pressable>
          <Text style={{ textAlign: "center", color: Colors.secondary, fontSize: 11, marginTop: 6 }}>
            Use this if you're having issues with teams or data
          </Text>
        </View>
      </View>
    </View>
  );
}