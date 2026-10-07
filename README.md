# Tribute Chronicles · Hunger Games AI

An Ink story opening followed by a playable seeded survival arena. Train a tribute, explore an 8×8 wilderness, find supplies, craft a camp, and face eleven roaming opponents.

## Run locally

Use Node 22.13 or newer (the deployment pins Node 22.23.3):

```sh
npm ci
npm run build
npm test
npm start
```

The server serves the game and account pages. `PORT` defaults to 3000. `npm run build` compiles `story.ink` into `public/story.json`; commit both when changing the opening story. A single server uses SQLite and needs a persistent writable disk for accounts and cloud saves. See [DEPLOYMENT.md](DEPLOYMENT.md) for hosting and environment variables.

## Gameplay

Choose Story, Standard, or Hard before entering the arena. An optional numerical seed reproduces the same world and initial tribute positions. The world advances only for valid actions that can actually be performed. Actions consume energy; hunger and thirst rise over time. Rivers provide water, forests provide extra wood, and supply caches are single use.

Use the quick action buttons, type commands, click an adjacent map tile, or use arrow keys outside inputs. Commands include `north`, `south`, `east`, `west`, `search`, `gather wood`, `search water`, `rest`, `hide`, `observe`, `eat`, `drink`, `use medicine`, `attack`, `craft shelter`, `craft trap`, `craft fire`, and `craft bandage`.

Shelters improve rest. Campfires protect against storms. Traps damage roaming tributes. Objective rewards and defeated opponents grant sponsor points; `sponsor food`, `sponsor water`, or `sponsor medicine` exchanges 15 points for supplies. The arena tracks day, weather, exploration, nearby opponents, and an event journal. Zero health ends a run permanently; defeating the remaining opponents wins it.

The device record tracks completed runs, victories, best survival day, and five achievements. Repeatedly restoring the same completed checkpoint does not add another result. Device records and community results are player-controlled, so the community leaderboard is a casual showcase.

## Saves and accounts

Local checkpoints work without signing in. Resume restores the Ink opening, arena seed and random state, supplies, opponents, objectives, and journal. JSON export/import provides portable backups; the story transcript can also be exported as text. Accounts add named cloud saves with overwrite, loading, and deletion. Save ownership is checked on every read and write.

The old story checkpoint format remains readable; an old checkpoint at the arena entrance starts the new survival engine. The game uses a free local director for narration and natural-language interpretation. It needs no provider key or account and makes no paid API calls. Provider behavior is tested with simulated responses and outages; real paid AI calls and email delivery were not exercised in cloud validation.

## Validation and safeguards

`npm test` runs 34 tests for authentication/save ownership, private feedback, signed-in community submissions, Ink compilation and paths, deterministic arena recovery, crafting costs, invalid actions, zero-health behavior, visibility, and run records. Public password-reset and feedback-list routes are disabled. JWT keys use `JWT_SECRET` when provided or a generated private file, with no published default account. Player requests and generated narration are not logged in full.

## Arena director overhaul

The story director now receives the resolved action, current arena state, training attributes, visible nearby tributes, inventory, weather, and six recent story memories. Hidden map tiles and distant opponent locations are excluded from the provider context. Narration never changes health, supplies, random state, or the outcome of a completed action.

Choose Cinematic, Tactical, or Brief narration, or turn narration off. The local director works immediately without an account or API key. The browser generates narration locally for all players, even when the server has a provider key configured. Narration style and enable/disable preferences persist on the device. Recent story memory travels with checkpoints and cloud saves.

The survival coach proposes up to three commands based on visible threats and resource priorities, with risk labels and explanations. Natural-language phrases such as “build a tent,” “fill my flask with water,” and “head north quietly” map to existing commands. The natural-language toggle controls local phrase interpretation; unsupported requests show command suggestions. Interpreted commands require confirmation and do not consume an action until confirmed. AI cannot add arbitrary commands or make unsupported mechanics happen.

The optional backend provider endpoints remain available for custom clients; the game UI does not call them. For those clients, set `OPENAI_API_KEY` securely in Render. `OPENAI_MODEL` is optional and defaults to `gpt-4.1-mini`; the chosen model must support strict JSON-schema responses through Chat Completions. Paid calls require sign-in and are bounded to 12 requests per minute per account, one request at a time, and a 12-second provider timeout. Quotas are per server process. No client-side key is required or sent to the browser.

`GET /api/ai/status` reports provider availability without exposing credentials. `GET /api/version` identifies this client/server release as `arena-ai-4` and reports `RENDER_GIT_COMMIT` when available. The page footer also shows “Arena AI 4.”

### If an older choice error keeps appearing

Logs containing `[DEEP DEBUG]`, `main.js:777`, or `ink.js?v=2.3.2` come from the older client. The current client uses guarded buttons and a different asset version. In Render, select the HungerGamesAI service, verify it uses this repository's `main` branch, and use **Manual Deploy → Deploy latest commit**. The build command is `npm ci --include=dev && npm run build`; the start command is `npm start`. Then reload the game. Preserve a checkpoint or cloud save before clearing browser storage.

## SQLite runtime compatibility

Accounts and saves use Node's built-in `node:sqlite` driver. There is no separately downloaded SQLite native addon, so startup does not depend on an addon requiring `GLIBC_2.38`. Existing SQLite databases keep their schema, user IDs, password hashes, and saved runs. Save/statistics deletion uses a transaction. `.node-version` and the Render blueprint pin Node 22.23.3; `package.json` requires at least Node 22.13.
