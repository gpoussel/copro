-- 🎄 Advent of SQL - Year 2024 - Day 16

-- Done on DBFiddle
WITH area_entries AS (
    SELECT
        s.timestamp,
        t.place_name,
        LEAD(s.timestamp) OVER (ORDER BY s.timestamp) as next_timestamp,
        LEAD(t.place_name) OVER (ORDER BY s.timestamp) as next_place
    FROM
        sleigh_locations s
    JOIN
        areas t ON ST_Contains(t.polygon::geometry, s.coordinate::geometry)
),
duration_calc AS (
    SELECT 
        place_name,
        timestamp,
        next_timestamp,
        CASE 
            WHEN next_place = place_name THEN next_timestamp
            WHEN next_place IS NULL THEN next_timestamp
            ELSE next_timestamp
        END - timestamp as duration
    FROM 
        area_entries
)
SELECT 
    place_name
FROM 
    duration_calc
GROUP BY 
    place_name
ORDER BY 
    SUM(EXTRACT(EPOCH FROM duration))/3600 DESC
LIMIT 1;