import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

/**
 * Clear all AsyncStorage data
 * Use this to reset the app to a fresh state
 */
export async function clearAllAppData() {
  try {
    await AsyncStorage.clear();
    console.log("✓ All app data cleared successfully");
    return true;
  } catch (error) {
    console.error("Error clearing app data:", error);
    return false;
  }
}

/**
 * Clear specific keys only
 */
export async function clearTeamData() {
  try {
    await AsyncStorage.multiRemove([
      "tm:user",
      "tm:teams",
      "tm:memberships",
      "tm:currentTeamId",
    ]);
    console.log("✓ Team data cleared successfully");
    return true;
  } catch (error) {
    console.error("Error clearing team data:", error);
    return false;
  }
}

/**
 * Show all stored data (for debugging)
 */
export async function showAllStoredData() {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const result = await AsyncStorage.multiGet(keys);
    
    console.log("=== All Stored Data ===");
    result.forEach(([key, value]) => {
      console.log(`${key}:`, value);
    });
    console.log("======================");
    
    return result;
  } catch (error) {
    console.error("Error showing stored data:", error);
    return [];
  }
}