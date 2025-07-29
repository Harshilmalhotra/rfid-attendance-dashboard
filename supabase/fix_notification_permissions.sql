-- Fix notification preferences permissions
-- This ensures users can create and update their own notification preferences

-- First, check if RLS is enabled
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Users can manage own notification preferences" ON notification_preferences;
DROP POLICY IF EXISTS "Users can manage own push subscriptions" ON push_subscriptions;
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications_log;

-- Create more permissive policies for notification_preferences
-- Users can view their own preferences
CREATE POLICY "Users can view own preferences"
ON notification_preferences FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own preferences
CREATE POLICY "Users can insert own preferences"
ON notification_preferences FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "Users can update own preferences"
ON notification_preferences FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own preferences
CREATE POLICY "Users can delete own preferences"
ON notification_preferences FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Similar policies for push_subscriptions
CREATE POLICY "Users can view own push subscriptions"
ON push_subscriptions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own push subscriptions"
ON push_subscriptions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own push subscriptions"
ON push_subscriptions FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own push subscriptions"
ON push_subscriptions FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Policy for notifications_log (read only for users)
CREATE POLICY "Users can view own notifications"
ON notifications_log FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT ALL ON notification_preferences TO authenticated;
GRANT ALL ON push_subscriptions TO authenticated;
GRANT SELECT ON notifications_log TO authenticated;

-- Grant usage on the notification_type enum
GRANT USAGE ON TYPE notification_type TO authenticated;

-- Make sure the sequence permissions are set
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;