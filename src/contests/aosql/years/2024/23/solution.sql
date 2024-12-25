-- 🎄 Advent of SQL - Year 2024 - Day 23

WITH deltas AS (
    SELECT id, id - LAG(id, 1, 0)  OVER (ORDER BY id) AS diff
    FROM sequence_table
)
SELECT
    array_to_string(ARRAY(
        SELECT a.n
        FROM generate_series(deltas.id - diff + 1, deltas.id - 1) AS a(n)
    ), ',')
FROM deltas
WHERE deltas.diff > 1;