-- 🎄 Advent of SQL - Year 2024 - Day 15

-- Done on DBFiddle
SELECT place_name
FROM sleigh_locations
INNER JOIN areas ON ST_Contains(areas.polygon::geometry, sleigh_locations.coordinate::geometry);