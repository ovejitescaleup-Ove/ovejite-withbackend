-- ============================================================
-- OVEJITE CMS / SUPABASE SETUP
-- ============================================================

create extension if not exists pgcrypto;


-- ============================================================
-- CMS RECORDS TABLE
-- ============================================================

create table if not exists public.cms_records (
  id uuid primary key default gen_random_uuid(),
  entity text not null,
  data jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


create index if not exists cms_records_entity_idx
on public.cms_records(entity);


create index if not exists cms_records_created_at_idx
on public.cms_records(created_at desc);


-- ============================================================
-- UPDATED AT TRIGGER
-- ============================================================

create or replace function public.cms_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


drop trigger if exists cms_records_updated_at
on public.cms_records;


create trigger cms_records_updated_at
before update on public.cms_records
for each row
execute function public.cms_set_updated_at();


-- ============================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================

alter table public.cms_records enable row level security;


-- ============================================================
-- PUBLIC CMS READ POLICY
-- ============================================================

drop policy if exists "Public can read published CMS content"
on public.cms_records;


create policy "Public can read published CMS content"
on public.cms_records
for select
to anon, authenticated
using (
  entity in (
    'Service',
    'Industry',
    'CaseStudy',
    'Resource',
    'SiteSetting'
  )
  and (
    entity = 'SiteSetting'
    or coalesce((data->>'published')::boolean, false) = true
    or entity in ('Service', 'Industry')
  )
);


-- ============================================================
-- ADMIN READ POLICY
-- ============================================================

drop policy if exists "Admins can read all CMS records"
on public.cms_records;


create policy "Admins can read all CMS records"
on public.cms_records
for select
to authenticated
using (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);


-- ============================================================
-- PUBLIC LEAD CREATION
-- ============================================================

drop policy if exists "Public can create leads"
on public.cms_records;


create policy "Public can create leads"
on public.cms_records
for insert
to anon, authenticated
with check (
  entity = 'Lead'
);


-- ============================================================
-- ADMIN CREATE CMS RECORDS
-- ============================================================

drop policy if exists "Admins can create CMS records"
on public.cms_records;


create policy "Admins can create CMS records"
on public.cms_records
for insert
to authenticated
with check (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);


-- ============================================================
-- ADMIN UPDATE CMS RECORDS
-- ============================================================

drop policy if exists "Admins can update CMS records"
on public.cms_records;


create policy "Admins can update CMS records"
on public.cms_records
for update
to authenticated
using (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
)
with check (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);


-- ============================================================
-- ADMIN DELETE CMS RECORDS
-- ============================================================

drop policy if exists "Admins can delete CMS records"
on public.cms_records;


create policy "Admins can delete CMS records"
on public.cms_records
for delete
to authenticated
using (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);


-- ============================================================
-- STORAGE BUCKET
-- ============================================================

insert into storage.buckets (
  id,
  name,
  public
)
values (
  'site-images',
  'site-images',
  true
)
on conflict (id)
do update set public = true;


-- ============================================================
-- PUBLIC IMAGE VIEW
-- ============================================================

drop policy if exists "Public can view site images"
on storage.objects;


create policy "Public can view site images"
on storage.objects
for select
to public
using (
  bucket_id = 'site-images'
);


-- ============================================================
-- ADMIN IMAGE UPLOAD
-- ============================================================

drop policy if exists "Authenticated users can upload site images"
on storage.objects;


drop policy if exists "Admins can upload site images"
on storage.objects;


create policy "Admins can upload site images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'site-images'
  and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);


-- ============================================================
-- ADMIN IMAGE UPDATE
-- ============================================================

drop policy if exists "Authenticated users can update site images"
on storage.objects;


drop policy if exists "Admins can update site images"
on storage.objects;


create policy "Admins can update site images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'site-images'
  and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
)
with check (
  bucket_id = 'site-images'
  and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);


-- ============================================================
-- ADMIN IMAGE DELETE
-- ============================================================

drop policy if exists "Authenticated users can delete site images"
on storage.objects;


drop policy if exists "Admins can delete site images"
on storage.objects;


create policy "Admins can delete site images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'site-images'
  and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);


-- ============================================================
-- ASSIGN ADMIN ROLE TO YOUR EXISTING ACCOUNT
-- ============================================================

update auth.users
set raw_app_meta_data =
  coalesce(raw_app_meta_data, '{}'::jsonb)
  || '{"role":"admin"}'::jsonb
where email = 'ovejite.scaleup@gmail.com';


-- ============================================================
-- VERIFY ADMIN ROLE
-- ============================================================

select
  id,
  email,
  raw_app_meta_data
from auth.users
where email = 'ovejite.scaleup@gmail.com';


-- ============================================================
-- OPTIONAL: SEED SITE SETTINGS
-- ============================================================

insert into public.cms_records (
  entity,
  data
)
select
  'SiteSetting',
  jsonb_build_object(
    'name','Ovejite',
    'title','Performance Marketing Specialist',
    'short_bio','I help businesses grow through smarter advertising, accurate tracking, and continuous optimization.',
    'email','hello@ovejite.me',
    'whatsapp_message','Hi Ovejite, I would like to discuss my marketing strategy.',
    'monthly_ad_spend','$3.6M+',
    'projects_count','50+',
    'years_experience','8+',
    'seo_title','Ovejite — Smarter Digital Marketing',
    'meta_description','Performance marketing specialist in Google Ads, Meta Ads, conversion tracking, and growth strategy.'
  )
where not exists (
  select 1
  from public.cms_records
  where entity = 'SiteSetting'
);
