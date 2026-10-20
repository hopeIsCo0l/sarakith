# Security Setup (Phase 1)

This document covers the Phase 1 hardening: Supabase Auth for the admin panel, an
admin allowlist enforced by RLS, locked-down storage, and a restricted CORS policy.

## What changed

- The hardcoded admin passcode was removed. The admin panel now signs in with
  Supabase Auth email/password.
- All `WITH CHECK (true)` write policies were replaced with admin-only policies
  based on `public.is_admin()`.
- Public product reads now only return rows where `is_visible = true`.
- Storage uploads/updates/deletes in the `product-media` bucket are admin-only.
- The backend CORS policy uses `FRONTEND_URL` instead of `*`.
- The Telegram bot fails closed when `ALLOWED_ADMIN_IDS` is empty.
- Frontend upgraded to Next.js 16 + React 19; Node.js 22+ is required.

## Required environment variables

Frontend (`frontend/.env.local`):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

Backend (`backend/.env`):

```bash
BOT_TOKEN=...
ALLOWED_ADMIN_IDS=123456789
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
FRONTEND_URL=https://your-production-frontend-url
# Optional extra origins, comma-separated:
# ALLOWED_ORIGINS=https://staging.example.com
PORT=8000
ENVIRONMENT=production
```

## Apply order

Do this once per Supabase project. Do it in a staging project first if possible.

### 1. Create the admin user

In the Supabase Dashboard:

1. Go to **Authentication > Users** and create a user with the admin email and a
   strong password. Confirm the email if confirmation is enabled.
2. Go to **Authentication > Providers / Settings** and disable public sign-ups.
   Admins should be added manually.

### 2. Apply the migration

Back up the database first (Dashboard > Database > Backups).

**Option A — SQL Editor:** open `supabase/migrations/20261019000000_security_hardening.sql`,
paste it into the SQL Editor, and run it.

**Option B — Supabase CLI:**

```bash
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

A fresh database can instead run the updated `supabase-schema.sql`, which now
includes the same secure policies.

### 3. Add the admin to the allowlist

Replace the email with the user created in step 1, then run in the SQL Editor:

```sql
INSERT INTO public.admin_users (user_id, email)
SELECT id, email
FROM auth.users
WHERE email = 'admin@example.com'
ON CONFLICT (user_id) DO UPDATE SET email = EXCLUDED.email;
```

### 4. Deploy the frontend

Deploy this branch (or merge it) with the environment variables above. Set the
hosting provider's Node.js version to 22+.

## Verification checklist

Run these after deploying:

1. Sign in at `/admin` with the admin email/password. The dashboard should load.
2. Sign in with a non-admin account. It should be rejected and signed out.
3. Confirm anonymous writes are rejected with curl:

```bash
# Replace the project URL and anon key. Expect HTTP 401/403.
curl -sS -o /dev/null -w '%{http_code}\n' -X POST \
  'https://YOUR_PROJECT.supabase.co/rest/v1/products' \
  -H 'apikey: YOUR_ANON_KEY' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -H 'Prefer: return=minimal' \
  -d '{"name":"blocked","slug":"blocked-test","description":"x","price":0}'
```

4. Confirm an anonymous upload to `product-media` is rejected from the
   Supabase Dashboard's storage API tester or with the anon key.
5. Confirm hidden products (`is_visible = false`) are not returned by the
   public `products` query, but are visible inside the admin panel.
6. Confirm the Telegram bot rejects a Telegram account that is not in
   `ALLOWED_ADMIN_IDS`.

SQL-level checks:

```sql
-- Should return 0 rows for anon/authenticated unless the migration is missing:
SELECT policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('products', 'categories', 'services', 'product_images',
                    'solar_attributes', 'site_settings')
  AND cmd <> 'SELECT';

-- Should contain only the admin user:
SELECT * FROM public.admin_users;
```

## Rollback

Keep a copy of the old policies before applying. To temporarily restore the old
behavior, re-run the policy section of the pre-Phase-1 `supabase-schema.sql`
from your Git history, or restore the most recent valid database backup.
Rollback is not recommended for production; fix forward instead.

## Troubleshooting

- **`Could not verify admin access: function public.is_admin() does not exist`** —
  the migration has not been applied to the project the frontend is pointing at.
- **Admin login succeeds but writes fail** — the user is not in `public.admin_users`,
  or the project's PostgREST schema cache needs a reload (Dashboard >
  Settings > API > Reload schema, or `NOTIFY pgrst, 'reload schema';`).
- **Image upload fails** — check file type (JPEG/PNG/WebP/AVIF), size (max 5 MB),
  and that the storage policies from the migration were applied.
- **Node engine warnings** — use Node.js 22+ for the frontend.
