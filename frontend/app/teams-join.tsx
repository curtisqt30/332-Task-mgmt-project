import { useRouter } from "expo-router";
import { useState } from "react";
import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { Colors } from "../constants/theme";
import { getUser, getTeams, getMemberships, saveMemberships, setCurrentTeamId } from "../lib/storage";

export default function JoinTeam() {
  const router = useRouter();
  const [code, setCode] = useState("");

  const join = async () => {
    const trimmedCode = code.trim().toUpperCase();
    
    if (!trimmedCode) {
      Alert.alert("Code required", "Please enter a team join code.");
      return;
    }

    if (trimmedCode.length !== 6) {
      Alert.alert("Invalid code", "Team codes are exactly 6 characters.");
      return;
    }

    const user = await getUser();
    if (!user) {
      Alert.alert("Set your display name first on the Teams page.");
      return;
    }

    const teams = await getTeams();
    const team = teams.find(t => t.code.toUpperCase() === trimmedCode);
    
    if (!team) {
      Alert.alert("Team not found", "No team exists with this code. Please check and try again.");
      return;
    }

    const memberships = await getMemberships();
    const already = memberships.some(m => m.userId === user.id && m.teamId === team.id);
    
    if (already) {
      Alert.alert(
        "Already a member",
        `You're already part of "${team.name}".`,
        [{ text: "OK", onPress: () => router.replace("/dashboard") }]
      );
      return;
    }

    memberships.unshift({ userId: user.id, teamId: team.id });
    await saveMemberships(memberships);
    await setCurrentTeamId(team.id);
    
    Alert.alert(
      "Joined Team!",
      `You've successfully joined "${team.name}".`,
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
        <Pressable
          onPress={handleCancel}
          style={{
            width: 40,
            height: 40,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 8,
            borderWidth: 1,
            borderColor: Colors.border,
            backgroundColor: "#fff",
          }}
        >
          <Text style={{ fontSize: 18, color: Colors.text }}>←</Text>
        </Pressable>
        <Text style={{ 
          color: Colors.primary, 
          fontSize: 20, 
          fontWeight: "700" 
        }}>
          Join Team
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
            Join a Team
          </Text>
          
          <Text style={{
            color: Colors.secondary,
            fontSize: 14,
            marginBottom: 24,
            textAlign: "center",
            lineHeight: 20,
          }}>
            Enter the 6-character code shared by your team leader to join
          </Text>

          {/* Input */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{
              fontSize: 14,
              fontWeight: "600",
              color: Colors.text,
              marginBottom: 8,
            }}>
              Team Code <Text style={{ color: "#ef4444" }}>*</Text>
            </Text>
            <TextInput
              placeholder="Enter 6-character code"
              value={code}
              onChangeText={setCode}
              autoCapitalize="characters"
              maxLength={6}
              autoFocus
              style={{ 
                borderWidth: 1, 
                borderColor: Colors.border, 
                borderRadius: 10, 
                backgroundColor: "#FAFAFA", 
                paddingHorizontal: 14, 
                paddingVertical: 12, 
                letterSpacing: 3,
                fontSize: 18,
                fontWeight: "600",
                textAlign: "center",
                color: Colors.text,
              }}
            />
            <Text style={{
              color: Colors.secondary,
              fontSize: 12,
              marginTop: 6,
              textAlign: "center",
            }}>
            </Text>
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
              onPress={join} 
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
                Join Team
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}