-- Drop all notification-related tables and objects
-- WARNING: This will delete all data in these tables!

-- Drop policies first
DROP POLICY IF EXISTS "Users can manage own notification preferences" ON notification_preferences;
DROP POLICY IF EXISTS "Users can manage own push subscriptions" ON push_subscriptions;
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications_log;
DROP POLICY IF EXISTS "All users can view broadcasts" ON broadcast_messages;
DROP POLICY IF EXISTS "Only admins can send broadcasts" ON broadcast_messages;
DROP POLICY IF EXISTS "Admins and leads can view all broadcasts" ON broadcast_messages;
DROP POLICY IF EXISTS "Admins can send broadcasts" ON broadcast_messages;

-- Drop functions
DROP FUNCTION IF EXISTS send_notification(notification_type, text, text, jsonb, text, uuid);
DROP FUNCTION IF EXISTS send_broadcast_notification(text, text, text, text);
DROP FUNCTION IF EXISTS send_broadcast_notification(uuid, text, text, text, text[]);
DROP FUNCTION IF EXISTS trigger_checkin_notification();
DROP FUNCTION IF EXISTS trigger_checkout_notification();
DROP FUNCTION IF EXISTS send_hourly_summary();

-- Drop triggers
DROP TRIGGER IF EXISTS send_checkin_notification ON lab_analytics;
DROP TRIGGER IF EXISTS send_checkout_notification ON lab_analytics;

-- Drop tables
DROP TABLE IF EXISTS broadcast_messages CASCADE;
DROP TABLE IF EXISTS notifications_log CASCADE;
DROP TABLE IF EXISTS push_subscriptions CASCADE;
DROP TABLE IF EXISTS notification_preferences CASCADE;

-- Drop types
DROP TYPE IF EXISTS notification_type CASCADE;

-- Now you can run the notifications_setup_fixed.sql file