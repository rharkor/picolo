# 🍸 Piccolo

Self-hosted party games for you and your friends. Bilingual (English / French),
mobile-first, no accounts, no tracking, no internet required once it is running
on your LAN.

Two ways to play, both supported side by side:

| Mode | How it works | Needs |
| --- | --- | --- |
| **Pass the phone** | One device goes round the table. Runs entirely in the browser. | Nothing |
| **Room** | A big screen (TV/laptop) shows a 4-letter code + QR, everyone joins from their own phone. | The server, a WebSocket connection |

---

## Quick start

```bash
cp .env.example .env   # then edit PUBLIC_URL to your LAN IP or domain
docker compose up -d --build
```

Open `http://<your-host>:8080`. On the host screen tap **Everyone on their
phone** — friends scan the QR or type the code.

> Set `PUBLIC_URL` to something your friends' phones can actually reach
> (e.g. `http://192.168.1.42:8080`), otherwise the QR code points at
> `localhost` and only works on the host machine.

### Local development

```bash
npm install
npm run dev
```

- Web app on `http://localhost:5173` (Vite, hot reload)
- API + WebSocket on `http://localhost:8080` (proxied through Vite, so use 5173)
- The shared package is watched and rebuilt automatically

### Useful commands

```bash
npm run build        # build shared → server → web
npm start            # run the production server (serves apps/web/dist)
npm run typecheck    # type check every workspace
npm run docker:up    # build + start the container
npm run docker:down  # stop it
```

---

## Configuration

Everything is environment variables — see `.env.example`.

| Variable | Default | What it does |
| --- | --- | --- |
| `PORT` / `HOST` | `8080` / `0.0.0.0` | Listen address |
| `PUBLIC_URL` | *empty* | Base URL used for the join link and QR code. Falls back to the browser's own origin. |
| `ROOM_MAX_PLAYERS` | `16` | Cap per room |
| `ROOM_IDLE_TIMEOUT_MINUTES` | `90` | Idle rooms are garbage collected |
| `ALLOW_ADULT_CONTENT` | `true` | Set `false` to hide the 18+ switch entirely (family instance) |
| `INSTANCE_PASSWORD` | *empty* | Optional HTTP basic auth over the whole app (user `piccolo`) |
| `ADMIN_PASSWORD` | *empty* | Unlocks `/admin`, the content review page. Empty disables the page. |

### Reviewing content

Set `ADMIN_PASSWORD` and open `/admin` (also linked from Settings) to read every
deck in one place: each card, question and quiz answer, side by side in English
and French, with filters for 18+ and free-text search. Sessions last 8 hours,
live in memory, and lock out an IP for 10 minutes after 8 wrong passwords.

Worth knowing: pass-the-phone decks ship inside the browser bundle so games work
offline, so this password guards the review page, not the card text.

### Hosting a room

The host screen is a shared display by default: it shows the code and the QR,
and players join from their own phones. If you are hosting from the only device
in the room, the lobby has a **"Playing on this screen?"** panel — take a seat
and that same connection also holds a player, counted for `minPlayers` and for
per-player game payloads. Reloading the screen keeps both the room and the seat.

### Behind a reverse proxy

The app needs WebSocket upgrades on `/ws`. Example Caddy config:

```
piccolo.example.com {
    reverse_proxy localhost:8080
}
```

Nginx needs the upgrade headers explicitly:

```nginx
location / {
    proxy_pass http://localhost:8080;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
}
```

---

## Architecture

```
piccolo/
├── packages/shared/        Types + the game catalogue + the WS protocol
│   └── src/games.ts        ← single source of truth for every game
├── apps/server/            Fastify + ws. Serves the built web app.
│   └── src/games/          Server-side logic for multi-device games
└── apps/web/               Vite + React 19 + Tailwind v4 + Motion
    ├── src/games/          Pass-the-phone games (one folder each)
    │   └── registry.ts     ← a game becomes playable when listed here
    ├── src/i18n/           en.ts is the source of truth, fr.ts is type-checked against it
    ├── src/net/room.ts     WebSocket client (auto-reconnect, seat recovery)
    └── src/screens/        Home, Library, Game detail, Play, Party, Host, Join
```

Rooms live in memory only — no database, no volumes to back up. A room survives
a page reload on either side (host screen and phones both reclaim their seat
with a token), and is dropped once it has been empty for five minutes.

### Adding a pass-the-phone game

1. Flip its `status` to `'ready'` in `packages/shared/src/games.ts`.
2. Create `apps/web/src/games/<id>/index.tsx` exporting a default component
   that takes `LocalGameProps` (`meta`, `players`, `adult`, `onExit`).
3. Register it in `apps/web/src/games/registry.ts`.
4. Add its strings under `games.<id>` in `src/i18n/en.ts` and `fr.ts`.

`never-have-i-ever` is the reference implementation, deck included.

### Adding a multi-device game

Same catalogue flip, plus a `RoomGame` in `apps/server/src/games/` registered
via `registerRoomGame()`, and a host-screen + phone view on the web side. The
server owns all state; clients only render `room:state` and send
`game:action`.

---

## Content and consent

The 18+ decks are off by default, gated behind an explicit age confirmation on
each device, and can be disabled server-wide with `ALLOW_ADULT_CONTENT=false`.
Every drinking prompt works just as well with a glass of water — nobody should
ever be pressured into playing along.
