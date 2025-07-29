-- Weekly Occupancy Setup for RFID Attendance System
-- This script sets up automatic daily occupancy calculation
-- Run this in your Supabase SQL editor

-- Step 1: Add unique_visitors column to lab_occupancy table if it doesn't exist
ALTER TABLE public.lab_occupancy 
ADD COLUMN IF NOT EXISTS unique_visitors integer DEFAULT 0;

-- Step 2: Create function to calculate daily occupancy
CREATE OR REPLACE FUNCTION calculate_daily_occupancy(target_date date)
RETURNS void AS $$
DECLARE
    visitor_count integer;
    peak_hour_time time;
    total_entries integer;
BEGIN
    -- Count unique visitors for the day
    SELECT COUNT(DISTINCT person_id) INTO visitor_count
    FROM lab_analytics
    WHERE DATE(check_in_time) = target_date
    AND person_id IS NOT NULL;

    -- Count total entries for the day
    SELECT COUNT(*) INTO total_entries
    FROM lab_analytics
    WHERE DATE(check_in_time) = target_date;

    -- Find peak hour
    WITH hourly_counts AS (
        SELECT 
            EXTRACT(HOUR FROM check_in_time) as hour,
            COUNT(*) as count
        FROM lab_analytics
        WHERE DATE(check_in_time) = target_date
        GROUP BY hour
        ORDER BY count DESC
        LIMIT 1
    )
    SELECT 
        CASE 
            WHEN hour IS NOT NULL THEN make_time(hour::int, 0, 0)
            ELSE NULL
        END INTO peak_hour_time
    FROM hourly_counts;

    -- Insert or update the daily occupancy
    INSERT INTO lab_occupancy (date, occupancy_count, unique_visitors, peak_hour)
    VALUES (target_date, total_entries, visitor_count, peak_hour_time)
    ON CONFLICT (date) 
    DO UPDATE SET 
        occupancy_count = EXCLUDED.occupancy_count,
        unique_visitors = EXCLUDED.unique_visitors,
        peak_hour = EXCLUDED.peak_hour;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Create trigger function to update daily occupancy automatically
CREATE OR REPLACE FUNCTION trigger_update_daily_occupancy()
RETURNS trigger AS $$
BEGIN
    -- Update occupancy for the check-in date
    PERFORM calculate_daily_occupancy(DATE(NEW.check_in_time));
    
    -- If check-out is on a different day, update that too
    IF NEW.check_out_time IS NOT NULL AND DATE(NEW.check_out_time) != DATE(NEW.check_in_time) THEN
        PERFORM calculate_daily_occupancy(DATE(NEW.check_out_time));
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Create the trigger (drop existing one first to avoid conflicts)
DROP TRIGGER IF EXISTS update_occupancy_on_insert ON lab_analytics;

CREATE TRIGGER update_occupancy_on_insert
AFTER INSERT OR UPDATE ON lab_analytics
FOR EACH ROW
EXECUTE FUNCTION trigger_update_daily_occupancy();

-- Step 5: Backfill existing data for the last 30 days
DO $$
DECLARE
    target_date date;
    start_date date;
    end_date date;
BEGIN
    -- Calculate date range
    end_date := CURRENT_DATE;
    start_date := CURRENT_DATE - INTERVAL '30 days';
    
    -- Log the operation
    RAISE NOTICE 'Backfilling occupancy data from % to %', start_date, end_date;
    
    -- Process each day
    FOR target_date IN 
        SELECT generate_series(start_date, end_date, '1 day'::interval)::date
    LOOP
        -- Calculate occupancy for this date
        PERFORM calculate_daily_occupancy(target_date);
        
        -- Log progress
        RAISE NOTICE 'Processed date: %', target_date;
    END LOOP;
    
    RAISE NOTICE 'Backfill complete!';
END $$;

-- Step 6: Create a view for easier weekly data access (optional but helpful)
CREATE OR REPLACE VIEW weekly_occupancy_view AS
SELECT 
    date,
    to_char(date, 'Day') as day_name,
    to_char(date, 'DY') as day_abbr,
    occupancy_count as total_entries,
    unique_visitors,
    peak_hour,
    EXTRACT(DOW FROM date) as day_of_week
FROM lab_occupancy
WHERE date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY date ASC;

-- Step 7: Grant necessary permissions (adjust roles as needed)
GRANT SELECT ON weekly_occupancy_view TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON lab_occupancy TO authenticated;

-- Step 8: Create an index for better performance
CREATE INDEX IF NOT EXISTS idx_lab_occupancy_date ON lab_occupancy(date);
CREATE INDEX IF NOT EXISTS idx_lab_analytics_checkin_date ON lab_analytics(DATE(check_in_time));

-- Verification query - run this to check if everything is working
SELECT 
    date,
    occupancy_count,
    unique_visitors,
    peak_hour
FROM lab_occupancy
WHERE date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY date DESC;

-- Optional: Create a function to manually recalculate a date range
CREATE OR REPLACE FUNCTION recalculate_occupancy_range(start_date date, end_date date)
RETURNS void AS $$
DECLARE
    current_date date;
BEGIN
    FOR current_date IN 
        SELECT generate_series(start_date, end_date, '1 day'::interval)::date
    LOOP
        PERFORM calculate_daily_occupancy(current_date);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Usage example: SELECT recalculate_occupancy_range('2024-01-01', '2024-01-31');