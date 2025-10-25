import { View, Text } from "react-native";
import { Link } from "expo-router";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        backgroundColor: "#f5f5f5",
      }}
    >
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>Task Manager</Text>

      <Link href="/tabs/dashboard" style={btnStyle}>
        <Text style={txtStyle}>Dashboard</Text>
      </Link>

      <Link href="/tabs/login" style={btnStyle}>
        <Text style={txtStyle}>Login</Text>
      </Link>

      <Link href="/tabs/register" style={btnStyle}>
        <Text style={txtStyle}>Register</Text>
      </Link>

      <Link href="/tabs/profile" style={btnStyle}>
        <Text style={txtStyle}>Profile</Text>
      </Link>
    </View>
  );
}

const btnStyle = {
  backgroundColor: "#007bff",
  paddingHorizontal: 20,
  paddingVertical: 10,
  borderRadius: 8,
};
const txtStyle = {
  color: "white",
  fontWeight: "bold",
  fontSize: 16,
};
