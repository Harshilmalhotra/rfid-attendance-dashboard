-- Check RLS status and policies for all tables

-- 1. Check if RLS is enabled on tables
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. List all RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 3. Specifically check users table policies
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'users';

-- 4. Check current user and permissions
SELECT current_user, session_user;

-- 5. Test query as would be executed by the API
-- This simulates what the anon key would see
SET ROLE anon;
SELECT COUNT(*) as visible_users FROM users;
RESET ROLE;

-- 6. Check if service role can see all users
-- This simulates what the service key would see
SET ROLE service_role;
SELECT COUNT(*) as visible_users FROM users;
RESET ROLE;