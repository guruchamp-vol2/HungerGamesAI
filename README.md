# Tribute Chronicles · Hunger Games AI

An Ink story opening followed by a playable seeded survival arena. Train a tribute, explore an 8×8 wilderness, find supplies, craft a camp, and face eleven roaming opponents.

## Run locally

Use Node 22 or newer:

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

The old story checkpoint format remains readable; an old checkpoint at the arena entrance starts the new survival engine. Optional AI narration adds prose after a locally resolved action and does not change arena outcomes. It requires a signed-in account and a configured `OPENAI_API_KEY`; local play works without a key. External AI and email delivery were not exercised in the cloud validation.

## Validation and safeguards

`npm test` runs 17 tests for authentication/save ownership, private feedback, signed-in community submissions, Ink compilation and paths, deterministic arena recovery, crafting costs, invalid actions, zero-health behavior, visibility, and run records. Public password-reset and feedback-list routes are disabled. JWT keys use `JWT_SECRET` when provided or a generated private file, with no published default account. Player requests and generated narration are not logged in full.
