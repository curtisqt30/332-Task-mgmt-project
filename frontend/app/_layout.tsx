import { Tabs } from "expo-router";
import { AuthProvider } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppLayout>
        <Tabs screenOptions={{ 
          headerShown: false, 
          tabBarStyle: { display: "none" } 
        }}>
          <Tabs.Screen name="dashboard" />
          <Tabs.Screen name="login" />
          <Tabs.Screen name="register" />
          <Tabs.Screen name="teams" />
          <Tabs.Screen name="teams-create" options={{ href: null }} />
          <Tabs.Screen name="teams-join" options={{ href: null }} />
          <Tabs.Screen name="index" options={{ href: null }} />
        </Tabs>
      </AppLayout>
    </AuthProvider>
  );
}