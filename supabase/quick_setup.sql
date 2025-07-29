-- Quick Setup for Admin and Broadcast System
-- Run this in Supabase SQL Editor to set up the essential tables

-- 1. Create admin table if not exists
CREATE TABLE IF NOT EXISTS admin (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    email text UNIQUE NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    created_by text
);

-- 2. Add your admin email (replace with your actual email)
INSERT INTO admin (email, created_by) 
VALUES ('admin@example.com', 'system')
ON CONFLICT (email) DO NOTHING;

-- 3. Create broadcast_messages table
CREATE TABLE IF NOT EXISTS broadcast_messages (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    sender_id uuid REFERENCES users(id) ON DELETE SET NULL,
    title text NOT NULL,
    body text NOT NULL,
    priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    target_roles text[], -- NULL means all roles
    sent_at timestamp with time zone DEFAULT now(),
    sent_to_count integer DEFAULT 0,
    created_by_name text,
    created_by_role text
);

-- 4. Enable RLS
ALTER TABLE admin ENABLE ROW LEVEL SECURITY;
ALTER TABLE broadcast_messages ENABLE ROW LEVEL SECURITY;

-- 5. Create is_admin function
CREATE OR REPLACE FUNCTION is_admin(user_email text)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admin 
        WHERE LOWER(email) = LOWER(user_email)
    );
END;
$$ LANGUAGE plpgsql;

-- 6. Create RLS policies for admin table
CREATE POLICY "Only admins can view admin table"
ON admin FOR SELECT
TO authenticated
USING (is_admin(auth.email()));

CREATE POLICY "Only admins can add new admins"
ON admin FOR INSERT
TO authenticated
WITH CHECK (is_admin(auth.email()));

CREATE POLICY "Only admins can remove admins"
ON admin FOR DELETE
TO authenticated
USING (is_admin(auth.email()));

-- 7. Create RLS policies for broadcast_messages
CREATE POLICY "All users can view broadcasts"
ON broadcast_messages FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Only admins can send broadcasts"
ON broadcast_messages FOR INSERT
TO authenticated
WITH CHECK (is_admin(auth.email()));

-- 8. Grant permissions
GRANT SELECT ON admin TO authenticated;
GRANT ALL ON broadcast_messages TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin(text) TO authenticated;

-- 9. Create index for performance
CREATE INDEX IF NOT EXISTS idx_admin_email ON admin(LOWER(email));

-- Done! Don't forget to:
-- 1. Replace 'admin@example.com' with your actual email
-- 2. Run this SQL in Supabase SQL Editor