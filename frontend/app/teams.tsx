import { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "../constants/theme";
import { getUser, setUser, getTeams, getMemberships, setCurrentTeamId, type Team } from "../lib/storage";
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
        setUserId(u.id); 
        setName(u.name); 
        setInitials(u.initials);
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
    setUserId(id); 
    setInitials(inits); 
    setName(nm);
    return id;
  };

  const goToTeam = async (teamId: string) => {
    await setCurrentTeamId(teamId);
    router.push(`/dashboard`);
  };

  const handleBack = () => {
    router.push("/dashboard");
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
        <Pressable
          onPress={handleBack}
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

<<<<<<< Updated upstream
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
=======
      <ScrollView 
        contentContainerStyle={{ padding: 20, gap: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* User Profile Card */}
        <View style={{ 
          backgroundColor: Colors.surface, 
          borderWidth: 1, 
          borderColor: Colors.border, 
          borderRadius: 12, 
          padding: 20,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
        }}>
          <Text style={{ 
            color: Colors.text, 
            fontWeight: "700", 
            fontSize: 16, 
            marginBottom: 16 
          }}>
            Your Profile
          </Text>
>>>>>>> Stashed changes

          <View style={{ flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 16 }}>
            {/* Avatar */}
            <View style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: Colors.primary,
              alignItems: "center",
              justifyContent: "center",
            }}>
              <Text style={{
                color: "white",
                fontSize: 20,
                fontWeight: "700",
              }}>
                {initials}
              </Text>
            </View>

            {/* Name Input */}
            <View style={{ flex: 1 }}>
              <Text style={{ 
                color: Colors.secondary, 
                fontSize: 12, 
                marginBottom: 6,
                fontWeight: "600",
              }}>
                Display Name
              </Text>
              <TextInput
                value={name}
                onChangeText={(v) => { 
                  setName(v); 
                  setInitials(initialsFromName(v)); 
                }}
                onBlur={ensureIdentity}
                placeholder="Enter your name"
                style={{ 
                  borderWidth: 1, 
                  borderColor: Colors.border, 
                  borderRadius: 8, 
                  backgroundColor: "white", 
                  paddingHorizontal: 12, 
                  paddingVertical: 10,
                  fontSize: 15,
                }}
              />
            </View>
          </View>

          <View style={{
            backgroundColor: Colors.primary + "08",
            borderRadius: 8,
            padding: 12,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}>
            <Text style={{ fontSize: 16 }}>ℹ️</Text>
            <Text style={{ 
              color: Colors.secondary, 
              fontSize: 13,
              flex: 1,
              lineHeight: 18,
            }}>
              Your initials (<Text style={{ fontWeight: "700", color: Colors.text }}>{initials}</Text>) will be displayed on team tasks
            </Text>
          </View>
        </View>

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
              <Text style={{ fontSize: 40, marginBottom: 8 }}>👑</Text>
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
                Create your first team to start collaborating
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
                  {/* Team Icon */}
                  <View style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    backgroundColor: Colors.primary + "15",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    <Text style={{ fontSize: 24 }}>👑</Text>
                  </View>

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
                          🔑
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

        {/* Teams Section (Teams I'm a Member Of) */}
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
              <Text style={{ fontSize: 40, marginBottom: 8 }}>🤝</Text>
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
                Join a team with a code to collaborate
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
                  {/* Team Icon */}
                  <View style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    backgroundColor: Colors.accent + "15",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    <Text style={{ fontSize: 24 }}>📁</Text>
                  </View>

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
                        <Text style={{ color: Colors.secondary, fontSize: 12 }}>
                          🔑
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
      </ScrollView>
    </View>
  );
}