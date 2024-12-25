-- 🎄 Advent of SQL - Year 2024 - Day 21

WITH quarter_results AS (
    SELECT
        EXTRACT(year FROM sale_date) AS year,
        EXTRACT(quarter FROM sale_date) AS quarter,
        SUM(amount) AS total
    FROM sales
    GROUP BY 1, 2
), quarter_diff AS (
    SELECT
        year,
        quarter,
        total - LAG(total) OVER (ORDER BY year, quarter) AS diff
    FROM quarter_results
)
SELECT year, quarter
FROM quarter_diff
ORDER BY quarter_diff.diff DESC NULLS LAST
LIMIT 1;