import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, Alert, ActivityIndicator } from "react-native";
import { Colors } from "../constants/theme";
import { HamburgerButton } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";

const API = process.env.EXPO_PUBLIC_API_BASE ?? "http://localhost:8000";

export default function CreateTeam() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user]);

  const create = async () => {
    if (!name.trim()) { Alert.alert("Required", "Enter a team name"); return; }
    setCreating(true);
    try {
      const res = await fetch(`${API}/api/teams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamName: name.trim() }),
        credentials: "include"
      });
      if (res.status === 401) { router.replace("/login"); return; }
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      Alert.alert("Created!", `Code: ${data.joinCode}`, [{ text: "OK", onPress: () => router.replace(`/team-dashboard/${data.teamID}`) }]);
    } catch (e) { Alert.alert("Error", "Failed to create team"); }
    finally { setCreating(false); }
  };

  if (authLoading || !user) return null;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={{ paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface, flexDirection: "row", alignItems: "center", gap: 12 }}>
        <HamburgerButton />
        <Text style={{ color: Colors.primary, fontSize: 20, fontWeight: "700" }}>Create Team</Text>
      </View>

      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 16 }}>
        <View style={{ width: "100%", maxWidth: 400, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: 24 }}>
          <Text style={{ fontWeight: "600", marginBottom: 8 }}>Team Name</Text>
          <TextInput value={name} onChangeText={setName} placeholder="Enter team name" style={{ borderWidth: 1, borderColor: Colors.border, borderRadius: 8, padding: 12, marginBottom: 20 }} />
          <View style={{ flexDirection: "row", gap: 12 }}>
            <Pressable onPress={() => router.back()} style={{ flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: Colors.border }}>
              <Text style={{ textAlign: "center" }}>Cancel</Text>
            </Pressable>
            <Pressable onPress={create} disabled={creating} style={{ flex: 1, padding: 12, borderRadius: 8, backgroundColor: Colors.primary }}>
              {creating ? <ActivityIndicator color="white" /> : <Text style={{ color: "white", textAlign: "center", fontWeight: "600" }}>Create</Text>}
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}