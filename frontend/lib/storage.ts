import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  USER: "tm:user",
  TEAMS: "tm:teams",
  MEMBERSHIPS: "tm:memberships",
  CURRENT_TEAM: "tm:currentTeamId",
} as const;

export type User = { id: string; name: string; initials: string };
export type Team = { id: string; name: string; code: string; createdAt: string; creatorId?: string };

export async function getUser(): Promise<User | null> {
  const raw = await AsyncStorage.getItem(KEYS.USER);
  return raw ? JSON.parse(raw) : null;
}
export async function setUser(u: User) {
  await AsyncStorage.setItem(KEYS.USER, JSON.stringify(u));
}

export async function getTeams(): Promise<Team[]> {
  const raw = await AsyncStorage.getItem(KEYS.TEAMS);
  return raw ? JSON.parse(raw) : [];
}
export async function saveTeams(teams: Team[]) {
  await AsyncStorage.setItem(KEYS.TEAMS, JSON.stringify(teams));
}

export async function getMemberships(): Promise<{ userId: string; teamId: string }[]> {
  const raw = await AsyncStorage.getItem(KEYS.MEMBERSHIPS);
  return raw ? JSON.parse(raw) : [];
}
export async function saveMemberships(m: { userId: string; teamId: string }[]) {
  await AsyncStorage.setItem(KEYS.MEMBERSHIPS, JSON.stringify(m));
}

export async function getCurrentTeamId(): Promise<string | null> {
  return (await AsyncStorage.getItem(KEYS.CURRENT_TEAM)) as string | null;
}
export async function setCurrentTeamId(teamId: string) {
  await AsyncStorage.setItem(KEYS.CURRENT_TEAM, teamId);
}