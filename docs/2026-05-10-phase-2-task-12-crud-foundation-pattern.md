# Phase 2 — Task 12: CRUD foundation pattern

Date: 2026-05-10

## What was implemented

Reusable building blocks for **manual CRUD** (Task 13+), without wiring any business module yet.

### Form layout (full-page / section style)

| Component | Path | Role |
|-----------|------|------|
| **FormSection** | `src/components/forms/form-section.tsx` | Wraps **`SectionCard`** for consistent form sections. |
| **FormActions** | `src/components/forms/form-actions.tsx` | Footer row for cancel + submit. |
| **FieldError** | `src/components/forms/field-error.tsx` | Inline **`role="alert"`** message; use with **`aria-describedby`**. |
| **SubmitButton** | `src/components/forms/submit-button.tsx` | **`useFormStatus`** + **`Button`**; shows pending label while action runs. |

### Shared UI

| Component | Path | Role |
|-----------|------|------|
| **Input** | `src/components/ui/input.tsx` | Base text input styling aligned with design tokens. |

### Validation and server action results

| Module | Path | Role |
|--------|------|------|
| **ActionResult** | `src/lib/forms/action-result.ts` | **`success` / `failure`**, **`FieldErrorMap`**, Zod issue → field map helper. |
| **parseFormDataWithSchema** | `src/lib/forms/parse-form-data.ts` | **`FormData` → object** (strings; empty → `undefined`), **`safeParse`** with Zod. |
| **useZodForm** | `src/lib/forms/use-zod-form.ts` | **`react-hook-form`** + **`zodResolver`** (Zod 4 uses a narrow internal cast so types stay strict at call sites). |

### Cache refresh after mutations

| Module | Path | Role |
|--------|------|------|
| **revalidateFinancePaths** | `src/lib/server/revalidate-paths.ts` | Calls **`revalidatePath`** for default app routes; pass a subset when appropriate. |

### Internal reference

| Module | Path | Role |
|--------|------|------|
| **CRUD_FOUNDATION_DOC** | `src/lib/forms/crud-foundation.example.ts` | Points to this doc; **not** used by routes (no new visible UX). |

## Dependencies (already in repo)

- **`zod`**, **`react-hook-form`**, **`@hookform/resolvers`** — no new packages.

## Recommended server action shape (Task 13+)

1. **`'use server'`** at top of the action module (or per function).
2. **`parseFormDataWithSchema(formData, schema)`** → on failure return **`failure(...)`** (client can **`useActionState`** / **`useFormState`** to show **`message`** + **`fieldErrors`**).
3. Perform Supabase mutation (with **`hasSupabaseEnv`** guard if needed — keep read-only fallback elsewhere).
4. On success: **`revalidateFinancePaths([...])`** and optionally **`redirect(...)`** from **`next/navigation`**.
5. Return **`success(payload)`** or **`failure('…')`** for domain errors (unique constraint, etc.).

## Client form shape (Task 13+)

- **`useZodForm({ schema, defaultValues })`** for interactive validation.
- Prefer **simple full-page or section forms** before modals.
- **`SubmitButton`** must live **inside** the **`<form>`** that posts the server action (so **`useFormStatus`** works).
- Map **`fieldErrors`** from the last action result to **`FieldError`** / **`setError`** as you prefer.

## Loading, success, and error UX

- **Loading**: **`SubmitButton`** pending state + disabled submit.
- **Validation errors**: **`FieldError`** + optional form-level banner from **`result.message`**.
- **Success**: redirect or **`revalidatePath`** + toast (when you add toasts later).

## Soft-delete / deactivate (strategy notes)

- Prefer **`active: false`** or **`deleted_at`** (where schema allows) instead of hard **`DELETE`**, so history and FK integrity stay intact.
- UI: filter inactive rows from default lists; allow “show inactive” only where useful (e.g. admin/settings).
- Align with **`docs/2026-05-10-phase-2-data-model-and-crud-plan.md`** per table.

## Intentionally not implemented

- No CRUD for clients, bank accounts, invoices, etc. (Task 13+).
- No auth, middleware, or protected routes.
- No change to read-only / fallback data layers.

## Files added

- `src/components/forms/form-section.tsx`
- `src/components/forms/form-actions.tsx`
- `src/components/forms/field-error.tsx`
- `src/components/forms/submit-button.tsx`
- `src/components/ui/input.tsx`
- `src/lib/forms/action-result.ts`
- `src/lib/forms/parse-form-data.ts`
- `src/lib/forms/use-zod-form.ts`
- `src/lib/forms/crud-foundation.example.ts`
- `src/lib/server/revalidate-paths.ts`
- `docs/2026-05-10-phase-2-task-12-crud-foundation-pattern.md` (this file)
- `docs/2026-05-10-phase-2-task-12-crud-foundation-pattern-qc.md`

## How to verify

- **`npm run lint`** and **`npm run build`** pass.
- App routes unchanged in behavior; no new navigation items for unfinished CRUD.

## Next recommended task

- **Phase 2 Task 13 — Clients + Bank Accounts CRUD**
