import { useEffect, useState, useCallback } from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Colors } from "../constants/theme";
import { HamburgerButton } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";

const API = process.env.EXPO_PUBLIC_API_BASE ?? "http://localhost:8000";

type Team = { teamID: number; teamName: string; joinCode: string };

export default function TeamsHub() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user]);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/teams`, { credentials: "include" });
      if (res.status === 401) { router.replace("/login"); return; }
      if (res.ok) setTeams(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [user]);

  useFocusEffect(useCallback(() => { if (user) loadData(); }, [user, loadData]));

  if (authLoading || !user) return null;

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface }}>
        <HamburgerButton />
        <Text style={{ color: Colors.primary, fontSize: 20, fontWeight: "700" }}>Teams</Text>
        <View style={{ marginLeft: "auto", flexDirection: "row", gap: 8 }}>
          <Pressable onPress={() => router.push("/teams-create")} style={{ backgroundColor: Colors.primary, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 8 }}>
            <Text style={{ color: "white", fontWeight: "600", fontSize: 14 }}>+ Create</Text>
          </Pressable>
          <Pressable onPress={() => router.push("/teams-join")} style={{ paddingHorizontal: 14, paddingVertical: 9, borderRadius: 8, borderWidth: 1, borderColor: Colors.border, backgroundColor: "#fff" }}>
            <Text style={{ color: Colors.text, fontWeight: "600", fontSize: 14 }}>Join</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}>
        {teams.length === 0 ? (
          <View style={{ backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: 24, alignItems: "center" }}>
            <Text style={{ color: Colors.text, fontWeight: "600", marginBottom: 4 }}>No Teams Yet</Text>
            <Text style={{ color: Colors.secondary, textAlign: "center" }}>Create or join a team to get started</Text>
          </View>
        ) : teams.map(t => (
          <Pressable key={t.teamID} onPress={() => router.push(`/team-dashboard/${t.teamID}`)} style={{ backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: 16, flexDirection: "row", alignItems: "center" }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: Colors.text, fontWeight: "700", fontSize: 16 }}>{t.teamName}</Text>
              <Text style={{ color: Colors.secondary, fontSize: 12 }}>Code: {t.joinCode}</Text>
            </View>
            <Text style={{ color: Colors.secondary, fontSize: 18 }}>→</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}