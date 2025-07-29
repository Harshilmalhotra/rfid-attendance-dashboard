-- Notification System Schema for RFID Attendance
-- Run this in Supabase SQL Editor to set up the notification system

-- Step 1: Create notification types enum
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
        SELECT DISTINCT u.id, u.email, u.role
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

-- Step 6: Create trigger for check-in notifications
CREATE OR REPLACE FUNCTION trigger_checkin_notification()
RETURNS trigger AS $$
DECLARE
    v_user_name text;
    v_user_email text;
    v_is_admin boolean;
BEGIN
    -- Get user details
    SELECT name, email INTO v_user_name, v_user_email
    FROM users
    WHERE rfid_uid = NEW.person_id;
    
    -- Check if user is admin
    SELECT EXISTS (
        SELECT 1 FROM admin 
        WHERE LOWER(email) = LOWER(v_user_email)
    ) INTO v_is_admin;
    
    -- Send check-in notification
    PERFORM send_notification(
        'check_in'::notification_type,
        'New Check-in',
        v_user_name || ' has entered the lab',
        jsonb_build_object(
            'user_name', v_user_name,
            'user_email', v_user_email,
            'is_admin', v_is_admin,
            'check_in_time', NEW.check_in_time
        ),
        CASE WHEN v_is_admin THEN 'admin' ELSE 'member' END,
        (SELECT id FROM users WHERE rfid_uid = NEW.person_id)
    );
    
    -- Check if VIP entry (admin)
    IF v_is_admin THEN
        PERFORM send_notification(
            'vip_entry'::notification_type,
            'Admin Entry',
            'Admin ' || v_user_name || ' has entered the lab',
            jsonb_build_object(
                'user_name', v_user_name,
                'user_email', v_user_email,
                'check_in_time', NEW.check_in_time
            )
        );
    END IF;
    
    -- Check if first entry of the day
    IF NOT EXISTS (
        SELECT 1 FROM lab_analytics
        WHERE DATE(check_in_time) = DATE(NEW.check_in_time)
        AND check_in_time < NEW.check_in_time
    ) THEN
        PERFORM send_notification(
            'first_entry'::notification_type,
            'Lab Opened',
            'The lab is now open! ' || v_user_name || ' was first today',
            jsonb_build_object(
                'user_name', v_user_name,
                'check_in_time', NEW.check_in_time
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Create trigger for check-out notifications
CREATE OR REPLACE FUNCTION trigger_checkout_notification()
RETURNS trigger AS $$
DECLARE
    v_user_name text;
    v_user_email text;
    v_is_admin boolean;
    v_duration interval;
    v_remaining_count integer;
BEGIN
    -- Only trigger on checkout (when check_out_time is set)
    IF NEW.check_out_time IS NOT NULL AND OLD.check_out_time IS NULL THEN
        -- Get user details
        SELECT name, email INTO v_user_name, v_user_email
        FROM users
        WHERE rfid_uid = NEW.person_id;
        
        -- Check if user is admin
        SELECT EXISTS (
            SELECT 1 FROM admin 
            WHERE LOWER(email) = LOWER(v_user_email)
        ) INTO v_is_admin;
        
        -- Calculate duration
        v_duration := NEW.check_out_time - NEW.check_in_time;
        
        -- Send check-out notification
        PERFORM send_notification(
            'check_out'::notification_type,
            'Check-out',
            v_user_name || ' has left after ' || 
            EXTRACT(HOUR FROM v_duration) || 'h ' ||
            EXTRACT(MINUTE FROM v_duration) || 'm',
            jsonb_build_object(
                'user_name', v_user_name,
                'user_email', v_user_email,
                'is_admin', v_is_admin,
                'check_out_time', NEW.check_out_time,
                'duration', v_duration
            ),
            CASE WHEN v_is_admin THEN 'admin' ELSE 'member' END,
            (SELECT id FROM users WHERE rfid_uid = NEW.person_id)
        );
        
        -- Check if last person leaving
        SELECT COUNT(*) INTO v_remaining_count
        FROM lab_analytics
        WHERE DATE(check_in_time) = DATE(NEW.check_in_time)
        AND check_out_time IS NULL
        AND id != NEW.id;
        
        IF v_remaining_count = 0 THEN
            PERFORM send_notification(
                'last_exit'::notification_type,
                'Lab Closed',
                'The lab is now empty. ' || v_user_name || ' was the last to leave',
                jsonb_build_object(
                    'user_name', v_user_name,
                    'check_out_time', NEW.check_out_time
                )
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 8: Create the triggers
DROP TRIGGER IF EXISTS send_checkin_notification ON lab_analytics;
CREATE TRIGGER send_checkin_notification
AFTER INSERT ON lab_analytics
FOR EACH ROW
EXECUTE FUNCTION trigger_checkin_notification();

DROP TRIGGER IF EXISTS send_checkout_notification ON lab_analytics;
CREATE TRIGGER send_checkout_notification
AFTER UPDATE ON lab_analytics
FOR EACH ROW
EXECUTE FUNCTION trigger_checkout_notification();

-- Step 9: Create scheduled job functions (call these via cron jobs)
CREATE OR REPLACE FUNCTION send_hourly_summary()
RETURNS void AS $$
DECLARE
    v_current_count integer;
    v_prev_count integer;
    v_change integer;
    v_change_text text;
BEGIN
    -- Get current occupancy
    SELECT COUNT(*) INTO v_current_count
    FROM lab_analytics
    WHERE DATE(check_in_time) = CURRENT_DATE
    AND check_out_time IS NULL;
    
    -- Get previous hour count (simplified - you'd want more logic here)
    v_prev_count := v_current_count - 2; -- Placeholder
    v_change := v_current_count - v_prev_count;
    
    IF v_change > 0 THEN
        v_change_text := '↑' || v_change || ' from last hour';
    ELSIF v_change < 0 THEN
        v_change_text := '↓' || ABS(v_change) || ' from last hour';
    ELSE
        v_change_text := 'No change from last hour';
    END IF;
    
    -- Send hourly summary
    PERFORM send_notification(
        'hourly_summary'::notification_type,
        'Hourly Update',
        'Currently ' || v_current_count || ' people in lab (' || v_change_text || ')',
        jsonb_build_object(
            'current_count', v_current_count,
            'change', v_change,
            'timestamp', NOW()
        )
    );
END;
$$ LANGUAGE plpgsql;

-- Step 10: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_type 
ON notification_preferences(user_id, notification_type);

CREATE INDEX IF NOT EXISTS idx_notifications_log_user_read 
ON notifications_log(user_id, read, sent_at DESC);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user 
ON push_subscriptions(user_id);

-- Step 11: Grant permissions
GRANT ALL ON notification_preferences TO authenticated;
GRANT ALL ON push_subscriptions TO authenticated;
GRANT SELECT ON notifications_log TO authenticated;
GRANT INSERT ON notifications_log TO service_role;

-- Step 12: Create RLS policies
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications_log ENABLE ROW LEVEL SECURITY;

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

-- Step 13: Create broadcast messages table
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

-- Step 14: Create function to send broadcast notification
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

-- Step 15: Grant permissions for broadcast
GRANT SELECT ON broadcast_messages TO authenticated;
GRANT INSERT ON broadcast_messages TO authenticated;

-- Step 16: RLS for broadcast messages
ALTER TABLE broadcast_messages ENABLE ROW LEVEL SECURITY;

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
    EXISTS (
        SELECT 1 FROM admin 
        WHERE LOWER(email) = LOWER(auth.email())
    )
);