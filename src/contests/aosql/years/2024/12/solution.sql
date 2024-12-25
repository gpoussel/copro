-- 🎄 Advent of SQL - Year 2024 - Day 12

WITH gift_count AS (
    SELECT gift_id, COUNT(*)
    FROM gift_requests
    GROUP BY gift_id
), percentiles AS (
    SELECT gift_name, PERCENT_RANK() OVER (ORDER BY COUNT ASC) AS percentile
    FROM gift_count
    JOIN gifts USING (gift_id)
), ranked_percentiles AS (
    SELECT gift_name, percentile, RANK() OVER (ORDER BY percentile DESC) AS rank
    FROM percentiles
)
SELECT gift_name, ROUND(percentile::numeric, 2)
FROM ranked_percentiles
WHERE rank > 1
ORDER BY rank, gift_name
LIMIT 1;