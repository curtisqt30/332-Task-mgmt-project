import { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "../constants/theme";
import { getUser, setUser, getTeams, getMemberships, setCurrentTeamId, type Team } from "../lib/storage";
import { initialsFromName } from "../lib/id";
import { HamburgerButton } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";

export default function TeamsHub() {
  const router = useRouter();
  const { user: authUser } = useAuth();
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState("");
  const [userInitials, setUserInitials] = useState("U");
  const [teams, setTeams] = useState<Team[]>([]);
  const [myTeamIds, setMyTeamIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [authUser]);

  const loadData = async () => {
    try {
      // Sync backend auth user with local storage
      if (authUser) {
        const localUser = await getUser();
        const authUserId = String(authUser.userId);
        
        // Create or update local user to match backend user
        if (!localUser || localUser.id !== authUserId) {
          const initials = initialsFromName(authUser.userName);
          await setUser({
            id: authUserId,
            name: authUser.userName,
            initials: initials,
          });
          setUserId(authUserId);
          setUserName(authUser.userName);
          setUserInitials(initials);
        } else {
          setUserId(localUser.id);
          setUserName(localUser.name);
          setUserInitials(localUser.initials);
        }

        // Load teams and memberships
        const t = await getTeams();
        const m = await getMemberships();
        setMyTeamIds(m.filter(x => x.userId === authUserId).map(x => x.teamId));
        setTeams(t);
      }
    } catch (error) {
      console.error("Error loading teams data:", error);
    } finally {
      setLoading(false);
    }
  };

  const goToTeam = async (teamId: string) => {
    await setCurrentTeamId(teamId);
    router.push(`/team-dashboard/${teamId}`);
  };

  if (loading) {
    return (
      <View style={{ 
        flex: 1, 
        alignItems: "center", 
        justifyContent: "center", 
        backgroundColor: Colors.background 
      }}>
        <Text style={{ color: Colors.secondary }}>Loading…</Text>
      </View>
    );
  }

  // Teams I own (created by me)
  const myOwnedTeams = teams.filter(t => t.creatorId === userId);
  
  // Teams I'm a member of (but didn't create)
  const myMemberTeams = teams.filter(t => 
    myTeamIds.includes(t.id) && t.creatorId !== userId
  );

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

      <ScrollView 
        contentContainerStyle={{ padding: 20, gap: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* My Teams Section (Teams I Own) */}
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
              My Teams
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
                <Pressable 
                  key={t.id} 
                  onPress={() => goToTeam(t.id)} 
                  style={{ 
                    backgroundColor: Colors.surface, 
                    borderWidth: 1, 
                    borderColor: Colors.border, 
                    borderRadius: 12, 
                    padding: 16,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 14,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.03,
                    shadowRadius: 3,
                  }}
                >
                  {/* Team Info */}
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
                    <View style={{ flexDirection: "row", gap: 12 }}>
                      <View style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                      }}>
                        <Text style={{ color: Colors.secondary, fontSize: 12 }}>
                          Code:
                        </Text>
                        <Text style={{ 
                          color: Colors.secondary, 
                          fontSize: 12,
                          fontWeight: "600",
                          letterSpacing: 1,
                        }}>
                          {t.code}
                        </Text>
                      </View>
                      {t.createdAt && (
                        <Text style={{ color: Colors.secondary, fontSize: 12 }}>
                          • Created {new Date(t.createdAt).toLocaleDateString()}
                        </Text>
                      )}
                    </View>
                  </View>

                  {/* Arrow */}
                  <Text style={{ color: Colors.secondary, fontSize: 18 }}>→</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* Teams Section */}
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
              Teams
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
                <Pressable 
                  key={t.id} 
                  onPress={() => goToTeam(t.id)} 
                  style={{ 
                    backgroundColor: Colors.surface, 
                    borderWidth: 1, 
                    borderColor: Colors.border, 
                    borderRadius: 12, 
                    padding: 16,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 14,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.03,
                    shadowRadius: 3,
                  }}
                >
                  {/* Team Info */}
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
                    <View style={{ flexDirection: "row", gap: 12 }}>
                      <View style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                      }}>
                        <Text style={{ 
                          color: Colors.secondary, 
                          fontSize: 12,
                          fontWeight: "600",
                          letterSpacing: 1,
                        }}>
                          {t.code}
                        </Text>
                      </View>
                      {t.createdAt && (
                        <Text style={{ color: Colors.secondary, fontSize: 12 }}>
                          • Created {new Date(t.createdAt).toLocaleDateString()}
                        </Text>
                      )}
                    </View>
                  </View>

                  {/* Arrow */}
                  <Text style={{ color: Colors.secondary, fontSize: 18 }}>→</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}