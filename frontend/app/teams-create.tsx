import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, Alert, ActivityIndicator } from "react-native";
import { Colors } from "../constants/theme";
import { getTeams, saveTeams, getMemberships, saveMemberships, setCurrentTeamId } from "../lib/storage";
import { uid, joinCode } from "../lib/id";
import { HamburgerButton } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";

export default function CreateTeam() {
  const router = useRouter();
  const { user: authUser, loading: authLoading } = useAuth();
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !authUser) {
      router.replace("/login");
    }
  }, [authLoading, authUser]);

  const create = async () => {
    const nm = name.trim();
    if (!nm) {
      Alert.alert("Team name required", "Please enter a name for your team.");
      return;
    }
    
    if (!authUser) {
      Alert.alert("Not logged in", "Please log in to create a team.");
      router.replace("/login");
      return;
    }

    setCreating(true);
    const creatorUserId = String(authUser.userId);
    
    try {
      const teams = await getTeams();
      const id = uid(8);
      const code = joinCode();
      const newTeam = { 
        id, 
        name: nm, 
        code, 
        createdAt: new Date().toISOString(),
        creatorId: creatorUserId,
      };
      
      await saveTeams([newTeam, ...teams]);

      const memberships = await getMemberships();
      await saveMemberships([{ userId: creatorUserId, teamId: id }, ...memberships]);
      await setCurrentTeamId(id);
      
      setCreating(false);
      
      Alert.alert(
        "Team Created!",
        `Your team "${nm}" has been created.\n\nShare code: ${code}`,
        [{ text: "Go to Team", onPress: () => router.replace(`/team-dashboard/${id}`) }]
      );
    } catch (error) {
      console.error("Error creating team:", error);
      setCreating(false);
      Alert.alert("Error", "Failed to create team. Please try again.");
    }
  };

  if (authLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!authUser) return null;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* Header */}
      <View style={{
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        backgroundColor: Colors.surface,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
      }}>
        <HamburgerButton />
        <Text style={{ color: Colors.primary, fontSize: 20, fontWeight: "700" }}>Create Team</Text>
      </View>

      {/* Content */}
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 16 }}>
        <View style={{ 
          width: "100%", 
          maxWidth: 500, 
          backgroundColor: Colors.surface, 
          borderWidth: 1, 
          borderColor: Colors.border, 
          borderRadius: 16, 
          padding: 24,
        }}>
          <Text style={{ color: Colors.text, fontWeight: "700", fontSize: 22, marginBottom: 8, textAlign: "center" }}>
            Create a New Team
          </Text>
          
          <Text style={{ color: Colors.secondary, fontSize: 14, marginBottom: 24, textAlign: "center" }}>
            You'll be the team owner
          </Text>

          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: Colors.text, marginBottom: 8 }}>
              Team Name <Text style={{ color: "#ef4444" }}>*</Text>
            </Text>
            <TextInput 
              placeholder="e.g., CSUF 332 Project Team" 
              value={name} 
              onChangeText={setName}
              autoFocus
              editable={!creating}
              style={{ 
                borderWidth: 1, 
                borderColor: Colors.border, 
                borderRadius: 10, 
                backgroundColor: "#FAFAFA", 
                paddingHorizontal: 14, 
                paddingVertical: 12,
                fontSize: 15,
                opacity: creating ? 0.6 : 1,
              }} 
            />
          </View>

          <View style={{ flexDirection: "row", gap: 12 }}>
            <Pressable 
              onPress={() => router.back()} 
              disabled={creating}
              style={{ 
                flex: 1,
                paddingVertical: 12, 
                borderRadius: 8,
                borderWidth: 1,
                borderColor: Colors.border,
                backgroundColor: "white",
                opacity: creating ? 0.6 : 1,
              }}
            >
              <Text style={{ color: Colors.text, textAlign: "center", fontWeight: "600", fontSize: 15 }}>Cancel</Text>
            </Pressable>

            <Pressable 
              onPress={create} 
              disabled={creating}
              style={{ 
                flex: 1,
                backgroundColor: creating ? "#94A3B8" : Colors.primary, 
                paddingVertical: 12, 
                borderRadius: 8,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {creating && <ActivityIndicator size="small" color="white" />}
              <Text style={{ color: "white", textAlign: "center", fontWeight: "700", fontSize: 15 }}>
                {creating ? "Creating..." : "Create Team"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}