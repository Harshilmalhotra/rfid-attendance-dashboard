-- Create a table to track hourly occupancy statistics
CREATE TABLE public.hourly_occupancy (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  date date NOT NULL,
  hour integer NOT NULL CHECK (hour >= 0 AND hour <= 23),
  max_occupancy integer NOT NULL DEFAULT 0,
  avg_occupancy numeric(5,2) DEFAULT 0,
  unique_visitors integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT hourly_occupancy_pkey PRIMARY KEY (id),
  CONSTRAINT hourly_occupancy_date_hour_key UNIQUE (date, hour)
);

-- Create index for faster queries
CREATE INDEX idx_hourly_occupancy_date ON public.hourly_occupancy(date);
CREATE INDEX idx_hourly_occupancy_hour ON public.hourly_occupancy(hour);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_hourly_occupancy_updated_at BEFORE UPDATE
ON public.hourly_occupancy FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Optional: Create a view for peak hours analysis
CREATE VIEW peak_hours_summary AS
SELECT 
    hour,
    AVG(max_occupancy) as avg_max_occupancy,
    MAX(max_occupancy) as peak_occupancy,
    COUNT(DISTINCT date) as days_tracked
FROM hourly_occupancy
GROUP BY hour
ORDER BY hour;