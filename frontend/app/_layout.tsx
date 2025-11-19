import { Tabs } from "expo-router";

export default function RootLayout() {
  return (
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
  );
}