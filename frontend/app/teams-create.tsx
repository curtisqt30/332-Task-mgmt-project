import { useRouter } from "expo-router";
import { useState } from "react";
import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { Colors } from "../constants/theme";
import { getTeams, saveTeams, getUser, getMemberships, saveMemberships, setCurrentTeamId } from "../lib/storage";
import { uid, joinCode } from "../lib/id";
import { HamburgerButton } from "@/components/AppLayout";

export default function CreateTeam() {
  const router = useRouter();
  const [name, setName] = useState("");

  const create = async () => {
    const nm = name.trim();
    if (!nm) {
      Alert.alert("Team name required", "Please enter a name for your team.");
      return;
    }
    
    const user = await getUser();
    if (!user) {
      Alert.alert("Set your display name first on the Teams page.");
      return;
    }
    
    const teams = await getTeams();
    const id = uid(8);
    const code = joinCode();
    const newTeam = { 
      id, 
      name: nm, 
      code, 
      createdAt: new Date().toISOString(),
      creatorId: user.id, // Track who created the team
    };
    await saveTeams([newTeam, ...teams]);

    const memberships = await getMemberships();
    await saveMemberships([{ userId: user.id, teamId: id }, ...memberships]);
    await setCurrentTeamId(id);
    
    Alert.alert(
      "Team Created!",
      `Your team "${nm}" has been created.\n\nShare code: ${code}`,
      [{ text: "OK", onPress: () => router.replace("/dashboard") }]
    );
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <View style={{ 
      flex: 1, 
      backgroundColor: Colors.background,
    }}>
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
        <Text style={{ 
          color: Colors.primary, 
          fontSize: 20, 
          fontWeight: "700" 
        }}>
          Create Team
        </Text>
      </View>

      {/* Content */}
      <View style={{ 
        flex: 1,
        alignItems: "center", 
        justifyContent: "center", 
        padding: 16 
      }}>
        <View style={{ 
          width: "100%", 
          maxWidth: 500, 
          backgroundColor: Colors.surface, 
          borderWidth: 1, 
          borderColor: Colors.border, 
          borderRadius: 16, 
          padding: 24,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
        }}>

          {/* Title */}
          <Text style={{ 
            color: Colors.text, 
            fontWeight: "700", 
            fontSize: 22, 
            marginBottom: 8,
            textAlign: "center",
          }}>
            Create a New Team
          </Text>
          
          <Text style={{
            color: Colors.secondary,
            fontSize: 14,
            marginBottom: 24,
            textAlign: "center",
            lineHeight: 20,
          }}>
          </Text>

          {/* Input */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{
              fontSize: 14,
              fontWeight: "600",
              color: Colors.text,
              marginBottom: 8,
            }}>
              Team Name <Text style={{ color: "#ef4444" }}>*</Text>
            </Text>
            <TextInput 
              placeholder="e.g., CSUF 332 Project Team" 
              value={name} 
              onChangeText={setName}
              autoFocus
              style={{ 
                borderWidth: 1, 
                borderColor: Colors.border, 
                borderRadius: 10, 
                backgroundColor: "#FAFAFA", 
                paddingHorizontal: 14, 
                paddingVertical: 12,
                fontSize: 15,
              }} 
            />
          </View>

          {/* Buttons */}
          <View style={{
            flexDirection: "row",
            gap: 12,
          }}>
            <Pressable 
              onPress={handleCancel} 
              style={{ 
                flex: 1,
                paddingVertical: 12, 
                borderRadius: 8,
                borderWidth: 1,
                borderColor: Colors.border,
                backgroundColor: "white",
              }}
            >
              <Text style={{ 
                color: Colors.text, 
                textAlign: "center", 
                fontWeight: "600",
                fontSize: 15,
              }}>
                Cancel
              </Text>
            </Pressable>

            <Pressable 
              onPress={create} 
              style={{ 
                flex: 1,
                backgroundColor: Colors.primary, 
                paddingVertical: 12, 
                borderRadius: 8,
              }}
            >
              <Text style={{ 
                color: "white", 
                textAlign: "center", 
                fontWeight: "700",
                fontSize: 15,
              }}>
                Create Team
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}