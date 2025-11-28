import { ReactNode, useRef, useState, createContext, useContext, useEffect, useCallback } from "react";
import { View, Pressable, Animated, Easing } from "react-native";
import { usePathname, useLocalSearchParams, useSegments } from "expo-router";
import { Colors } from "@/constants/theme";
import SideNavigation from "./SideNavigation";
import { useAuth } from "@/contexts/AuthContext";

const API = process.env.EXPO_PUBLIC_API_BASE ?? "http://localhost:8000";
const DRAWER_W = 280;

type DrawerContextType = { toggleDrawer: (open?: boolean) => void; isOpen: boolean; refreshTeams: () => Promise<void> };
const DrawerContext = createContext<DrawerContextType | undefined>(undefined);
export function useDrawer() {
  const ctx = useContext(DrawerContext);
  if (!ctx) throw new Error("useDrawer must be used within AppLayout");
  return ctx;
}

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const segments = useSegments();
  const params = useLocalSearchParams();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [teams, setTeams] = useState<Array<{ id: string; name: string; code: string }>>([]);
  const drawerX = useRef(new Animated.Value(-DRAWER_W)).current;

  const loadTeams = useCallback(async () => {
    if (!user) { setTeams([]); return; }
    try {
      const res = await fetch(`${API}/api/teams`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setTeams(data.map((t: any) => ({ id: String(t.teamID), name: t.teamName, code: t.joinCode })));
      }
    } catch (e) { console.error(e); }
  }, [user]);

  useEffect(() => { loadTeams(); }, [user, loadTeams]);
  useEffect(() => { if (drawerOpen && user) loadTeams(); }, [drawerOpen, user]);

  const toggleDrawer = (open?: boolean) => {
    const next = typeof open === "boolean" ? open : !drawerOpen;
    setDrawerOpen(next);
    Animated.timing(drawerX, { toValue: next ? 0 : -DRAWER_W, duration: 200, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  };

  const getCurrentView = (): string => {
    if (!pathname) return "my-tasks";
    if (pathname === "/dashboard" || pathname === "/") return "my-tasks";
    if (pathname === "/teams") return "teams-hub";
    if (pathname === "/teams-create") return "create-team";
    if (pathname === "/teams-join") return "join-team";
    if (pathname === "/login") return "sign-out";
    if (pathname.startsWith("/team-dashboard/")) return `team-${segments[segments.length - 1]}`;
    return "my-tasks";
  };

  return (
    <DrawerContext.Provider value={{ toggleDrawer, isOpen: drawerOpen, refreshTeams: loadTeams }}>
      <View style={{ flex: 1, backgroundColor: Colors.background }}>
        {children}
        {drawerOpen && <Pressable onPress={() => toggleDrawer(false)} style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.2)", zIndex: 999 }} />}
        <Animated.View style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: DRAWER_W, transform: [{ translateX: drawerX }], zIndex: 1000 }}>
          <SideNavigation currentView={getCurrentView()} teams={teams} currentUserName={user?.userName || "User"} currentUserInitials={user?.userName.substring(0, 2).toUpperCase() || "U"} onClose={() => toggleDrawer(false)} />
        </Animated.View>
      </View>
    </DrawerContext.Provider>
  );
}

export function HamburgerButton() {
  const { toggleDrawer } = useDrawer();
  return (
    <Pressable onPress={() => toggleDrawer()} style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 8, borderWidth: 1, borderColor: Colors.border, backgroundColor: "#fff" }}>
      <View style={{ width: 18, height: 2, backgroundColor: Colors.text, marginBottom: 3 }} />
      <View style={{ width: 18, height: 2, backgroundColor: Colors.text, marginBottom: 3 }} />
      <View style={{ width: 18, height: 2, backgroundColor: Colors.text }} />
    </Pressable>
  );
}