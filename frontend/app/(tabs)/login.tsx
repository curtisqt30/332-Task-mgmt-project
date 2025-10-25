import { useState } from "react";
import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/theme";

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (username === "test" && password === "test") {
      router.push("/dashboard");
    } else {
      Alert.alert("Invalid credentials", "Try username: test, password: test");
    }
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
          height: 520, // extended height
          backgroundColor: Colors.surface,
          borderRadius: 12,
          padding: 24,
          borderWidth: 2, // thicker border for stronger visual
          borderColor: Colors.primary, // use theme accent
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
          Task Manager Login
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
          placeholder="Enter username"
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
            marginBottom: 24,
          }}
          placeholder="Enter password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Pressable
          onPress={handleLogin}
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
            Log In
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.push("/register")}
          style={{ marginTop: 16 }}
        >
          <Text
            style={{
              textAlign: "center",
              color: Colors.accent,
              fontWeight: "500",
            }}
          >
            Don’t have an account? Register
          </Text>
        </Pressable>

        <Text
          style={{
            textAlign: "center",
            color: Colors.secondary,
            marginTop: 16,
            fontSize: 13,
          }}
        >
          Username: test | Password: test
        </Text>
      </View>
    </View>
  );
}
