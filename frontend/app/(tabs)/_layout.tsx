import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarStyle: { display: "none" } }}>
      <Tabs.Screen name="dashboard" />
      <Tabs.Screen name="login" />
      <Tabs.Screen name="register" />
    </Tabs>
  );
}
