import { ReactNode, useRef, useState, createContext, useContext, useEffect, useCallback } from "react";
import { View, Pressable, Animated, Easing } from "react-native";
import { usePathname, useLocalSearchParams, useSegments } from "expo-router";
import { Colors } from "@/constants/theme";
import SideNavigation from "./SideNavigation";
import { useAuth } from "@/contexts/AuthContext";
import { getTeams, getMemberships, setUser, type Team } from "@/lib/storage";
import { initialsFromName } from "@/lib/id";

const DRAWER_W = 280;

type DrawerContextType = {
  toggleDrawer: (open?: boolean) => void;
  isOpen: boolean;
  refreshTeams: () => Promise<void>;
};

const DrawerContext = createContext<DrawerContextType | undefined>(undefined);

export function useDrawer() {
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error("useDrawer must be used within AppLayout");
  }
  return context;
}

type AppLayoutProps = {
  children: ReactNode;
};

export default function AppLayout({ children }: AppLayoutProps) {
  const { user } = useAuth();
  const pathname = usePathname();
  const segments = useSegments();
  const params = useLocalSearchParams();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const drawerX = useRef(new Animated.Value(-DRAWER_W)).current;

  const syncUserAndLoadTeams = useCallback(async () => {
    try {
      if (user) {
        const userId = String(user.userId);
        const initials = initialsFromName(user.userName);
        
        await setUser({
          id: userId,
          name: user.userName,
          initials: initials,
        });
        
        const allTeams = await getTeams();
        const memberships = await getMemberships();
        
        const userTeamIds = memberships
          .filter(m => m.userId === userId)
          .map(m => m.teamId);
        const userTeams = allTeams.filter(t => userTeamIds.includes(t.id));
        setTeams(userTeams);
      } else {
        setTeams([]);
      }
    } catch (error) {
      console.error("Error loading teams:", error);
    }
  }, [user]);

  useEffect(() => {
    syncUserAndLoadTeams();
  }, [user]);

  // Refresh teams when drawer opens
  useEffect(() => {
    if (drawerOpen && user) {
      syncUserAndLoadTeams();
    }
  }, [drawerOpen, user]);

  const toggleDrawer = (open?: boolean) => {
    const next = typeof open === "boolean" ? open : !drawerOpen;
    setDrawerOpen(next);
    Animated.timing(drawerX, {
      toValue: next ? 0 : -DRAWER_W,
      duration: 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const getCurrentView = (): string => {
    if (!pathname) return "my-tasks";
    
    if (pathname === "/dashboard" || pathname === "/") return "my-tasks";
    if (pathname === "/teams") return "teams-hub";
    if (pathname === "/teams-create") return "create-team";
    if (pathname === "/teams-join") return "join-team";
    if (pathname === "/login") return "sign-out";
    
    if (pathname.startsWith("/team-dashboard/")) {
      const teamId = segments[segments.length - 1];
      return `team-${teamId}`;
    }
    
    if (pathname === "/team-dashboard" && params.teamId) {
      return `team-${params.teamId}`;
    }
    
    return "my-tasks";
  };

  const currentView = getCurrentView();
  const userInitials = user?.userName.substring(0, 2).toUpperCase() || "U";
  const userName = user?.userName || "User";

  return (
    <DrawerContext.Provider value={{ toggleDrawer, isOpen: drawerOpen, refreshTeams: syncUserAndLoadTeams }}>
      <View style={{ flex: 1, backgroundColor: Colors.background }}>
        {children}

        {/* Drawer overlay */}
        {drawerOpen && (
          <Pressable 
            onPress={() => toggleDrawer(false)} 
            style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.2)", zIndex: 999 }} 
          />
        )}

        {/* Drawer panel */}
        <Animated.View
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            width: DRAWER_W,
            transform: [{ translateX: drawerX }],
            shadowColor: "#000",
            shadowOpacity: 0.08,
            shadowOffset: { width: 2, height: 0 },
            shadowRadius: 6,
            elevation: 5,
            zIndex: 1000,
          }}
        >
          <SideNavigation
            currentView={currentView}
            teams={teams}
            currentUserName={userName}
            currentUserInitials={userInitials}
            onClose={() => toggleDrawer(false)}
          />
        </Animated.View>
      </View>
    </DrawerContext.Provider>
  );
}

export function HamburgerButton() {
  const { toggleDrawer } = useDrawer();
  
  return (
    <Pressable 
      onPress={() => toggleDrawer()} 
      style={{ 
        width: 40, 
        height: 40, 
        alignItems: "center", 
        justifyContent: "center", 
        borderRadius: 8, 
        borderWidth: 1, 
        borderColor: Colors.border, 
        backgroundColor: "#fff" 
      }}
    >
      <View style={{ width: 18, height: 2, backgroundColor: Colors.text, marginBottom: 3 }} />
      <View style={{ width: 18, height: 2, backgroundColor: Colors.text, marginBottom: 3 }} />
      <View style={{ width: 18, height: 2, backgroundColor: Colors.text }} />
    </Pressable>
  );
}