-- 🎄 Advent of SQL - Year 2024 - Day 8

WITH RECURSIVE t(employee, managers) AS (
    SELECT staff_id, ARRAY[]::INTEGER[] FROM staff WHERE manager_id IS NULL
    UNION ALL
    SELECT staff.staff_id, t.managers || staff.manager_id
    FROM staff
    JOIN t ON staff.manager_id = t.employee
)
SELECT array_length(managers, 1) + 1 AS depth
FROM t
WHERE array_length(managers, 1) IS NOT NULL
ORDER BY 1 DESC
LIMIT 1;