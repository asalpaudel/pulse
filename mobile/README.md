# Pulse Mobile (Donor)

React Native (Expo SDK 56) donor app for the Pulse blood-coordination platform.
Reuses the same REST API and JWT auth as the web app (see `../API_CONTRACT.md`).

## Run

```sh
cd mobile
npm install          # first time only
npm start            # Expo dev server — scan the QR with Expo Go
```

The backend must be running (`cd ../frontend && npm run dev:api`, or `cd ../backend && ./mvnw spring-boot:run`).

## Pointing the app at the backend

A phone **cannot** reach `localhost` — it needs the dev machine's LAN IP. The default
is set in `app.json` → `expo.extra.apiBase` (currently `http://192.168.1.127:8080`).

- iOS simulator / Android emulator on the same machine can use `http://localhost:8080`.
- Real device: phone and computer must be on the same Wi-Fi; set your machine's LAN IP.
- Override without editing `app.json`:

```sh
EXPO_PUBLIC_API_BASE="http://<your-lan-ip>:8080" npm start
```

Find your IP: `ipconfig getifaddr en0` (macOS).

## Architecture

```
src/
  config.js              API base resolution (env → app.json → localhost)
  theme/                 design tokens — mirrors the web tailwind config
  api/                   axios client + per-resource modules (ported from web)
    client.js            JWT injected from expo-secure-store; 401 → logout
    storage.js           expo-secure-store wrapper (token + cached user)
  context/               AuthContext, NotificationsContext, ToastContext
  hooks/useWebSocket.js  STOMP over the SockJS raw transport (/ws/websocket)
  navigation/            RootNavigator (auth vs main) + bottom TabNavigator
  components/            shared cards (RequestCard, EventCard, …) + Logo
    ui/                  the design-system kit (Button, Card, Input, pills, …)
  screens/               Login/Register, Home, Requests, Events, Profile, Notifications
```

## Notes

- Real-time emergency alerts use STOMP over the native WebSocket transport. If the
  raw handshake is refused on a device, `NotificationsContext` falls back to polling
  the notifications endpoint every 20s, so alerts still arrive.
- True background push notifications (Expo Push) are a future phase and require a small
  additive backend change to store device tokens.
