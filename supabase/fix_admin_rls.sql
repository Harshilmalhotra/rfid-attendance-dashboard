-- Fix RLS for admin table to allow authenticated users to check if they are admin
-- This allows the frontend to check admin status without errors

-- Enable RLS on admin table
ALTER TABLE admin ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Only admins can view admin table" ON admin;
DROP POLICY IF EXISTS "Only admins can add new admins" ON admin;
DROP POLICY IF EXISTS "Only admins can remove admins" ON admin;

-- Create new policies

-- Allow authenticated users to check if THEY are an admin (by their own email)
CREATE POLICY "Users can check own admin status"
ON admin FOR SELECT
TO authenticated
USING (LOWER(email) = LOWER(auth.email()));

-- Only existing admins can view all admins
CREATE POLICY "Admins can view all admins"
ON admin FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM admin 
        WHERE LOWER(email) = LOWER(auth.email())
    )
);

-- Only admins can add new admins
CREATE POLICY "Only admins can add new admins"
ON admin FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM admin 
        WHERE LOWER(email) = LOWER(auth.email())
    )
);

-- Only admins can remove admins
CREATE POLICY "Only admins can remove admins"
ON admin FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM admin 
        WHERE LOWER(email) = LOWER(auth.email())
    )
);

-- Grant select permission to authenticated users
GRANT SELECT ON admin TO authenticated;
GRANT INSERT, DELETE ON admin TO authenticated;

-- Note: The first policy allows any authenticated user to check if their own email
-- is in the admin table, which is what the frontend needs to determine if they
-- should show admin features.