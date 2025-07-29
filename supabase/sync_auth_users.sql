-- Check if the user exists in auth.users
SELECT id, email, created_at 
FROM auth.users 
WHERE id = '7ad4019b-bdd8-4f28-9f7d-a70ad201adf2';

-- Check if there's a public.users table
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'users';

-- If you have a public.users table, sync the auth user to it
-- INSERT INTO public.users (id, email, created_at)
-- SELECT id, email, created_at
-- FROM auth.users
-- WHERE id = '7ad4019b-bdd8-4f28-9f7d-a70ad201adf2'
-- ON CONFLICT (id) DO NOTHING;

-- Alternative: Create a view that joins auth.users if needed
CREATE OR REPLACE VIEW user_profiles AS
SELECT 
  au.id as user_id,
  au.email,
  au.created_at,
  u.*
FROM auth.users au
LEFT JOIN public.users u ON au.id = u.id;