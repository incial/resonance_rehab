# Supabase Setup (Free Tier)

This project supports team-photo management using Supabase free tier.

## 1) Create Supabase project
- Sign in to Supabase and create a new project (free plan).
- Copy:
  - Project URL
  - `anon` key
  - `service_role` key

## 2) Create table
- Open SQL editor.
- Run `/supabase/team_members.sql`.

## 3) Create storage bucket
- Go to **Storage** → **Create bucket**.
- Bucket name: `team-photos` (or set your own and update `SUPABASE_BUCKET`).
- Make it **Public**.

## 4) Configure environment variables
Create `.env.local` from `.env.example`:

```bash
cp .env.example .env.local
```

Set values:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_BUCKET` (optional, defaults to `team-photos`)
- `ADMIN_EMAILS` (comma-separated admin emails allowed to upload photos)

## 5) Create admin auth user
- Supabase Dashboard → **Authentication** → **Users** → **Add user**.
- Use one of the emails in `ADMIN_EMAILS`.

## 6) Use admin panel
- Start app: `npm run dev`
- Open `/admin`
- Sign in with Supabase email/password
- Upload photos

## Notes
- Team listing API falls back to local bundled data when Supabase is not configured.
- Photo upload API requires valid Supabase login and allowed admin email.
- Free tier has usage limits but no upfront cost.
