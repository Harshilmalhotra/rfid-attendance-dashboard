-- Fix RLS policies for users table

-- Option 1: Temporarily disable RLS (for testing)
-- WARNING: This makes the table publicly accessible!
-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Option 2: Create proper RLS policies for users table
-- First, enable RLS if not already enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies on users table to start fresh
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON users;
DROP POLICY IF EXISTS "Enable update for users based on id" ON users;
DROP POLICY IF EXISTS "Enable delete for users based on id" ON users;
DROP POLICY IF EXISTS "Users are viewable by everyone" ON users;
DROP POLICY IF EXISTS "Users can be created by authenticated users" ON users;
DROP POLICY IF EXISTS "Users can be updated by authenticated users" ON users;
DROP POLICY IF EXISTS "Users can be deleted by authenticated users" ON users;

-- Create new policies

-- 1. Allow all authenticated users to read all users
-- This is needed for the users list page
CREATE POLICY "Enable read access for authenticated users" ON users
FOR SELECT
TO authenticated
USING (true);

-- 2. Allow service role to do everything (for API routes)
CREATE POLICY "Service role has full access" ON users
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 3. Optional: Allow anon users to read (if you have public pages)
-- CREATE POLICY "Enable read access for anon users" ON users
-- FOR SELECT
-- TO anon
-- USING (true);

-- 4. Allow authenticated users to insert new users
CREATE POLICY "Authenticated users can insert" ON users
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 5. Allow authenticated users to update users
CREATE POLICY "Authenticated users can update" ON users
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 6. Allow authenticated users to delete users
CREATE POLICY "Authenticated users can delete" ON users
FOR DELETE
TO authenticated
USING (true);

-- Verify the policies were created
SELECT 
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'users'
ORDER BY policyname;