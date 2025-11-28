import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, Alert, ActivityIndicator } from "react-native";
import { Colors } from "../constants/theme";
import { HamburgerButton } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";

const API = process.env.EXPO_PUBLIC_API_BASE ?? "http://localhost:8000";

export default function JoinTeam() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [code, setCode] = useState("");
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user]);

  const join = async () => {
    const c = code.trim().toUpperCase();
    if (c.length !== 6) { Alert.alert("Invalid", "Enter a 6-character code"); return; }
    setJoining(true);
    try {
      const res = await fetch(`${API}/api/teams/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ joinCode: c }),
        credentials: "include"
      });
      if (res.status === 401) { router.replace("/login"); return; }
      if (res.status === 404) { Alert.alert("Not Found", "No team with this code"); setJoining(false); return; }
      if (res.status === 400) { Alert.alert("Already Member", "You're already in this team"); router.replace("/teams"); return; }
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      Alert.alert("Joined!", `Welcome to ${data.teamName}`, [{ text: "OK", onPress: () => router.replace("/teams") }]);
    } catch (e) { Alert.alert("Error", "Failed to join"); }
    finally { setJoining(false); }
  };

  if (authLoading || !user) return null;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={{ paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface, flexDirection: "row", alignItems: "center", gap: 12 }}>
        <HamburgerButton />
        <Text style={{ color: Colors.primary, fontSize: 20, fontWeight: "700" }}>Join Team</Text>
      </View>

      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 16 }}>
        <View style={{ width: "100%", maxWidth: 400, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: 24 }}>
          <Text style={{ fontWeight: "600", marginBottom: 8 }}>Join Code</Text>
          <TextInput value={code} onChangeText={setCode} placeholder="XXXXXX" autoCapitalize="characters" maxLength={6} style={{ borderWidth: 1, borderColor: Colors.border, borderRadius: 8, padding: 12, marginBottom: 20, textAlign: "center", fontSize: 18, letterSpacing: 4 }} />
          <View style={{ flexDirection: "row", gap: 12 }}>
            <Pressable onPress={() => router.back()} style={{ flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: Colors.border }}>
              <Text style={{ textAlign: "center" }}>Cancel</Text>
            </Pressable>
            <Pressable onPress={join} disabled={joining} style={{ flex: 1, padding: 12, borderRadius: 8, backgroundColor: Colors.primary }}>
              {joining ? <ActivityIndicator color="white" /> : <Text style={{ color: "white", textAlign: "center", fontWeight: "600" }}>Join</Text>}
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}