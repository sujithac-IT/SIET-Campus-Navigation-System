# 📱 Progressive Web App (PWA) & Offline Capabilities

## Features

- **Installable Web Application**: Native standalone UI experience on Android, iOS, Windows, and macOS via `public/manifest.json`.
- **Service Worker (`public/sw.js`)**: Network-first strategy for dynamic API routes; Stale-While-Revalidate strategy for app shell assets and floor map tiles.
- **Offline Navigation Graph**: Campus graph topology, room records, and recent timetable sessions are cached in browser storage.
- **Offline Indicator (`src/components/layout/OfflineIndicator.tsx`)**: Replaces live updates with an `OFFLINE MODE` badge when network connection drops.
