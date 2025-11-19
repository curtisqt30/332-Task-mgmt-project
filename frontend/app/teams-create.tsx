import { useRouter } from "expo-router";
import { useState } from "react";
import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { Colors } from "../constants/theme";
import { getTeams, saveTeams, getUser, getMemberships, saveMemberships, setCurrentTeamId } from "../../../lib/storage";
import { uid, joinCode } from "../lib/id";

export default function CreateTeam() {
  const router = useRouter();
  const [name, setName] = useState("");

  const create = async () => {
    const nm = name.trim();
    if (!nm) return;
    const user = await getUser();
    if (!user) {
      Alert.alert("Set your display name first on the Teams page.");
      return;
    }
    const teams = await getTeams();
    const id = uid(8);
    const code = joinCode();
    const newTeam = { id, name: nm, code, createdAt: new Date().toISOString() };
    await saveTeams([newTeam, ...teams]);

    const memberships = await getMemberships();
    await saveMemberships([{ userId: user.id, teamId: id }, ...memberships]);
    await setCurrentTeamId(id);
    router.replace(`/dashboard`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background, alignItems: "center", justifyContent: "center", padding: 16 }}>
      <View style={{ width: "100%", maxWidth: 420, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: 16 }}>
        <Text style={{ color: Colors.primary, fontWeight: "800", fontSize: 20, marginBottom: 12 }}>Create a Team</Text>
        <TextInput placeholder="Team name (e.g., CSUF 332)" value={name} onChangeText={setName} style={{ borderWidth: 1, borderColor: Colors.border, borderRadius: 8, backgroundColor: "#fff", paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12 }} />
        <Pressable onPress={create} style={{ backgroundColor: Colors.primary, paddingVertical: 12, borderRadius: 8 }}>
          <Text style={{ color: "white", textAlign: "center", fontWeight: "700" }}>Create</Text>
        </Pressable>
      </View>
    </View>
  );
}
