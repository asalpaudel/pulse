import Constants from "expo-constants";

// API base resolution order:
//   1. EXPO_PUBLIC_API_BASE env (override per-machine without touching app.json)
//   2. expo.extra.apiBase from app.json (the committed default — your LAN IP)
//   3. localhost fallback (simulator on the same machine)
//
// A phone cannot reach "localhost" — it must point at the dev machine's LAN IP
// (e.g. http://192.168.1.127:8080) or a deployed backend. Change it in app.json
// → expo.extra.apiBase, or export EXPO_PUBLIC_API_BASE before `npm start`.
const fromExtra =
  Constants.expoConfig?.extra?.apiBase ??
  Constants.manifest?.extra?.apiBase ??
  null;

export const API_BASE =
  process.env.EXPO_PUBLIC_API_BASE || fromExtra || "http://localhost:8080";
