# Phase 2 Task 3 Read-only Team QC — Amolytics Finance

Date: 2026-05-10  
Module/Flow: Read-only Team Supabase integration with fallback mode  
Status: Pending Antigravity QC

## Objective

Verify that the Team page has been safely connected to Supabase in read-only mode while preserving fallback behavior and keeping the rest of the app stable.

This QC pass should confirm that only Settings and Team are connected to Supabase so far.

## Scope

Check these areas:

1. Team data access
   - src/lib/data/team.ts exists
   - getActiveTeamMembers() exists
   - Missing Supabase env vars return fallback team data
   - Supabase query errors return fallback team data with console.warn
   - Successful query with zero rows returns fallback team data
   - Successful query with rows returns normalized database team rows
   - Only active team members are returned by default
   - Team members are sorted by name ascending

2. Team database types
   - src/lib/supabase/types.ts includes team_members support
   - team_members row type supports:
     - id
     - name
     - role
     - base_salary
     - currency
     - bank_name
     - bank_account_masked
     - active
     - notes
     - created_at
     - updated_at
   - Numeric values are handled safely if returned as string or number from Postgres

3. Team UI
   - /team uses getActiveTeamMembers()
   - /team renders fallback team members without .env.local
   - /team shows:
     - team member name
     - role
     - base salary
     - currency
     - bank name or masked bank info when available
     - active status
   - /team includes a muted fallback/database mode note
   - /team remains visually consistent with Phase 1 design

4. Fallback team data
   - Fallback includes:
     - Ganpat
     - Kamal
     - Vinod
     - Vasudev
     - Siddhatta
   - Existing mock team data was not deleted unnecessarily

5. Supabase scope
   - /settings is connected to Supabase read-only
   - /team is connected to Supabase read-only
   - /dashboard remains mock-based
   - /invoices remains mock-based
   - /payments remains mock-based
   - /salaries remains mock-based
   - /expenses remains mock-based
   - /tasks remains mock-based
   - /reports remains mock-based
   - No CRUD forms were introduced
   - No auth/login UI was introduced
   - No protected routes were introduced
   - No middleware was introduced unless already justified

6. Documentation
   - docs/2026-05-10-phase-2-task-3-readonly-team.md exists
   - It explains:
     - what was implemented
     - files changed
     - why Team was chosen after Settings
     - fallback behavior
     - Supabase table read
     - what is intentionally not implemented
     - how to verify with and without Supabase env vars
     - next recommended task

7. Technical checks
   - npm run lint passes
   - npm run build passes
   - npm run dev starts
   - App works without .env.local
   - /team is dynamic if needed
   - No real secrets are committed
   - No service role key is used

## Known Verification Note

An earlier combined command run failed because another `next build` process was already running. This is not considered an app failure if a later standalone `npm run build` passes cleanly and Antigravity confirms the sequential verification passes.

## Antigravity QC Instructions

Use Antigravity as a QA engineer and reviewer.

Perform a complete QC pass for Phase 2 Task 3.

Steps:

1. Read:
   - docs/2026-05-10-phase-2-task-3-readonly-team.md
   - docs/2026-05-10-phase-2-task-3-readonly-team-qc.md
   - src/lib/data/team.ts
   - src/lib/data/settings.ts
   - src/lib/supabase/env.ts
   - src/lib/supabase/types.ts
   - src/app/(app)/team/page.tsx
   - src/app/(app)/settings/page.tsx

2. Run sequentially, making sure no other Next build is active:
   - npm run lint
   - npm run build
   - npm run dev

3. Test without .env.local:
   - Confirm app starts
   - Confirm /team loads
   - Confirm /team shows fallback team members:
     - Ganpat
     - Kamal
     - Vinod
     - Vasudev
     - Siddhatta
   - Confirm no runtime crash happens because Supabase env vars are missing

4. Verify Team page content:
   - Team member names are visible
   - Roles are visible
   - Salary/currency values are visible
   - Bank/masked bank info appears where available
   - Active status appears
   - Fallback/database mode note is visible
   - Layout is readable on desktop and mobile

5. Verify Settings page still works:
   - /settings loads
   - fallback/database mode still works
   - exchange rate, client, and bank accounts still render

6. Verify other pages remain mock-based:
   - Visit /dashboard
   - Visit /invoices
   - Visit /payments
   - Visit /salaries
   - Visit /expenses
   - Visit /tasks
   - Visit /reports
   - Confirm they still load and were not prematurely connected to Supabase

7. Code search:
   - Search for Supabase imports
   - Confirm only expected files use Supabase:
     - Supabase utility files
     - settings data/page files
     - team data/page files
   - Search for:
     - service_role
     - SUPABASE_SERVICE_ROLE
     - password
     - secret
     - real Supabase project URL patterns
   - Confirm no unsafe secrets exist

8. Review fallback behavior:
   - Confirm missing env vars trigger fallback
   - Confirm query error path returns fallback
   - Confirm successful zero-row query path returns fallback
   - Confirm fallback behavior is documented

9. Review architecture:
   - Confirm this is read-only only
   - Confirm no CRUD forms were introduced
   - Confirm no auth/protected-route/middleware work was introduced
   - Confirm invoices/payments/salaries/expenses/dashboard/reports were not prematurely connected

Return a structured QC report with:

## Passed Checks

- **Team Data Layer:** `getActiveTeamMembers()` correctly fetches data from `team_members` and implements safe fallback logic via `hasSupabaseEnv()`.
- **Database Types:** Types correctly mapped for `team_members` with salary normalization handling Postgres generic numerics.
- **Team UI:** `/team` successfully renders the fallback list (Ganpat, Kamal, Siddhatta, Vasudev, Vinod) identically to Phase 1, with a clearly visible banner indicating "Roster source: fallback".
- **Settings Integrity:** `/settings` remains fully functional in its own fallback state.
- **Mock Scope:** `/dashboard`, `/invoices`, and other pages verified to be completely isolated from Supabase and still using mock static data.
- **Technical Checks:** Standalone `npm run lint` and `npm run build` executed successfully (exit code 0). The Next.js build strictly marked `/settings` and `/team` as dynamic (`force-dynamic`), keeping all other routes statically optimized.

## Failed Checks / Bugs

None. Zero issues detected.

## Fallback Mode Review

**PASSED**. Fallback behavior correctly functions for:
- Missing env vars: Handled cleanly by `team.ts` without attempting to load `createClient()`.
- Query errors / Zero-row returns: Safe error handling and empty-checks return the standard fallback array alongside a `console.warn`.

## Supabase Scope Review

**PASSED**. Exhaustive `grep` searches over the `src/app` directory confirmed Supabase imports (`lib/supabase/env`) exist only in `settings/page.tsx` and `team/page.tsx`.

## Security / Secrets Review

**PASSED**. Searches for `service_role`, `SUPABASE_SERVICE_ROLE`, `password`, and `secret` returned zero hits. No hardcoded or unsafe secrets were committed.

## Build/Lint Review

**PASSED**. The earlier overlapping process conflict was successfully resolved by running a clean, standalone `npm run build`. The build passed cleanly without any type or dependency errors.

## Missing Items

None. Everything from the Task 3 scope is present and correct.

## Technical Risks

None. The application remains highly stable. The data layer isolation model continues to prove resilient for iterative migration.

## Final Recommendation

**Pass Phase 2 Task 3 and move to Task 4.**

## Expected Results

Expected result: Phase 2 Task 3 should pass with no critical or high-severity issues.

The app must build, lint, run without `.env.local`, and show fallback Team data when Supabase is not configured or not seeded.

## Issues Found

None.

## Fixes Applied

None required.

## Final QC Status

**PASSED**. Ready for Phase 2 Task 4.
