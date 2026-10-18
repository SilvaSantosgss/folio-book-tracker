# Folio — Everyday, upgraded

Private, single-player habit + task tracker with a gentle progression game. Responsive desktop sidebar and mobile bottom navigation. Google sign-in and Cloud Firestore; no build step.

## Shipped features
- **Habits:** custom schedules, scheduled-day streaks, numeric targets with +/- logging, last-six-day backfill, archive/restore, historical schedule changes.
- **Tasks:** priorities, due dates, categories, notes, checklists, daily/weekly recurrence, list and three-column board views, search and filters, archive/restore.
- **Game:** 10/20/40 XP by effort, rising level thresholds, daily side quests, achievements, virtual reward shop, activity history. Missed days do not remove XP.
- **Focus:** 25/45/60-minute sessions, pause/resume, optional task association, timer recovery on this device. Earn 20 XP for each of the first four completed sessions per day. Unfinished sessions earn nothing.
- **Personalization:** light/dark/system appearance, display name, daily XP goal, time zone.
- **Recovery:** JSON export/import, local recovery copies, pending-write restoration, realtime updates, revision-checked transactions, explicit conflict resolution.
- **Quick capture:** Ctrl/Command K search; N opens a task editor.

## Game rules
Each habit/date and task occurrence has one completion record. Toggling a completion does not stack XP; undo removes the associated XP and any resulting daily quest bonus. Effort/target values are recorded with the first check-in. Archived items retain their recorded history.

Daily quest bonuses: complete 3 habits (+20 XP), complete a task (+15 XP), finish a focus session (+15 XP). Each is counted at most once per calendar day. Level L starts at `50 × (L−1) × L` XP. Coins earned = floor(total XP / 10); claimed reward costs are subtracted. Undo after spending can create a negative coin balance; further earnings cover it before another reward can be claimed.

Achievements reflect recorded history; they are not permanent unlocks if the qualifying actions are undone. This is a personal, client-calculated game—not a tamper-proof competition, financial system, or public leaderboard. Rewards are virtual; users fulfill them in the real world.

## Privacy and cloud
- Habit/task state: `users/{uid}/tracker/state`, schemaVersion 2.
- Book state: `users/{uid}/library/state`, schemaVersion 1, preserved separately.
- Firestore access is restricted to the single approved, verified Google owner. Client Firebase config is public by design, not a database credential.
- Offline edits are retained locally and retried on reconnect. Initial sign-in and loading require internet. This is not a fully offline PWA.
- A focus timer continues by elapsed wall-clock time and is recorded when Folio is reopened. Local timer state is device-specific, not synced across devices.
- No billing, analytics, or paid integrations were enabled. The existing Spark plan and quotas still apply.
- Use Export backup regularly. Sign-out does not erase private recovery copies from this browser; clear site data on shared devices.
- State is capped at 780 KB to stay below Firestore's document limit. Large long-running histories may eventually need a multi-document migration.

## Files and deployment
- `index.html` — new habit/task UI and responsive styles
- `tracker.js` — interface logic, progression, timer, and private cloud sync
- `books.html` + `cloud.js` — original book tracker, unchanged data access
- `FEATURE_IDEAS.md` — shipped concept and next-step ideas, clearly distinguished

GitHub Pages: main branch, root directory. Firebase: `folio-book-tracker`, Firestore Standard in São Paulo, Google sign-in. Keep all four app files together. No personal progress is committed to GitHub.

Starter habits (reading, movement, language practice) and rewards are editable suggestions, not imported records from Notion or claims of completed activity. All XP starts at zero. There is no automatic Notion or wearable sync.

## Habit workspaces (v3)
Tap a checkbox to complete; tap the habit name or row to open its workspace. Desktop opens a side panel; mobile opens a full-height sheet.

- Eight editable templates and habit types: reading, home exercise, running/walking, languages, hydration, sleep, creative practice, and custom.
- Session checklists, notes, perceived effort, custom fields, quick-add presets, daily amounts, weekly completed-day goals, cues, reasons, and minimum versions.
- Specific log controls for each type: exercises/sets/reps/load notes, running pace, reading quotes, sleep times, and more. Reading notes do not automatically update the separate book library.
- 28-day history, personal mastery, best streak/week, duplicate without history, pause/resume, and reorder (desktop drag/drop or accessible Move up/down actions).
- Full target earns XP once per day. Partial/minimum/skip/rest entries do not award completion XP. Skip/rest are neutral for daily streaks. Weekly streaks count successful Monday–Sunday weeks; fully paused weeks are neutral.
- Existing records have optional profiles and keep their original history. Changes to goal frequency/weekly target after completed history require duplication, avoiding retroactive streak changes.
- Habit logs remain bounded by the existing 780 KB library limit; no image uploads or automatic wearable/book synchronization are included.
