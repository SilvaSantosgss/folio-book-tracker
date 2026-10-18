# Folio — Your reading life

A responsive personal book tracker, hosted on GitHub Pages with Google Firebase Authentication and Cloud Firestore.

## Files
- `index.html`: interface, local backup functions, embedded sample covers
- `cloud.js`: Google sign-in, realtime cloud sync, and revision-checked writes

## Privacy and storage
Google sign-in is required to display the library. Firestore rules restrict access to the project's single approved, verified Google owner. Other accounts cannot read or write library data. The Firebase client config is public by design; it does not grant database access.

Books, reading progress, notes, ratings, and the reading goal are stored at `users/{uid}/library/state`. Source code and example covers are public; personal books are not committed to this repository. Browser-local copies and pending edits support recovery; export JSON for an extra backup. Sign out and clear site data on shared computers after exporting any unsynced changes.

On first sign-in, an existing library from this browser is uploaded only if there is no cloud library. Otherwise, the cloud library loads. Existing pending changes from this account are restored separately. Concurrent edits are checked using revisions; conflicts require explicit confirmation before replacing cloud data. The app does not silently overwrite newer revisions.

## Firebase project
`folio-book-tracker` — Firestore Standard, São Paulo (`southamerica-east1`), Spark plan. Google Analytics and optional Gemini assistance are disabled. No billing was enabled. Firebase quotas still apply.

The allowed website origin is `silvasantosgss.github.io`. Sign-in uses a Google popup, which must be allowed. The Firebase SDK is loaded from `www.gstatic.com` and internet access is required for initial sign-in and cloud loading.

## Deploy
GitHub Pages: main branch, repository root. No build step. Keep `index.html` and `cloud.js` together.

## Features
Reading shelves; progress; ratings; notes; customizable library goal; search and sort; JSON export/import; system light/dark mode; responsive mobile layout. Initial books are examples, not the owner's reading history. Sample covers come from Open Library.
