-- Admin System Setup for RFID Attendance
-- Run this in Supabase SQL Editor to set up the admin system

-- Step 1: Create admin table
CREATE TABLE IF NOT EXISTS admin (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    email text UNIQUE NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    created_by text
);

-- Step 2: Insert initial admin(s)
-- Replace 'admin@example.com' with your actual admin email
INSERT INTO admin (email, created_by) 
VALUES 
    ('admin@example.com', 'system')
ON CONFLICT (email) DO NOTHING;

-- Step 3: Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_email text)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admin 
        WHERE LOWER(email) = LOWER(user_email)
    );
END;
$$ LANGUAGE plpgsql;

-- Step 4: Grant permissions
GRANT SELECT ON admin TO authenticated;

-- Step 5: Enable RLS
ALTER TABLE admin ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS policies
-- Only admins can view the admin table
CREATE POLICY "Only admins can view admin table"
ON admin FOR SELECT
TO authenticated
USING (
    is_admin(auth.email())
);

-- Only admins can insert new admins
CREATE POLICY "Only admins can add new admins"
ON admin FOR INSERT
TO authenticated
WITH CHECK (
    is_admin(auth.email())
);

-- Only admins can delete admins
CREATE POLICY "Only admins can remove admins"
ON admin FOR DELETE
TO authenticated
USING (
    is_admin(auth.email())
);

-- Step 7: Create index for performance
CREATE INDEX IF NOT EXISTS idx_admin_email ON admin(LOWER(email));

-- Step 8: Update broadcast functions to use admin table
DROP FUNCTION IF EXISTS send_broadcast_notification(uuid, text, text, text, text[]);

CREATE OR REPLACE FUNCTION send_broadcast_notification(
    p_sender_email text,
    p_title text,
    p_body text,
    p_priority text DEFAULT 'normal'
)
RETURNS integer AS $$
DECLARE
    v_user record;
    v_sent_count integer := 0;
    v_broadcast_id uuid;
BEGIN
    -- Check if sender is admin
    IF NOT is_admin(p_sender_email) THEN
        RAISE EXCEPTION 'Only admins can send broadcasts';
    END IF;
    
    -- Insert broadcast record
    INSERT INTO broadcast_messages (
        sender_id, 
        title, 
        body, 
        priority,
        created_by_name
    ) VALUES (
        (SELECT id FROM users WHERE email = p_sender_email),
        p_title,
        p_body,
        p_priority,
        p_sender_email
    ) RETURNING id INTO v_broadcast_id;
    
    -- Send to all users with push subscriptions
    FOR v_user IN 
        SELECT DISTINCT u.id, u.email
        FROM users u
        JOIN push_subscriptions ps ON u.id = ps.user_id
    LOOP
        -- Insert notification log
        INSERT INTO notifications_log (
            user_id, 
            notification_type, 
            title, 
            body, 
            data
        ) VALUES (
            v_user.id,
            'broadcast'::notification_type,
            p_title,
            p_body,
            jsonb_build_object(
                'broadcast_id', v_broadcast_id,
                'sender_email', p_sender_email,
                'priority', p_priority,
                'sent_at', NOW()
            )
        );
        
        v_sent_count := v_sent_count + 1;
    END LOOP;
    
    -- Update sent count
    UPDATE broadcast_messages 
    SET sent_to_count = v_sent_count 
    WHERE id = v_broadcast_id;
    
    RETURN v_sent_count;
END;
$$ LANGUAGE plpgsql;

-- Step 9: Update broadcast messages table RLS
DROP POLICY IF EXISTS "Admins and leads can view all broadcasts" ON broadcast_messages;
DROP POLICY IF EXISTS "Admins can send broadcasts" ON broadcast_messages;

-- All authenticated users can view broadcasts
CREATE POLICY "All users can view broadcasts"
ON broadcast_messages FOR SELECT
TO authenticated
USING (true);

-- Only admins can send broadcasts
CREATE POLICY "Only admins can send broadcasts"
ON broadcast_messages FOR INSERT
TO authenticated
WITH CHECK (
    is_admin(auth.email())
);