-- Ovejite CMS / Supabase setup
-- Run this entire script in Supabase Dashboard > SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.cms_records (
  id uuid primary key default gen_random_uuid(),
  entity text not null,
  data jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists cms_records_entity_idx on public.cms_records(entity);
create index if not exists cms_records_created_at_idx on public.cms_records(created_at desc);

create or replace function public.cms_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists cms_records_updated_at on public.cms_records;
create trigger cms_records_updated_at
before update on public.cms_records
for each row execute function public.cms_set_updated_at();

alter table public.cms_records enable row level security;

drop policy if exists "Public can read published CMS content" on public.cms_records;
create policy "Public can read published CMS content"
on public.cms_records for select
to anon, authenticated
using (
  entity in ('Service','Industry','CaseStudy','Resource','SiteSetting')
  and (
    entity = 'SiteSetting'
    or coalesce((data->>'published')::boolean, false) = true
    or entity in ('Service','Industry')
  )
);

drop policy if exists "Admins can read all CMS records" on public.cms_records;
create policy "Admins can read all CMS records"
on public.cms_records for select
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Public can create leads" on public.cms_records;
create policy "Public can create leads"
on public.cms_records for insert
to anon, authenticated
with check (entity = 'Lead');

drop policy if exists "Admins can create CMS records" on public.cms_records;
create policy "Admins can create CMS records"
on public.cms_records for insert
to authenticated
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Admins can update CMS records" on public.cms_records;
create policy "Admins can update CMS records"
on public.cms_records for update
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Admins can delete CMS records" on public.cms_records;
create policy "Admins can delete CMS records"
on public.cms_records for delete
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Storage bucket for CMS images.
insert into storage.buckets (id, name, public)
values ('site-images', 'site-images', true)
on conflict (id) do update set public = true;

drop policy if exists "Public can view site images" on storage.objects;
create policy "Public can view site images"
on storage.objects for select
to public
using (bucket_id = 'site-images');

drop policy if exists "Authenticated users can upload site images" on storage.objects;
create policy "Authenticated users can upload site images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'site-images');

drop policy if exists "Authenticated users can update site images" on storage.objects;
create policy "Authenticated users can update site images"
on storage.objects for update
to authenticated
using (bucket_id = 'site-images')
with check (bucket_id = 'site-images');

drop policy if exists "Authenticated users can delete site images" on storage.objects;
create policy "Authenticated users can delete site images"
on storage.objects for delete
to authenticated
using (bucket_id = 'site-images');

-- Optional: seed one SiteSetting record. Edit these values later from /admin/settings.
insert into public.cms_records (entity, data)
select 'SiteSetting', jsonb_build_object(
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
where not exists (select 1 from public.cms_records where entity='SiteSetting');
