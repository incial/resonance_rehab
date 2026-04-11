create table if not exists public.team_members (
  id bigserial primary key,
  -- member_id keeps compatibility with existing frontend ordering/ids from static data
  member_id integer not null unique,
  name text not null,
  slug text not null unique,
  title text not null,
  category text not null,
  description text not null,
  image_url text not null,
  credentials text not null,
  age text not null,
  languages text not null,
  about text not null,
  areas_of_focus text[] not null default '{}',
  approach text[] not null default '{}',
  location text,
  registration text,
  certifications text[],
  experience text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_team_members_updated_at on public.team_members;
create trigger trg_team_members_updated_at
before update on public.team_members
for each row
execute function public.set_updated_at();

alter table public.team_members enable row level security;

drop policy if exists "team members read access" on public.team_members;
create policy "team members read access"
on public.team_members
for select
to anon, authenticated
using (true);
