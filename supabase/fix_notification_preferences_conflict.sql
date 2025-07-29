-- Fix notification_preferences 409 conflict issue

-- First, drop any existing unnamed unique constraint
ALTER TABLE notification_preferences 
DROP CONSTRAINT IF EXISTS notification_preferences_user_id_notification_type_key;

-- Create a named unique constraint
ALTER TABLE notification_preferences 
ADD CONSTRAINT notification_preferences_unique_user_type 
UNIQUE (user_id, notification_type);

-- Create or replace function to handle upserts
CREATE OR REPLACE FUNCTION upsert_notification_preference(
    p_user_id uuid,
    p_notification_type notification_type,
    p_enabled boolean DEFAULT true,
    p_push_enabled boolean DEFAULT true,
    p_email_enabled boolean DEFAULT false
)
RETURNS notification_preferences AS $$
DECLARE
    v_preference notification_preferences;
BEGIN
    -- Try to update first
    UPDATE notification_preferences
    SET 
        enabled = p_enabled,
        push_enabled = p_push_enabled,
        email_enabled = p_email_enabled,
        updated_at = now()
    WHERE user_id = p_user_id 
    AND notification_type = p_notification_type
    RETURNING * INTO v_preference;
    
    -- If no rows updated, insert
    IF NOT FOUND THEN
        INSERT INTO notification_preferences (
            user_id,
            notification_type,
            enabled,
            push_enabled,
            email_enabled
        ) VALUES (
            p_user_id,
            p_notification_type,
            p_enabled,
            p_push_enabled,
            p_email_enabled
        )
        RETURNING * INTO v_preference;
    END IF;
    
    RETURN v_preference;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION upsert_notification_preference TO authenticated;