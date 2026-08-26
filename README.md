# 🍸 Piccolo

Self-hosted party games for you and your friends. Bilingual (English / French),
mobile-first, no accounts, no tracking, no internet required once it is running
on your LAN.

**39 games**, every one of them playable: 29 pass-the-phone, 15 multi-device,
five that do both. Around 1 700 bilingual cards, questions, spectrums and word
pairs behind them.

Two ways to play, both supported side by side:

| Mode | How it works | Needs |
| --- | --- | --- |
| **Pass the phone** | One device goes round the table. Runs entirely in the browser. | Nothing |
| **Room** | A big screen (TV/laptop) shows a 4-letter code + QR, everyone joins from their own phone. | The server, a WebSocket connection |

The phone only ever hides its screen when hiding it *is* the game — your word in
Mr White, your question in Paranoia, your role in Werewolf. Everything else is
one card and one button, because handing a device around for information that is
about to be said out loud anyway is just admin.

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
deck in one place: each card, question, spectrum and quiz answer, side by side in
English and French, with filters for 18+ and free-text search. Sessions last 8
hours, live in memory, and lock out an IP for 10 minutes after 8 wrong passwords.

The page reads from two places, because the content lives in two places.
Pass-the-phone decks ship inside the browser bundle so those games keep working
offline; multi-device decks only ever exist on the server, which localises a card
and broadcasts the resulting string, so the review page fetches them from
`/api/admin/content`. Either way the password guards the review page rather than
the card text — anyone can read the offline decks out of devtools regardless.

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
├── packages/shared/          Types + the game catalogue + the WS protocol
│   ├── src/games.ts          ← single source of truth for every game
│   └── src/roomgames.ts      Public state shapes for multi-device games
├── apps/server/              Fastify + ws. Serves the built web app.
│   └── src/games/
│       ├── registry.ts       RoomGame contract + registration
│       ├── index.ts          ← side-effect import that makes room games exist
│       ├── kit.ts            Deck cursors, vote counting, "has everyone answered"
│       ├── decks/            Multi-device content, never sent to the browser
│       └── <game>.ts         One state machine per game
└── apps/web/                 Vite + React 19 + Tailwind v4 + Motion
    ├── src/games/
    │   ├── _kit/             Shared pass-the-phone engine (see below)
    │   ├── <game>/           One folder per pass-the-phone game
    │   ├── registry.ts       ← a pass game becomes playable when listed here
    │   ├── content.ts        Deck → /admin review rows
    │   └── room/             Host + phone views for multi-device games
    │       └── registry.ts   ← a room game becomes playable when listed here
    ├── src/i18n/             en.ts is the source of truth, fr.ts is type-checked against it
    ├── src/net/room.ts       WebSocket client (auto-reconnect, seat recovery)
    └── src/screens/          Home, Library, Game detail, Play, Party, Host, Join, Admin
```

### The pass-the-phone kit

`src/games/_kit/` is why twenty-nine games are a few hundred lines each:

| Module | What it gives you |
| --- | --- |
| `pile.ts` | `usePile()` — a shuffled deck with a cursor that reshuffles instead of ending, and never deals the same card twice in a row. Rebuilds itself when the 18+ switch flips. |
| `timer.ts` | Countdowns and stopwatches measured against a deadline, so a phone that locks mid-round comes back already finished rather than silently paused. |
| `fuse.ts` | The hidden timer behind Bomb Party and Hot Potato: accelerating ticks, no number on screen. |
| `audio.ts` | A few hundred bytes of WebAudio instead of sample files — the app has to work with no network. |
| `cards.tsx` | A real 52-card deck, for King's Cup and the bus. |
| `players.ts` | Rotation and `{player}` substitution that never names whoever is already on the spot. |
| `ui.tsx` | `GameFrame`, `CardFace`, `SwipeCard`, `PlayerPicker`, `Tally`, `TimerBar`, `Standings`. |

Rooms live in memory only — no database, no volumes to back up. A room survives
a page reload on either side (host screen and phones both reclaim their seat
with a token), and is dropped once it has been empty for five minutes.

### Adding a pass-the-phone game

1. Add it to `packages/shared/src/games.ts` with `status: 'ready'`.
2. Create `apps/web/src/games/<id>/deck.ts` (bilingual, `adult` and `intensity`
   on every card) and `index.tsx` exporting a default component taking
   `LocalGameProps` (`meta`, `players`, `adult`, `onExit`).
3. Register it in `apps/web/src/games/registry.ts`, and its deck in
   `content.ts` so `/admin` can read it.
4. Add its strings under `games.<id>` in `src/i18n/en.ts` and `fr.ts`.

`sip-or-spill` is the shortest complete example; `piccolo-classic` shows the
escalation engine and `mr-white` shows a legitimate pass-the-phone handoff.

### Adding a multi-device game

1. Same catalogue entry, with `'room'` in `modes`.
2. Add the public state shape to `packages/shared/src/roomgames.ts` so the
   server that writes it and the two views that read it cannot drift.
3. Write a `RoomGame` in `apps/server/src/games/<id>.ts` and register it in
   `games/index.ts`. Games are **singletons** — one object serves every room, so
   all state goes through `ctx.setState()` (server-only) or `ctx.setPublic()`
   (broadcast), both stored per room. `ctx.schedule()` gives you timers that are
   cancelled automatically when the game stops.
4. Export `Host` and `Phone` from `apps/web/src/games/room/<id>.tsx` and list the
   module in `room/registry.ts`.
5. Put any deck in `apps/server/src/games/decks/` and flatten it into
   `games/content.ts` for the review page.

Three rules the existing games all follow:

- **Localise on the server.** `ctx.locale` plus `localize()` means decks never
  reach the browser and the wire carries strings, not cards.
- **Never wait on a dead phone.** `everyoneIn()` only counts connected players,
  and `playersChanged` re-checks whether the round can close.
- **High-frequency updates are events, not state.** Drawing strokes and tap
  counts go out via `ctx.emit()`; `setPublic()` rebroadcasts the whole room, so
  it is for phase changes and reconnects.

`poll.ts` (three games from one machine) and `write.ts` (two more) are the
cheapest places to start; `werewolf.ts` is the most involved.

---

## Content and consent

The 18+ decks are off by default, gated behind an explicit age confirmation on
each device, and can be disabled server-wide with `ALLOW_ADULT_CONTENT=false`.
Every drinking prompt works just as well with a glass of water — nobody should
ever be pressured into playing along.
