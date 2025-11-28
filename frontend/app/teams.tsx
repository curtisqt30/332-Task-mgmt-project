import { useEffect, useState, useCallback } from "react";
import { View, Text, Pressable, ScrollView, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
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
      router.replace("/login");
    }
  }, [authLoading, authUser]);

  const loadData = useCallback(async () => {
    if (!authUser) return;
    
    setLoading(true);
    try {
      const authUserId = String(authUser.userId);
      const initials = initialsFromName(authUser.userName);
      
      // Sync with backend user
      await setUser({
        id: authUserId,
        name: authUser.userName,
        initials: initials,
      });

      // Load teams and memberships
      const t = await getTeams();
      const m = await getMemberships();
      const myTeams = m.filter(x => x.userId === authUserId).map(x => x.teamId);
      
      setMyTeamIds(myTeams);
      setTeams(t);
    } catch (error) {
      console.error("Error loading teams:", error);
    } finally {
      setLoading(false);
    }
  }, [authUser]);

  // Reload data every time this screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (authUser) {
        loadData();
      }
    }, [authUser, loadData])
  );

  const goToTeam = async (teamId: string) => {
    await setCurrentTeamId(teamId);
    router.push(`/team-dashboard/${teamId}`);
  };

  const deleteTeam = async (team: Team) => {
    if (!authUser) {
      Alert.alert("Error", "You must be logged in to delete a team.");
      return;
    }
    
    const userId = String(authUser.userId);
    
    // Only owner can delete - also allow if creatorId is undefined (legacy data)
    const isOwner = team.creatorId === userId || !team.creatorId || team.creatorId === "undefined";
    if (!isOwner) {
      Alert.alert("Not Authorized", "Only the team owner can delete this team.");
      return;
    }

    Alert.alert(
      "Delete Team",
      `Are you sure you want to delete "${team.name}"?\n\nThis will remove it for all members and cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setDeleting(team.id);
              
              // Remove team from teams list
              const currentTeams = await getTeams();
              const updatedTeams = currentTeams.filter(t => t.id !== team.id);
              await saveTeams(updatedTeams);
              
              // Remove all memberships for this team
              const currentMemberships = await getMemberships();
              const updatedMemberships = currentMemberships.filter(m => m.teamId !== team.id);
              await saveMemberships(updatedMemberships);
              
              // Update local state
              setTeams(updatedTeams);
              setMyTeamIds(updatedMemberships.filter(m => m.userId === userId).map(m => m.teamId));
              
              setDeleting(null);
              Alert.alert("Success", `Team "${team.name}" has been deleted.`);
            } catch (error) {
              console.error("Error deleting team:", error);
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
        { text: "Cancel", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: async () => {
            try {
              setDeleting(team.id);
              
              // Remove membership
              const currentMemberships = await getMemberships();
              const updatedMemberships = currentMemberships.filter(m => 
                !(m.userId === userId && m.teamId === team.id)
              );
              await saveMemberships(updatedMemberships);
              
              // Update local state
              setMyTeamIds(updatedMemberships.filter(m => m.userId === userId).map(m => m.teamId));
              
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

  // Loading states
  if (authLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ marginTop: 12, color: Colors.secondary }}>Loading...</Text>
      </View>
    );
  }

  if (!authUser) return null;

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ marginTop: 12, color: Colors.secondary }}>Loading teams...</Text>
      </View>
    );
  }

  const userId = String(authUser.userId);
  
  // Teams I own (including legacy teams with undefined creatorId that I'm a member of)
  const myOwnedTeams = teams.filter(t => {
    const isOwner = t.creatorId === userId || !t.creatorId || t.creatorId === "undefined";
    const isMember = myTeamIds.includes(t.id);
    return isOwner && isMember;
  });
  const myMemberTeams = teams.filter(t => {
    const isOwner = t.creatorId === userId || !t.creatorId || t.creatorId === "undefined";
    return myTeamIds.includes(t.id) && !isOwner;
  });

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
        <Text style={{ color: Colors.primary, fontSize: 20, fontWeight: "700" }}>Teams</Text>

        <View style={{ marginLeft: "auto", flexDirection: "row", gap: 8 }}>
          <Pressable 
            onPress={() => router.push("/teams-create")}
            style={{ backgroundColor: Colors.primary, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 8 }}
          >
            <Text style={{ color: "white", fontWeight: "600", fontSize: 14 }}>+ Create Team</Text>
          </Pressable>
          
          <Pressable 
            onPress={() => router.push("/teams-join")}
            style={{ paddingHorizontal: 14, paddingVertical: 9, borderRadius: 8, borderWidth: 1, borderColor: Colors.border, backgroundColor: "#fff" }}
          >
            <Text style={{ color: Colors.text, fontWeight: "600", fontSize: 14 }}>Join by Code</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }} showsVerticalScrollIndicator={false}>
        {/* My Teams (Owner) Section */}
        <View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Text style={{ color: Colors.text, fontWeight: "700", fontSize: 18 }}>My Teams (Owner)</Text>
            {myOwnedTeams.length > 0 && (
              <View style={{ backgroundColor: Colors.primary + "20", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                <Text style={{ color: Colors.primary, fontSize: 12, fontWeight: "700" }}>
                  {myOwnedTeams.length} {myOwnedTeams.length === 1 ? 'team' : 'teams'}
                </Text>
              </View>
            )}
          </View>

          {myOwnedTeams.length === 0 ? (
            <View style={{ backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: 24, alignItems: "center" }}>
              <Text style={{ color: Colors.text, fontWeight: "600", fontSize: 15, marginBottom: 4 }}>No Teams Created</Text>
              <Text style={{ color: Colors.secondary, fontSize: 13, textAlign: "center", lineHeight: 18, marginBottom: 16 }}>
                Create a team to collaborate with others
              </Text>
              <Pressable 
                onPress={() => router.push("/teams-create")}
                style={{ backgroundColor: Colors.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 }}
              >
                <Text style={{ color: "white", fontWeight: "600" }}>Create Team</Text>
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
                    style={{ flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 8 }}
                  >
                    
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <Text style={{ color: Colors.text, fontWeight: "700", fontSize: 16 }}>{t.name}</Text>
                        <View style={{ backgroundColor: Colors.primary + "20", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                          <Text style={{ color: Colors.primary, fontSize: 10, fontWeight: "700" }}>OWNER</Text>
                        </View>
                      </View>
                      <Text style={{ color: Colors.secondary, fontSize: 12 }}>
                        Code: <Text style={{ fontWeight: "600", letterSpacing: 1 }}>{t.code}</Text>
                      </Text>
                    </View>

                    <Text style={{ color: Colors.secondary, fontSize: 18 }}>→</Text>
                  </Pressable>

                </View>
              ))}
            </View>
          )}
        </View>

        {/* Member Teams Section */}
        <View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Text style={{ color: Colors.text, fontWeight: "700", fontSize: 18 }}>Member Teams</Text>
            {myMemberTeams.length > 0 && (
              <View style={{ backgroundColor: Colors.accent + "20", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                <Text style={{ color: Colors.accent, fontSize: 12, fontWeight: "700" }}>
                  {myMemberTeams.length} {myMemberTeams.length === 1 ? 'team' : 'teams'}
                </Text>
              </View>
            )}
          </View>

          {myMemberTeams.length === 0 ? (
            <View style={{ backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: 24, alignItems: "center" }}>
              <Text style={{ color: Colors.text, fontWeight: "600", fontSize: 15, marginBottom: 4 }}>No Team Memberships</Text>
              <Text style={{ color: Colors.secondary, fontSize: 13, textAlign: "center", lineHeight: 18, marginBottom: 16 }}>
                Join a team using a 6-character code
              </Text>
              <Pressable 
                onPress={() => router.push("/teams-join")}
                style={{ backgroundColor: Colors.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 }}
              >
                <Text style={{ color: "white", fontWeight: "600" }}>Join Team</Text>
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
                    style={{ flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 8 }}
                  >
                    
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <Text style={{ color: Colors.text, fontWeight: "700", fontSize: 16 }}>{t.name}</Text>
                        <View style={{ backgroundColor: Colors.accent + "20", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                          <Text style={{ color: Colors.accent, fontSize: 10, fontWeight: "700" }}>MEMBER</Text>
                        </View>
                      </View>
                      <Text style={{ color: Colors.secondary, fontSize: 12 }}>
                        Code: <Text style={{ fontWeight: "600", letterSpacing: 1 }}>{t.code}</Text>
                      </Text>
                    </View>

                    <Text style={{ color: Colors.secondary, fontSize: 18 }}>→</Text>
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