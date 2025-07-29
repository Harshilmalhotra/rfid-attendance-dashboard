-- Notification System Schema for RFID Attendance (Fixed Version)
-- This version handles existing objects gracefully

-- Step 1: Create notification types enum (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
        CREATE TYPE notification_type AS ENUM (
            'check_in',
            'check_out',
            'hourly_summary',
            'daily_summary',
            'weekly_summary',
            'capacity_alert',
            'extended_stay',
            'unusual_activity',
            'first_entry',
            'last_exit',
            'vip_entry',
            'broadcast'
        );
    END IF;
END$$;

-- Step 2: Create notification preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    notification_type notification_type NOT NULL,
    enabled boolean DEFAULT true,
    -- Delivery channels
    push_enabled boolean DEFAULT true,
    email_enabled boolean DEFAULT false,
    -- Filtering options
    filter_role text[], -- Only notify for specific roles (admin, lead, member)
    filter_users uuid[], -- Only notify for specific users
    filter_time_start time, -- Only notify during specific hours
    filter_time_end time,
    -- Additional settings
    threshold_value integer, -- For capacity alerts, extended stay hours, etc.
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id, notification_type)
);

-- Step 3: Create push subscriptions table for PWA
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    subscription_data jsonb NOT NULL, -- Store the entire PushSubscription object
    device_name text,
    browser_name text,
    created_at timestamp with time zone DEFAULT now(),
    last_used timestamp with time zone DEFAULT now(),
    UNIQUE(user_id, subscription_data)
);

-- Step 4: Create notifications log table
CREATE TABLE IF NOT EXISTS notifications_log (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    notification_type notification_type NOT NULL,
    title text NOT NULL,
    body text NOT NULL,
    data jsonb, -- Additional data like user info, stats, etc.
    read boolean DEFAULT false,
    sent_at timestamp with time zone DEFAULT now(),
    read_at timestamp with time zone,
    -- Delivery status
    push_sent boolean DEFAULT false,
    email_sent boolean DEFAULT false,
    push_error text,
    email_error text
);

-- Step 5: Create function to send notifications
CREATE OR REPLACE FUNCTION send_notification(
    p_notification_type notification_type,
    p_title text,
    p_body text,
    p_data jsonb DEFAULT '{}',
    p_target_role text DEFAULT NULL,
    p_trigger_user_id uuid DEFAULT NULL
)
RETURNS void AS $$
DECLARE
    v_user record;
    v_pref record;
    v_should_send boolean;
BEGIN
    -- Get all users with this notification type enabled
    FOR v_user IN 
        SELECT DISTINCT u.id, u.email
        FROM users u
        JOIN notification_preferences np ON u.id = np.user_id
        WHERE np.notification_type = p_notification_type
        AND np.enabled = true
    LOOP
        v_should_send := true;
        
        -- Get user's preferences
        SELECT * INTO v_pref
        FROM notification_preferences
        WHERE user_id = v_user.id
        AND notification_type = p_notification_type;
        
        -- Check role filter
        IF v_pref.filter_role IS NOT NULL AND array_length(v_pref.filter_role, 1) > 0 THEN
            IF p_target_role IS NULL OR NOT (p_target_role = ANY(v_pref.filter_role)) THEN
                v_should_send := false;
            END IF;
        END IF;
        
        -- Check user filter
        IF v_pref.filter_users IS NOT NULL AND array_length(v_pref.filter_users, 1) > 0 THEN
            IF p_trigger_user_id IS NULL OR NOT (p_trigger_user_id = ANY(v_pref.filter_users)) THEN
                v_should_send := false;
            END IF;
        END IF;
        
        -- Check time filter
        IF v_pref.filter_time_start IS NOT NULL AND v_pref.filter_time_end IS NOT NULL THEN
            IF CURRENT_TIME NOT BETWEEN v_pref.filter_time_start AND v_pref.filter_time_end THEN
                v_should_send := false;
            END IF;
        END IF;
        
        -- Send notification if all filters pass
        IF v_should_send THEN
            INSERT INTO notifications_log (
                user_id, 
                notification_type, 
                title, 
                body, 
                data
            ) VALUES (
                v_user.id,
                p_notification_type,
                p_title,
                p_body,
                p_data
            );
            
            -- Here you would trigger actual push notification
            -- This would be handled by your backend service
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Create broadcast messages table (if not exists)
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
    created_by_role text -- deprecated, use admin table instead
);

-- Step 7: Create or replace the send_broadcast_notification function
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
    -- Check if sender is admin (assuming is_admin function exists)
    IF NOT EXISTS (
        SELECT 1 FROM admin 
        WHERE LOWER(email) = LOWER(p_sender_email)
    ) THEN
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

-- Step 8: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_type 
ON notification_preferences(user_id, notification_type);

CREATE INDEX IF NOT EXISTS idx_notifications_log_user_read 
ON notifications_log(user_id, read, sent_at DESC);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user 
ON push_subscriptions(user_id);

-- Step 9: Grant permissions
GRANT ALL ON notification_preferences TO authenticated;
GRANT ALL ON push_subscriptions TO authenticated;
GRANT SELECT ON notifications_log TO authenticated;
GRANT INSERT ON notifications_log TO service_role;
GRANT ALL ON broadcast_messages TO authenticated;

-- Step 10: Enable RLS
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE broadcast_messages ENABLE ROW LEVEL SECURITY;

-- Step 11: Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can manage own notification preferences" ON notification_preferences;
DROP POLICY IF EXISTS "Users can manage own push subscriptions" ON push_subscriptions;
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications_log;
DROP POLICY IF EXISTS "All users can view broadcasts" ON broadcast_messages;
DROP POLICY IF EXISTS "Only admins can send broadcasts" ON broadcast_messages;

-- Step 12: Create RLS policies
-- Users can only manage their own preferences
CREATE POLICY "Users can manage own notification preferences"
ON notification_preferences FOR ALL
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own push subscriptions"
ON push_subscriptions FOR ALL
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can view own notifications"
ON notifications_log FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- All authenticated users can view broadcasts
CREATE POLICY "All users can view broadcasts"
ON broadcast_messages FOR SELECT
TO authenticated
USING (true);

-- Only admins can send broadcasts (requires is_admin function)
CREATE POLICY "Only admins can send broadcasts"
ON broadcast_messages FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM admin 
        WHERE LOWER(email) = LOWER(auth.email())
    )
);

-- Step 13: Create trigger functions for check-in and check-out notifications
-- (These are optional - only create if you want automatic notifications)

-- Done! The notification system is now set up.