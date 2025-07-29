-- Fix foreign key constraint issues after migration from users -> members -> users

-- IMPORTANT: Run the diagnose_foreign_key_issues.sql first to understand what data will be affected

-- Option 1: Delete orphaned records (DESTRUCTIVE - will lose attendance history for deleted users)
-- Uncomment the following lines to delete orphaned records:

/*
-- Delete orphaned attendance records
DELETE FROM attendance 
WHERE rfid_uid NOT IN (SELECT rfid_uid FROM users);

-- Delete orphaned broadcast messages
DELETE FROM broadcast_messages 
WHERE sender_id IS NOT NULL 
AND sender_id NOT IN (SELECT id FROM users);

-- Delete orphaned notification preferences
DELETE FROM notification_preferences 
WHERE user_id NOT IN (SELECT id FROM users);

-- Delete orphaned notifications log
DELETE FROM notifications_log 
WHERE user_id NOT IN (SELECT id FROM users);

-- Delete orphaned push subscriptions
DELETE FROM push_subscriptions 
WHERE user_id NOT IN (SELECT id FROM users);
*/

-- Option 2: Create placeholder users for orphaned records (PRESERVES DATA)
-- This is the recommended approach to preserve historical data

-- First, create placeholder users for orphaned rfid_uid references in attendance
INSERT INTO users (rfid_uid, name, role, created_at)
SELECT DISTINCT 
    a.rfid_uid,
    'Unknown User (' || a.rfid_uid || ')',
    'member',
    MIN(a.created_at)
FROM attendance a
LEFT JOIN users u ON a.rfid_uid = u.rfid_uid
WHERE u.rfid_uid IS NULL
GROUP BY a.rfid_uid;

-- Create placeholder users for orphaned user_id references
-- Note: This requires knowing the original user details, which might not be available
-- You may need to manually review and update these records

-- Option 3: Temporarily disable foreign key constraints, fix data, then re-enable
-- This approach requires careful manual intervention

-- Option 4: Add CASCADE options to foreign keys (for future prevention)
-- This would automatically delete related records when a user is deleted

-- Example of adding CASCADE delete (run these one at a time):
/*
ALTER TABLE attendance
DROP CONSTRAINT attendance_rfid_uid_fkey,
ADD CONSTRAINT attendance_rfid_uid_fkey 
    FOREIGN KEY (rfid_uid) 
    REFERENCES users(rfid_uid) 
    ON DELETE CASCADE;

ALTER TABLE broadcast_messages
DROP CONSTRAINT broadcast_messages_sender_id_fkey,
ADD CONSTRAINT broadcast_messages_sender_id_fkey 
    FOREIGN KEY (sender_id) 
    REFERENCES users(id) 
    ON DELETE SET NULL;

ALTER TABLE notification_preferences
DROP CONSTRAINT notification_preferences_user_id_fkey,
ADD CONSTRAINT notification_preferences_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES users(id) 
    ON DELETE CASCADE;

ALTER TABLE notifications_log
DROP CONSTRAINT notifications_log_user_id_fkey,
ADD CONSTRAINT notifications_log_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES users(id) 
    ON DELETE CASCADE;

ALTER TABLE push_subscriptions
DROP CONSTRAINT push_subscriptions_user_id_fkey,
ADD CONSTRAINT push_subscriptions_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES users(id) 
    ON DELETE CASCADE;
*/

-- After running the fix, verify no orphaned records remain by running diagnose_foreign_key_issues.sql again