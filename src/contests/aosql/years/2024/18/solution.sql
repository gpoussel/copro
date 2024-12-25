-- 🎄 Advent of SQL - Year 2024 - Day 18

WITH RECURSIVE hierarchy_paths AS (
    SELECT staff_id, array[staff_id]::integer[] as path
    FROM staff
    WHERE manager_id IS NULL
    UNION ALL
    SELECT staff.staff_id, hierarchy_paths.path || hierarchy_paths.staff_id as path
    FROM staff
    INNER JOIN hierarchy_paths ON hierarchy_paths.staff_id = staff.manager_id
), peers AS (
    SELECT
        staff_id,
        array_length(path, 1)  AS "level",
        COUNT(*) OVER (PARTITION BY array_length(path, 1)) AS total_peers_same_level
    FROM hierarchy_paths
)
SELECT staff_id
FROM peers
ORDER BY total_peers_same_level DESC, staff_id
LIMIT 1;