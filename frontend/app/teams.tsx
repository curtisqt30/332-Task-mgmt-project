import { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "../constants/theme";
import { getTeams, saveTeams, getMemberships, saveMemberships, setUser, setCurrentTeamId, type Team } from "../lib/storage";
import { initialsFromName } from "../lib/id";
import { HamburgerButton } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";

export default function TeamsHub() {
  const router = useRouter();
  const { user: authUser, loading: authLoading } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [myTeamIds, setMyTeamIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !authUser) {
      console.log("No auth user, redirecting to login");
      router.replace("/login");
    }
  }, [authLoading, authUser]);

  useEffect(() => {
    if (authUser) {
      console.log("Auth user available:", authUser);
      loadData();
    }
  }, [authUser]);

  const loadData = async () => {
    try {
      if (!authUser) {
        console.log("loadData: No authUser, skipping");
        return;
      }
      
      console.log("loadData: Starting...");
      
      // CRITICAL: Convert backend user ID to string
      const authUserId = String(authUser.userId);
      const initials = initialsFromName(authUser.userName);
      
      console.log("=== TEAMS PAGE LOAD ===");
      console.log("Auth User:", {
        userId: authUser.userId,
        userName: authUser.userName,
        userIdType: typeof authUser.userId,
        convertedId: authUserId,
        convertedType: typeof authUserId
      });
      
      // Sync with backend user
      await setUser({
        id: authUserId,
        name: authUser.userName,
        initials: initials,
      });

      // Load teams and memberships
      const t = await getTeams();
      const m = await getMemberships();
      
      console.log("Loaded teams:", t);
      console.log("Loaded memberships:", m);
      
      const myTeams = m.filter(x => x.userId === authUserId).map(x => x.teamId);
      console.log("My team IDs:", myTeams);
      
      setMyTeamIds(myTeams);
      setTeams(t);
      
      console.log("=== LOAD COMPLETE ===");
    } catch (error) {
      console.error("Error loading teams:", error);
    } finally {
      setLoading(false);
    }
  };

  const goToTeam = async (teamId: string) => {
    console.log("Navigating to team:", teamId);
    await setCurrentTeamId(teamId);
    router.push(`/team-dashboard/${teamId}`);
  };
  
  const showDebugInfo = () => {
    if (!authUser) {
      Alert.alert("Debug Info", "User not loaded yet");
      return;
    }
    
    const userId = String(authUser.userId);
    const ownedTeams = teams.filter(t => t.creatorId === userId);
    const memberTeams = teams.filter(t => 
      myTeamIds.includes(t.id) && t.creatorId !== userId
    );
    
    Alert.alert(
      "Debug Info",
      `Current User ID: ${userId}\n` +
      `Auth User ID: ${authUser.userId}\n\n` +
      `Owned Teams (${ownedTeams.length}):\n${ownedTeams.map(t => `- ${t.name} (creator: ${t.creatorId})`).join('\n') || 'None'}\n\n` +
      `Member Teams (${memberTeams.length}):\n${memberTeams.map(t => `- ${t.name} (creator: ${t.creatorId})`).join('\n') || 'None'}\n\n` +
      `All Team IDs I'm in: ${myTeamIds.join(', ') || 'None'}`
    );
  };

  const deleteTeam = async (team: Team) => {
    if (!authUser) {
      console.log("deleteTeam: No authUser");
      Alert.alert("Error", "You must be logged in to delete a team.");
      return;
    }
    
    const userId = String(authUser.userId);
    console.log("deleteTeam: Checking ownership", {
      teamCreatorId: team.creatorId,
      currentUserId: userId,
      match: team.creatorId === userId
    });
    
    // Only owner can delete
    if (team.creatorId !== userId) {
      Alert.alert("Not Authorized", "Only the team owner can delete this team.");
      return;
    }

    Alert.alert(
      "Delete Team",
      `Are you sure you want to delete "${team.name}"?\n\nThis will remove it for all members and cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setDeleting(team.id);
              console.log(`🗑️ DELETING TEAM: ${team.name} (${team.id})`);
              
              // Get current data
              const currentTeams = await getTeams();
              const currentMemberships = await getMemberships();
              
              console.log("Before delete - teams:", currentTeams.length);
              console.log("Before delete - memberships:", currentMemberships.length);
              
              // Remove team from teams list
              const updatedTeams = currentTeams.filter(t => t.id !== team.id);
              console.log("After filter - teams:", updatedTeams.length);
              
              await saveTeams(updatedTeams);
              console.log("✅ Teams saved");
              
              // Remove all memberships for this team
              const updatedMemberships = currentMemberships.filter(m => m.teamId !== team.id);
              console.log("After filter - memberships:", updatedMemberships.length);
              
              await saveMemberships(updatedMemberships);
              console.log("✅ Memberships saved");
              
              // Update local state immediately
              setTeams(updatedTeams);
              setMyTeamIds(updatedMemberships.filter(m => m.userId === userId).map(m => m.teamId));
              
              console.log("✅ TEAM DELETED SUCCESSFULLY");
              
              setDeleting(null);
              Alert.alert("Success", `Team "${team.name}" has been deleted.`);
            } catch (error) {
              console.error("❌ Error deleting team:", error);
              setDeleting(null);
              Alert.alert("Error", "Failed to delete team. Please try again.");
            }
          }
        }
      ]
    );
  };

  const leaveTeam = async (team: Team) => {
    if (!authUser) {
      Alert.alert("Error", "You must be logged in to leave a team.");
      return;
    }
    
    const userId = String(authUser.userId);
    
    // Owner cannot leave, must delete instead
    if (team.creatorId === userId) {
      Alert.alert("Cannot Leave", "As the owner, you cannot leave this team. You can delete it instead.");
      return;
    }

    Alert.alert(
      "Leave Team",
      `Are you sure you want to leave "${team.name}"?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Leave",
          style: "destructive",
          onPress: async () => {
            try {
              setDeleting(team.id);
              console.log(`🚪 LEAVING TEAM: ${team.name} (${team.id})`);
              
              // Remove membership
              const currentMemberships = await getMemberships();
              const updatedMemberships = currentMemberships.filter(m => 
                !(m.userId === userId && m.teamId === team.id)
              );
              
              await saveMemberships(updatedMemberships);
              
              // Update local state
              setMyTeamIds(updatedMemberships.filter(m => m.userId === userId).map(m => m.teamId));
              
              console.log("✅ LEFT TEAM SUCCESSFULLY");
              
              setDeleting(null);
              Alert.alert("Success", `You have left "${team.name}".`);
            } catch (error) {
              console.error("Error leaving team:", error);
              setDeleting(null);
              Alert.alert("Error", "Failed to leave team. Please try again.");
            }
          }
        }
      ]
    );
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

  // Don't render if no user
  if (!authUser) {
    console.log("No authUser, rendering null");
    return null;
  }

  if (loading) {
    return (
      <View style={{ 
        flex: 1, 
        alignItems: "center", 
        justifyContent: "center", 
        backgroundColor: Colors.background 
      }}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ marginTop: 12, color: Colors.secondary }}>Loading teams...</Text>
      </View>
    );
  }

  // Use authUser directly to avoid timing issues
  const userId = String(authUser.userId);
  const userName = authUser.userName;

  console.log("Rendering with userId:", userId);

  // CRITICAL: Teams I own
  const myOwnedTeams = teams.filter(t => {
    const isOwner = t.creatorId === userId;
    console.log(`Team "${t.name}": creatorId='${t.creatorId}' vs userId='${userId}' => ${isOwner}`);
    return isOwner;
  });
  
  // Teams I'm a member of but didn't create
  const myMemberTeams = teams.filter(t => {
    const isMember = myTeamIds.includes(t.id);
    const notOwner = t.creatorId !== userId;
    return isMember && notOwner;
  });

  console.log(`Rendering: ${myOwnedTeams.length} owned, ${myMemberTeams.length} member`);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* Header */}
      <View style={{ 
        flexDirection: "row", 
        alignItems: "center", 
        gap: 12, 
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1, 
        borderColor: Colors.border, 
        backgroundColor: Colors.surface 
      }}>
        <HamburgerButton />

        <Text style={{ 
          color: Colors.primary, 
          fontSize: 20, 
          fontWeight: "700" 
        }}>
          Teams
        </Text>

        <View style={{ marginLeft: "auto", flexDirection: "row", gap: 8 }}>
          {/* Debug button */}
          <Pressable 
            onPress={showDebugInfo}
            style={{ 
              paddingHorizontal: 12, 
              paddingVertical: 9, 
              borderRadius: 8, 
              borderWidth: 1, 
              borderColor: "#fbbf24", 
              backgroundColor: "#fffbeb" 
            }}
          >
            <Text style={{ color: "#f59e0b", fontWeight: "600", fontSize: 14 }}>
              🐛 Debug
            </Text>
          </Pressable>
          
          <Pressable 
            onPress={() => router.push("/teams-create")}
            style={{ 
              backgroundColor: Colors.primary, 
              paddingHorizontal: 14, 
              paddingVertical: 9, 
              borderRadius: 8 
            }}
          >
            <Text style={{ color: "white", fontWeight: "600", fontSize: 14 }}>
              + Create Team
            </Text>
          </Pressable>
          
          <Pressable 
            onPress={() => router.push("/teams-join")}
            style={{ 
              paddingHorizontal: 14, 
              paddingVertical: 9, 
              borderRadius: 8, 
              borderWidth: 1, 
              borderColor: Colors.border, 
              backgroundColor: "#fff" 
            }}
          >
            <Text style={{ color: Colors.text, fontWeight: "600", fontSize: 14 }}>
              Join by Code
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Debug Info Panel */}
      <View style={{
        backgroundColor: "#fffbeb",
        borderBottomWidth: 1,
        borderBottomColor: "#fbbf24",
        padding: 8,
      }}>
        <Text style={{ color: "#92400e", fontSize: 11, fontFamily: "monospace" }}>
          Logged in as: {userName} (ID: {userId || 'loading...'})
        </Text>
      </View>

      <ScrollView 
        contentContainerStyle={{ padding: 20, gap: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* My Teams Section */}
        <View>
          <View style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}>
            <Text style={{ 
              color: Colors.text, 
              fontWeight: "700", 
              fontSize: 18,
            }}>
              My Teams (Owner)
            </Text>
            {myOwnedTeams.length > 0 && (
              <View style={{
                backgroundColor: Colors.primary + "20",
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 12,
              }}>
                <Text style={{
                  color: Colors.primary,
                  fontSize: 12,
                  fontWeight: "700",
                }}>
                  {myOwnedTeams.length} {myOwnedTeams.length === 1 ? 'team' : 'teams'}
                </Text>
              </View>
            )}
          </View>

          {myOwnedTeams.length === 0 ? (
            <View style={{
              backgroundColor: Colors.surface,
              borderWidth: 1,
              borderColor: Colors.border,
              borderRadius: 12,
              padding: 24,
              alignItems: "center",
            }}>
              <Text style={{ 
                color: Colors.text, 
                fontWeight: "600", 
                fontSize: 15,
                marginBottom: 4,
              }}>
                No Teams Created
              </Text>
              <Text style={{ 
                color: Colors.secondary, 
                fontSize: 13,
                textAlign: "center",
                lineHeight: 18,
                marginBottom: 16,
              }}>
                Create a team to collaborate with others
              </Text>
              <Pressable 
                onPress={() => router.push("/teams-create")}
                style={{
                  backgroundColor: Colors.primary,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: "white", fontWeight: "600" }}>
                  Create Team
                </Text>
              </Pressable>
            </View>
          ) : (
            <View style={{ gap: 10 }}>
              {myOwnedTeams.map((t) => (
                <View 
                  key={t.id}
                  style={{ 
                    backgroundColor: Colors.surface, 
                    borderWidth: 1, 
                    borderColor: Colors.border, 
                    borderRadius: 12, 
                    padding: 16,
                    opacity: deleting === t.id ? 0.5 : 1,
                  }}
                >
                  <Pressable 
                    onPress={() => goToTeam(t.id)}
                    disabled={deleting === t.id}
                    style={{ 
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 14,
                      marginBottom: 8,
                    }}
                  >
                    <Text style={{ fontSize: 24 }}>👑</Text>
                    
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <Text style={{ 
                          color: Colors.text, 
                          fontWeight: "700",
                          fontSize: 16,
                        }}>
                          {t.name}
                        </Text>
                        <View style={{
                          backgroundColor: Colors.primary + "20",
                          paddingHorizontal: 6,
                          paddingVertical: 2,
                          borderRadius: 4,
                        }}>
                          <Text style={{
                            color: Colors.primary,
                            fontSize: 10,
                            fontWeight: "700",
                          }}>
                            OWNER
                          </Text>
                        </View>
                      </View>
                      <Text style={{ color: Colors.secondary, fontSize: 12 }}>
                        Code: <Text style={{ fontWeight: "600", letterSpacing: 1 }}>{t.code}</Text>
                      </Text>
                    </View>

                    <Text style={{ color: Colors.secondary, fontSize: 18 }}>→</Text>
                  </Pressable>

                  {/* Delete Button */}
                  <Pressable
                    onPress={() => deleteTeam(t)}
                    disabled={deleting === t.id}
                    style={{
                      alignSelf: "flex-start",
                      paddingVertical: 6,
                      paddingHorizontal: 10,
                      backgroundColor: deleting === t.id ? "#fecaca" : "#fee2e2",
                      borderRadius: 6,
                      borderWidth: 1,
                      borderColor: "#fecaca",
                    }}
                  >
                    <Text style={{ color: "#dc2626", fontWeight: "600", fontSize: 11 }}>
                      {deleting === t.id ? "Deleting..." : "🗑️ Delete"}
                    </Text>
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Member Teams Section */}
        <View>
          <View style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}>
            <Text style={{ 
              color: Colors.text, 
              fontWeight: "700", 
              fontSize: 18,
            }}>
              Member Teams
            </Text>
            {myMemberTeams.length > 0 && (
              <View style={{
                backgroundColor: Colors.accent + "20",
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 12,
              }}>
                <Text style={{
                  color: Colors.accent,
                  fontSize: 12,
                  fontWeight: "700",
                }}>
                  {myMemberTeams.length} {myMemberTeams.length === 1 ? 'team' : 'teams'}
                </Text>
              </View>
            )}
          </View>

          {myMemberTeams.length === 0 ? (
            <View style={{
              backgroundColor: Colors.surface,
              borderWidth: 1,
              borderColor: Colors.border,
              borderRadius: 12,
              padding: 24,
              alignItems: "center",
            }}>
              <Text style={{ 
                color: Colors.text, 
                fontWeight: "600", 
                fontSize: 15,
                marginBottom: 4,
              }}>
                No Team Memberships
              </Text>
              <Text style={{ 
                color: Colors.secondary, 
                fontSize: 13,
                textAlign: "center",
                lineHeight: 18,
                marginBottom: 16,
              }}>
                Join a team using a 6-character code
              </Text>
              <Pressable 
                onPress={() => router.push("/teams-join")}
                style={{
                  backgroundColor: Colors.primary,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: "white", fontWeight: "600" }}>
                  Join Team
                </Text>
              </Pressable>
            </View>
          ) : (
            <View style={{ gap: 10 }}>
              {myMemberTeams.map((t) => (
                <View 
                  key={t.id}
                  style={{ 
                    backgroundColor: Colors.surface, 
                    borderWidth: 1, 
                    borderColor: Colors.border, 
                    borderRadius: 12, 
                    padding: 16,
                    opacity: deleting === t.id ? 0.5 : 1,
                  }}
                >
                  <Pressable 
                    onPress={() => goToTeam(t.id)}
                    disabled={deleting === t.id}
                    style={{ 
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 14,
                      marginBottom: 8,
                    }}
                  >
                    <Text style={{ fontSize: 24 }}>📁</Text>
                    
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <Text style={{ 
                          color: Colors.text, 
                          fontWeight: "700",
                          fontSize: 16,
                        }}>
                          {t.name}
                        </Text>
                        <View style={{
                          backgroundColor: Colors.accent + "20",
                          paddingHorizontal: 6,
                          paddingVertical: 2,
                          borderRadius: 4,
                        }}>
                          <Text style={{
                            color: Colors.accent,
                            fontSize: 10,
                            fontWeight: "700",
                          }}>
                            MEMBER
                          </Text>
                        </View>
                      </View>
                      <Text style={{ color: Colors.secondary, fontSize: 12 }}>
                        Code: <Text style={{ fontWeight: "600", letterSpacing: 1 }}>{t.code}</Text>
                      </Text>
                    </View>

                    <Text style={{ color: Colors.secondary, fontSize: 18 }}>→</Text>
                  </Pressable>

                  {/* Leave Button */}
                  <Pressable
                    onPress={() => leaveTeam(t)}
                    disabled={deleting === t.id}
                    style={{
                      alignSelf: "flex-start",
                      paddingVertical: 6,
                      paddingHorizontal: 10,
                      backgroundColor: deleting === t.id ? "#fde68a" : "#fef3c7",
                      borderRadius: 6,
                      borderWidth: 1,
                      borderColor: "#fde68a",
                    }}
                  >
                    <Text style={{ color: "#d97706", fontWeight: "600", fontSize: 11 }}>
                      {deleting === t.id ? "Leaving..." : "🚪 Leave"}
                    </Text>
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}