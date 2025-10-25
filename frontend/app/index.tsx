import { useEffect } from "react";
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/(tabs)/login"); // redirect immediately to login
  }, []);
  return null;
}
