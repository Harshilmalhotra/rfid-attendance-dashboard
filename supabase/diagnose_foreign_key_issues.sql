-- Diagnose foreign key constraint issues after migration from users -> members -> users

-- 1. Check for orphaned rfid_uid references in attendance table
SELECT DISTINCT a.rfid_uid as orphaned_rfid_uid
FROM attendance a
LEFT JOIN users u ON a.rfid_uid = u.rfid_uid
WHERE u.rfid_uid IS NULL;

-- 2. Check for orphaned sender_id references in broadcast_messages
SELECT DISTINCT bm.sender_id as orphaned_sender_id
FROM broadcast_messages bm
LEFT JOIN users u ON bm.sender_id = u.id
WHERE u.id IS NULL;

-- 3. Check for orphaned user_id references in notification_preferences
SELECT DISTINCT np.user_id as orphaned_user_id
FROM notification_preferences np
LEFT JOIN users u ON np.user_id = u.id
WHERE u.id IS NULL;

-- 4. Check for orphaned user_id references in notifications_log
SELECT DISTINCT nl.user_id as orphaned_user_id
FROM notifications_log nl
LEFT JOIN users u ON nl.user_id = u.id
WHERE u.id IS NULL;

-- 5. Check for orphaned user_id references in push_subscriptions
SELECT DISTINCT ps.user_id as orphaned_user_id
FROM push_subscriptions ps
LEFT JOIN users u ON ps.user_id = u.id
WHERE u.id IS NULL;

-- 6. Count total users
SELECT COUNT(*) as total_users FROM users;

-- 7. Check for any duplicate rfid_uid values (should be unique)
SELECT rfid_uid, COUNT(*) as count
FROM users
GROUP BY rfid_uid
HAVING COUNT(*) > 1;

-- 8. Check for any duplicate id values (should be unique)
SELECT id, COUNT(*) as count
FROM users
GROUP BY id
HAVING COUNT(*) > 1;