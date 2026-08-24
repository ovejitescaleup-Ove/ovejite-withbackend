-- Run this AFTER you create your account at /register.
-- Replace the email with your own admin email.
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
where email = 'YOUR-ADMIN-EMAIL@example.com';
