-- 🎄 Advent of SQL - Year 2024 - Day 6

WITH average_gift_price AS (
    SELECT AVG(price)
    FROM gifts
)
SELECT children.name
FROM children
JOIN gifts USING (child_id)
WHERE gifts.price > (SELECT * FROM average_gift_price)
ORDER BY gifts.price ASC
LIMIT 1;
