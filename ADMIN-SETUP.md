# Ovejite CMS setup (Supabase + Vercel)

The public website remains on Vercel. The CMS backend is now Supabase.

## 1. Create the Supabase project

Create a project at https://supabase.com/.

Then open **SQL Editor → New query**, paste the complete contents of `supabase-setup.sql`, and click **Run**.

## 2. Create your first admin account

After the SQL finishes, deploy the website once with the Supabase environment variables below.

Open:

`https://YOUR-DOMAIN/login`

If you want to use the built-in registration page, open `/register` and create your account.

Then in Supabase go to **SQL Editor** and run this, replacing the email:

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
where email = 'YOUR-ADMIN-EMAIL@example.com';
```

Log out and log in again after promoting the account. The CMS permissions are restricted to users whose JWT has `app_metadata.role = admin`.

## 3. Vercel environment variables

In **Vercel → Project → Settings → Environment Variables**, add these for Production (and Preview if you want):

- `VITE_SUPABASE_URL` = your Supabase project URL, for example `https://xxxxxxxx.supabase.co`
- `VITE_SUPABASE_ANON_KEY` = the Supabase **Publishable/anon** key from Project Settings → API

Do **not** put a Supabase `service_role`/secret key in Vercel as a `VITE_` variable. Never put that key in frontend code.

Redeploy after adding the variables.

## 4. What the CMS now controls

- Services
- Industries
- Case Studies
- Resources
- Leads/contact submissions
- Website Settings
- CMS image uploads

Public visitors can submit leads without logging in. Only an admin user can create/update/delete CMS records or upload images.

## 5. Image uploads

The SQL script creates a public `site-images` storage bucket and the required policies. Admin image uploads from the existing CMS UI will return public image URLs.

## 6. Google login

Email/password login is supported immediately. Google login requires configuring Google OAuth in Supabase Authentication → Providers and adding your production callback URL in the Supabase dashboard. You can leave the Google button unused until that is configured.

## 7. Password reset

Supabase must have your production URL configured under Authentication → URL Configuration. Set the Site URL to your Vercel/custom domain and allow:

`https://YOUR-DOMAIN/reset-password`

The reset page in this project uses the Supabase recovery session returned in the URL hash.
