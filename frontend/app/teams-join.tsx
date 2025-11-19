import { useRouter } from "expo-router";
import { useState } from "react";
import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { Colors } from "../constants/theme";
import { getUser, getTeams, getMemberships, saveMemberships, setCurrentTeamId } from "../../../lib/storage";

export default function JoinTeam() {
  const router = useRouter();
  const [code, setCode] = useState("");

  const join = async () => {
    const user = await getUser();
    if (!user) {
      Alert.alert("Set your display name first on the Teams page.");
      return;
    }
    const teams = await getTeams();
    const team = teams.find(t => t.code.toUpperCase() === code.trim().toUpperCase());
    if (!team) {
      Alert.alert("No team found for that code.");
      return;
    }
    const memberships = await getMemberships();
    const already = memberships.some(m => m.userId === user.id && m.teamId === team.id);
    if (!already) {
      memberships.unshift({ userId: user.id, teamId: team.id });
      await saveMemberships(memberships);
    }
    await setCurrentTeamId(team.id);
    router.replace(`/dashboard`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background, alignItems: "center", justifyContent: "center", padding: 16 }}>
      <View style={{ width: "100%", maxWidth: 420, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: 16 }}>
        <Text style={{ color: Colors.primary, fontWeight: "800", fontSize: 20, marginBottom: 12 }}>Join a Team</Text>
        <TextInput
          placeholder="Enter 6-char code"
          value={code}
          onChangeText={setCode}
          autoCapitalize="characters"
          style={{ borderWidth: 1, borderColor: Colors.border, borderRadius: 8, backgroundColor: "#fff", paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12, letterSpacing: 2 }}
        />
        <Pressable onPress={join} style={{ backgroundColor: Colors.primary, paddingVertical: 12, borderRadius: 8 }}>
          <Text style={{ color: "white", textAlign: "center", fontWeight: "700" }}>Join</Text>
        </Pressable>
      </View>
    </View>
  );
}
