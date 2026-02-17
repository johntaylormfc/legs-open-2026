# legs-open-2026 - OpenClaw Review

## What It Is

A golf tournament management system for "The Legs Open" championship series. Built as a React single-page app using Supabase for the backend (PostgreSQL). Provides multi-tournament management with real-time scoring, World Handicap System calculations, and supports Medal and Stableford competition formats.

## 5 Main Functions

1. **Tournament Management** - Create, configure, and activate tournaments with year-based organization. Supports multiple active tournaments and tournament status tracking (is_active flag).

2. **Player Management** - Player profiles with handicap tracking, CDH numbers, bios, and photos. Links players to tournaments via tournament_players table with historical score data.

3. **Group/Flight Management** - Assign players to groups with tee times. Supports manual drag-and-drop assignment, group PINs for restricted access, and group-based scoring views.

4. **Live Scoring & Leaderboard** - Real-time score entry and leaderboard display. Supports multiple scoring formats: Gross, Net, Stableford, with configurable sort options. Scorecard viewing for any player in any tournament.

5. **Course Setup** - Search and import courses via Golf API. Configure hole-by-hole details, tee selections (male/female), par totals, course ratings, and slope ratings. Visual course editing.

## Suggested Improvements

1. **Security** - Group PINs stored in plain text; implement proper authentication (Supabase Auth) instead of PIN-based access

2. **Offline Support** - No service worker/PWA capabilities; add offline score entry with sync when reconnected

3. **Performance** - Large app.js (3468 lines); consider splitting into multiple components/modules for better maintainability

4. **API Key Security** - Golf API key exposed in client code; move to serverless function or backend proxy

5. **Testing** - No test coverage visible; add Jest/React Testing Library tests for critical scoring calculations
