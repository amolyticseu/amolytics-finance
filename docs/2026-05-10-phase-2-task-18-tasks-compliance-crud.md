# Phase 2 — Task 18: Tasks / Compliance CRUD

Date: 2026-05-10  
Status: Implemented

## What was implemented

Manual **create / edit / delete** and **status actions** for **tasks**, using the Task 12–17 CRUD foundation. No reminders, notifications, or compliance automation.

### Routes

| Route | Purpose |
|-------|---------|
| `/tasks` | Checklist with **Add task**, edit/view links |
| `/tasks/new` | Create |
| `/tasks/[id]/edit` | Edit / view, status actions, delete |

### Fields

| Field | Notes |
|-------|--------|
| `title` | Required |
| `description` | Optional |
| `category` | invoice, payment, salary, compliance, tax, company, bank, other |
| `status` | todo, in_progress, done, blocked |
| `priority` | low, medium, high, urgent |
| `due_date` | Optional date |
| `completed_at` | Optional date (stored as timestamptz); set automatically on **Mark done** |
| `related_entity_type` | Optional text (invoice, payment, expense, etc.) |
| `related_entity_id` | Optional UUID |
| `notes` | Optional |

### Status actions (edit page)

| Action | Effect |
|--------|--------|
| **Mark done** | `status: done`, `completed_at: now` |
| **Mark blocked** | `status: blocked`, clears `completed_at` |
| **Reopen** | `status: todo`, clears `completed_at` |

### Server actions

| Action | Path |
|--------|------|
| `saveTaskAction` | Create / update |
| `deleteTaskAction` | Hard delete (schema has no `deleted_at`) |
| `markTaskDoneAction` | Quick done |
| `markTaskBlockedAction` | Quick blocked |
| `reopenTaskAction` | Quick reopen |

### Data layer (`src/lib/data/tasks.ts`)

| Function | Role |
|----------|------|
| `getTasks()` | List + `canMutate`; **fallback unchanged** when env missing or empty/error |
| `getTaskById(id)` | Single row; fallback ids read-only |
| `sortTaskRows` | Unchanged sort for list and dashboard consumers |

### Components

- `src/components/tasks/task-form.tsx`
- `src/lib/validation/task-schema.ts`
- `src/lib/forms/task-form-defaults.ts`

### Revalidation

After mutations: `/tasks`, `/dashboard` only.

## Fallback behaviour (preserved)

| Scenario | List | CRUD |
|----------|------|------|
| No Supabase env | Mock checklist | Disabled |
| Env + empty/error | Mock list (existing) | Enabled when env present |
| `local-fallback-task-*` ids | Shown in mock list | Read-only view |

Dashboard, reports, expenses, salaries, payments, and invoices are **unchanged** (read logic; path revalidation on task writes).

## Intentionally not implemented

- Reminders or notifications
- Advanced compliance automation
- CSV import or bulk operations
- `deleted_at` soft-delete (not in schema — use hard delete)

## How to verify

1. Without env: `/tasks` mock rows; **Add task** hidden; edit is read-only.
2. With env: create task, edit fields, mark done / blocked / reopen, delete.
3. Confirm `local-fallback-task-*` rows cannot be saved, status-updated, or deleted.
4. **CI:**

```bash
npm run lint
npm run build
```

## Next recommended task

Follow Phase 2 backlog (e.g. reports enhancements or import flows when scoped).
