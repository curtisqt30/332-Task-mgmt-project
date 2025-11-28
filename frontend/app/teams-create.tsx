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

  // Redirect if not logged in after auth loads
  useEffect(() => {
    if (!authLoading && !authUser) {
      console.log("No auth user, redirecting to login");
      router.replace("/login");
    }
  }, [authLoading, authUser]);

  const create = async () => {
    const nm = name.trim();
    if (!nm) {
      Alert.alert("Team name required", "Please enter a name for your team.");
      return;
    }
    
    // Double-check authentication
    if (!authUser) {
      Alert.alert("Not logged in", "Please log in to create a team.");
      router.replace("/login");
      return;
    }

    console.log("Auth user:", authUser);
    
    // CRITICAL: Use backend user ID as creator ID (convert to string for consistency)
    const creatorUserId = String(authUser.userId);
    
    console.log("Creating team with creator ID:", creatorUserId, "Type:", typeof creatorUserId);
    
    const teams = await getTeams();
    const id = uid(8);
    const code = joinCode();
    const newTeam = { 
      id, 
      name: nm, 
      code, 
      createdAt: new Date().toISOString(),
      creatorId: creatorUserId, // Use backend user ID
    };
    
    console.log("New team object:", newTeam);
    
    await saveTeams([newTeam, ...teams]);

    const memberships = await getMemberships();
    await saveMemberships([{ userId: creatorUserId, teamId: id }, ...memberships]);
    await setCurrentTeamId(id);
    
    Alert.alert(
      "Team Created!",
      `Your team "${nm}" has been created.\n\nShare code: ${code}`,
      [{ text: "OK", onPress: () => router.replace("/teams") }]
    );
  };

  const handleCancel = () => {
    router.back();
  };

  // Show loading while auth is loading
  if (authLoading) {
    return (
      <View style={{ 
        flex: 1, 
        backgroundColor: Colors.background,
        alignItems: "center",
        justifyContent: "center",
      }}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ marginTop: 12, color: Colors.secondary }}>Loading...</Text>
      </View>
    );
  }

  // Don't render if no user (redirect will happen)
  if (!authUser) {
    return null;
  }

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

      {/* Debug Info */}
      <View style={{
        backgroundColor: "#fffbeb",
        borderBottomWidth: 1,
        borderBottomColor: "#fbbf24",
        padding: 8,
      }}>
        <Text style={{ color: "#92400e", fontSize: 11, fontFamily: "monospace" }}>
          Logged in as: {authUser.userName} (ID: {authUser.userId})
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
            You'll be the team owner
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