import { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { useRouter, Link } from "expo-router";
import { Colors } from "../constants/theme";
import { getUser, setUser, getTeams, getMemberships, setCurrentTeamId, type Team } from "../../../lib/storage";
import { uid, initialsFromName } from "../lib/id";

export default function TeamsHub() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [initials, setInitials] = useState("U");
  const [userId, setUserId] = useState<string | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [myTeamIds, setMyTeamIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const u = await getUser();
      const t = await getTeams();
      const m = await getMemberships();
      if (u) {
        setUserId(u.id); setName(u.name); setInitials(u.initials);
        setMyTeamIds(m.filter(x => x.userId === u.id).map(x => x.teamId));
      }
      setTeams(t);
      setLoading(false);
    })();
  }, []);

  const ensureIdentity = async () => {
    if (userId && name.trim()) return userId;
    const id = userId ?? uid();
    const nm = name.trim() || "User";
    const inits = initialsFromName(nm);
    await setUser({ id, name: nm, initials: inits });
    setUserId(id); setInitials(inits); setName(nm);
    return id;
  };

  const goToTeam = async (teamId: string) => {
    await setCurrentTeamId(teamId);
    router.push(`/dashboard`);
  };

  if (loading) {
    return <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Colors.background }}>
      <Text style={{ color: Colors.secondary }}>Loading…</Text>
    </View>;
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderBottomWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface }}>
        <Text style={{ color: Colors.primary, fontSize: 20, fontWeight: "700" }}>Teams</Text>
        <View style={{ marginLeft: "auto", flexDirection: "row", gap: 8 }}>
          <Link href="/teams-create" asChild>
            <Pressable style={{ backgroundColor: Colors.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 }}>
              <Text style={{ color: "white", fontWeight: "600" }}>+ Create Team</Text>
            </Pressable>
          </Link>
          <Link href="/teams-join" asChild>
            <Pressable style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: Colors.border, backgroundColor: "#fff" }}>
              <Text style={{ color: Colors.text }}>Join by Code</Text>
            </Pressable>
          </Link>
        </View>
      </View>

      {/* Identity */}
      <View style={{ padding: 16, borderBottomWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface, gap: 8 }}>
        <Text style={{ color: Colors.text, fontWeight: "700" }}>Your Display Name</Text>
        <TextInput
          value={name}
          onChangeText={(v) => { setName(v); setInitials(initialsFromName(v)); }}
          onBlur={ensureIdentity}
          placeholder="e.g., Curtis Tran"
          style={{ borderWidth: 1, borderColor: Colors.border, borderRadius: 8, backgroundColor: "white", paddingHorizontal: 12, paddingVertical: 8, maxWidth: 420 }}
        />
        <Text style={{ color: Colors.secondary }}>Initials: <Text style={{ fontWeight: "700", color: Colors.text }}>{initials}</Text></Text>
      </View>

      {/* Your teams */}
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <Text style={{ color: Colors.text, fontWeight: "700", marginBottom: 6 }}>Your Teams</Text>
        {teams.filter(t => myTeamIds.includes(t.id)).length === 0 ? (
          <Text style={{ color: Colors.secondary }}>You’re not in any teams yet.</Text>
        ) : (
          teams.filter(t => myTeamIds.includes(t.id)).map((t) => (
            <Pressable key={t.id} onPress={() => goToTeam(t.id)} style={{ backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: 12 }}>
              <Text style={{ color: Colors.text, fontWeight: "700" }}>{t.name}</Text>
              <Text style={{ color: Colors.secondary, fontSize: 12 }}>ID: {t.id} • Code: {t.code}</Text>
            </Pressable>
          ))
        )}

        {/* Demo list of all teams */}
        {teams.length > 0 && <Text style={{ color: Colors.secondary, marginTop: 16 }}>All teams (demo):</Text>}
        {teams.map(t => (
          <Pressable key={t.id} onPress={() => goToTeam(t.id)} style={{ borderWidth: 1, borderColor: Colors.border, borderRadius: 8, padding: 8, backgroundColor: "#fff", marginTop: 6 }}>
            <Text style={{ color: Colors.text }}>{t.name}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
