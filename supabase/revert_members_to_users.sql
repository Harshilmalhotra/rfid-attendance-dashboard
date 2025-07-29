-- Migration script to revert members table back to users and update all dependencies
-- Run this script in your Supabase SQL editor

-- Step 1: Drop existing views that depend on the members table (if any)
-- We'll recreate them later with the new table name

-- Step 2: Rename the members table back to users
ALTER TABLE public.members RENAME TO users;

-- Step 3: Update all foreign key constraints
-- First, drop the existing constraints

-- attendance table
ALTER TABLE public.attendance DROP CONSTRAINT IF EXISTS attendance_rfid_uid_fkey;

-- broadcast_messages table
ALTER TABLE public.broadcast_messages DROP CONSTRAINT IF EXISTS broadcast_messages_sender_id_fkey;

-- lab_analytics table
ALTER TABLE public.lab_analytics DROP CONSTRAINT IF EXISTS lab_analytics_person_id_fkey;

-- notification_preferences table
ALTER TABLE public.notification_preferences DROP CONSTRAINT IF EXISTS notification_preferences_user_id_fkey;

-- notifications_log table
ALTER TABLE public.notifications_log DROP CONSTRAINT IF EXISTS notifications_log_user_id_fkey;

-- push_subscriptions table
ALTER TABLE public.push_subscriptions DROP CONSTRAINT IF EXISTS push_subscriptions_user_id_fkey;

-- Step 4: Recreate foreign key constraints with the original table name
-- attendance table
ALTER TABLE public.attendance 
ADD CONSTRAINT attendance_rfid_uid_fkey 
FOREIGN KEY (rfid_uid) REFERENCES public.users(rfid_uid);

-- broadcast_messages table
ALTER TABLE public.broadcast_messages 
ADD CONSTRAINT broadcast_messages_sender_id_fkey 
FOREIGN KEY (sender_id) REFERENCES public.users(id);

-- lab_analytics table
ALTER TABLE public.lab_analytics 
ADD CONSTRAINT lab_analytics_person_id_fkey 
FOREIGN KEY (person_id) REFERENCES public.users(rfid_uid);

-- notification_preferences table
ALTER TABLE public.notification_preferences 
ADD CONSTRAINT notification_preferences_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.users(id);

-- notifications_log table
ALTER TABLE public.notifications_log 
ADD CONSTRAINT notifications_log_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.users(id);

-- push_subscriptions table
ALTER TABLE public.push_subscriptions 
ADD CONSTRAINT push_subscriptions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.users(id);

-- Step 5: Update any RLS policies if they exist
-- These policies might need to be recreated with the correct table reference

-- Step 6: Verify the migration
-- Check that all tables and constraints are properly updated
SELECT 
    tc.table_name, 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND ccu.table_name = 'users'
ORDER BY tc.table_name;