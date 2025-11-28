import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

const API = process.env.EXPO_PUBLIC_API_BASE ?? "http://localhost:8000";

/**
 * Clear all AsyncStorage data (frontend only)
 */
export async function clearAllAppData(): Promise<boolean> {
  try {
    await AsyncStorage.clear();
    console.log("✅ All frontend app data cleared");
    return true;
  } catch (error) {
    console.error("❌ Error clearing app data:", error);
    return false;
  }
}

/**
 * Clear only team-related data from AsyncStorage
 */
export async function clearTeamData(): Promise<boolean> {
  try {
    await AsyncStorage.multiRemove([
      "tm:user",
      "tm:teams",
      "tm:memberships",
      "tm:currentTeamId",
    ]);
    console.log("✅ Team data cleared");
    return true;
  } catch (error) {
    console.error("❌ Error clearing team data:", error);
    return false;
  }
}

/**
 * Reset backend database (deletes all users, tasks, teams)
 */
export async function resetBackendDatabase(): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${API}/api/admin/reset`, {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Backend database reset:", data);
    return { success: true, message: "Backend database reset successfully" };
  } catch (error) {
    console.error("❌ Error resetting backend:", error);
    return { success: false, message: `Failed to reset backend: ${error}` };
  }
}

/**
 * Get backend database stats
 */
export async function getBackendStats(): Promise<{
  users: number;
  tasks: number;
  teams: number;
  memberships: number;
  assignments: number;
} | null> {
  try {
    const response = await fetch(`${API}/api/admin/stats`, {
      credentials: "include",
    });

    if (!response.ok) return null;

    const data = await response.json();
    return {
      users: data.counts.user || 0,
      tasks: data.counts.tasks || 0,
      teams: data.counts.team || 0,
      memberships: data.counts.membership || 0,
      assignments: data.counts.assignment || 0,
    };
  } catch (error) {
    console.error("Error fetching stats:", error);
    return null;
  }
}

/**
 * Full reset: Clear frontend + backend
 */
export async function fullReset(): Promise<{ frontend: boolean; backend: boolean }> {
  const frontendResult = await clearAllAppData();
  const backendResult = await resetBackendDatabase();
  
  return {
    frontend: frontendResult,
    backend: backendResult.success,
  };
}

/**
 * Show confirmation dialog and perform full reset
 */
export async function confirmAndReset(): Promise<void> {
  return new Promise((resolve) => {
    Alert.alert(
      "⚠️ Full Reset",
      "This will delete ALL data:\n\n" +
      "• All users and accounts\n" +
      "• All tasks\n" +
      "• All teams\n" +
      "• All local app data\n\n" +
      "This cannot be undone!",
      [
        { 
          text: "Cancel", 
          style: "cancel",
          onPress: () => resolve(),
        },
        {
          text: "Reset Everything",
          style: "destructive",
          onPress: async () => {
            try {
              const result = await fullReset();
              
              if (result.frontend && result.backend) {
                Alert.alert(
                  "✅ Reset Complete",
                  "All data has been deleted.\nPlease restart the app.",
                  [{ text: "OK", onPress: () => resolve() }]
                );
              } else {
                Alert.alert(
                  "⚠️ Partial Reset",
                  `Frontend: ${result.frontend ? "✅" : "❌"}\n` +
                  `Backend: ${result.backend ? "✅" : "❌"}\n\n` +
                  "Some data may not have been cleared.",
                  [{ text: "OK", onPress: () => resolve() }]
                );
              }
            } catch (error) {
              Alert.alert("Error", "Reset failed. Please try again.");
              resolve();
            }
          },
        },
      ]
    );
  });
}

/**
 * Show all stored data in AsyncStorage (for debugging)
 */
export async function showAllStoredData(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const result = await AsyncStorage.multiGet(keys);
    
    console.log("\n========== ASYNC STORAGE DATA ==========");
    if (result.length === 0) {
      console.log("(empty)");
    } else {
      result.forEach(([key, value]) => {
        console.log(`\n📦 ${key}:`);
        try {
          const parsed = JSON.parse(value || "null");
          console.log(JSON.stringify(parsed, null, 2));
        } catch {
          console.log(value);
        }
      });
    }
    console.log("=========================================\n");
  } catch (error) {
    console.error("Error reading storage:", error);
  }
}

/**
 * Show backend stats (for debugging)
 */
export async function showBackendStats(): Promise<void> {
  const stats = await getBackendStats();
  
  console.log("\n========== BACKEND DATABASE ==========");
  if (stats) {
    console.log(`👤 Users:       ${stats.users}`);
    console.log(`📋 Tasks:       ${stats.tasks}`);
    console.log(`👥 Teams:       ${stats.teams}`);
    console.log(`🔗 Memberships: ${stats.memberships}`);
    console.log(`📌 Assignments: ${stats.assignments}`);
  } else {
    console.log("(could not fetch backend stats)");
  }
  console.log("=======================================\n");
}