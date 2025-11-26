import { View, Text, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/theme";

type NavigationItem = {
  id: string;
  label: string;
  icon: string;
  href?: string;
  action?: () => void;
  type?: "section" | "item" | "divider";
};

type SideNavigationProps = {
  currentView: string;
  teams?: Array<{ id: string; name: string; code: string }>;
  currentUserName?: string;
  currentUserInitials?: string;
  onClose?: () => void;
};

export default function SideNavigation({
  currentView,
  teams = [],
  currentUserName = "User",
  currentUserInitials = "U",
  onClose,
}: SideNavigationProps) {
  const router = useRouter();

  const handleNavigation = (href: string) => {
    router.push(href);
    onClose?.();
  };

  const navigationItems: NavigationItem[] = [
    // Personal Section
    { id: "personal-header", label: "PERSONAL", type: "section" },
    { 
      id: "my-tasks", 
      label: "My Tasks", 
      icon: "📋", 
      href: "/dashboard",
    },
    
    // Divider
    { id: "divider-1", type: "divider" },
    
    // Teams Section
    { id: "teams-header", label: "TEAMS", type: "section" },
    { 
      id: "teams-hub", 
      label: "All Teams", 
      icon: "👥", 
      href: "/teams",
    },
    { 
      id: "create-team", 
      label: "Create Team", 
      icon: "➕", 
      href: "/teams-create",
    },
    { 
      id: "join-team", 
      label: "Join Team", 
      icon: "🔗", 
      href: "/teams-join",
    },
    
    // Team List
    ...(teams.length > 0 ? [
      { id: "divider-2", type: "divider" } as NavigationItem,
      { id: "my-teams-header", label: "MY TEAMS", type: "section" } as NavigationItem,
      ...teams.map(team => ({
        id: `team-${team.id}`,
        label: team.name,
        icon: "📁",
        href: `/team-dashboard/${team.id}`,
      })),
    ] : []),
    
    // Bottom Section
    { id: "divider-3", type: "divider" },
    { 
      id: "sign-out", 
      label: "Sign Out", 
      icon: "🚪", 
      href: "/login",
    },
  ];

  return (
    <View style={{
      flex: 1,
      backgroundColor: Colors.surface,
      borderRightWidth: 1,
      borderColor: Colors.border,
    }}>
      {/* User Profile Section */}
      <View style={{
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        backgroundColor: Colors.primary + "08",
      }}>
        <View style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        }}>
          <View style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: Colors.primary,
            alignItems: "center",
            justifyContent: "center",
          }}>
            <Text style={{
              color: "white",
              fontSize: 18,
              fontWeight: "700",
            }}>
              {currentUserInitials}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{
              color: Colors.text,
              fontSize: 16,
              fontWeight: "700",
            }}>
              {currentUserName}
            </Text>
            <Text style={{
              color: Colors.secondary,
              fontSize: 13,
            }}>
            </Text>
          </View>
        </View>
      </View>

      {/* Navigation Items */}
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 12 }}
        showsVerticalScrollIndicator={false}
      >
        {navigationItems.map((item) => {
          if (item.type === "section") {
            return (
              <Text
                key={item.id}
                style={{
                  fontSize: 11,
                  fontWeight: "700",
                  color: Colors.secondary,
                  marginTop: 16,
                  marginBottom: 8,
                  marginLeft: 12,
                  letterSpacing: 0.5,
                }}
              >
                {item.label}
              </Text>
            );
          }

          if (item.type === "divider") {
            return (
              <View
                key={item.id}
                style={{
                  height: 1,
                  backgroundColor: Colors.border,
                  marginVertical: 12,
                }}
              />
            );
          }

          const isActive = currentView === item.id;

          return (
            <Pressable
              key={item.id}
              onPress={() => item.href && handleNavigation(item.href)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                paddingHorizontal: 12,
                paddingVertical: 10,
                borderRadius: 8,
                backgroundColor: isActive ? Colors.primary + "15" : "transparent",
                borderLeftWidth: isActive ? 3 : 0,
                borderLeftColor: Colors.primary,
                marginBottom: 4,
              }}
            >
              <Text style={{ fontSize: 16 }}></Text>
              <Text style={{
                color: isActive ? Colors.primary : Colors.text,
                fontWeight: isActive ? "600" : "500",
                fontSize: 14,
                flex: 1,
              }}>
                {item.label}
              </Text>
              {item.id.startsWith("team-") && (
                <View style={{
                  backgroundColor: Colors.primary + "20",
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 4,
                }}>
                  <Text style={{
                    color: Colors.primary,
                    fontSize: 10,
                    fontWeight: "600",
                  }}>
                    TEAM
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}