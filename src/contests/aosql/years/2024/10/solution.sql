-- 🎄 Advent of SQL - Year 2024 - Day 10

WITH sum_of_drinks AS (
    SELECT drink_name, date, SUM(quantity) AS total_quantity
    FROM Drinks
    GROUP BY 1, 2
)
SELECT to_char(d1.date, 'YYYY-MM-DD') AS date
FROM sum_of_drinks d1
JOIN sum_of_drinks d2 ON d1.date = d2.date AND d2.drink_name = 'Peppermint Schnapps' AND d2.total_quantity = 298
JOIN sum_of_drinks d3 ON d1.date = d3.date AND d3.drink_name = 'Eggnog' AND d3.total_quantity = 198
WHERE d1.drink_name = 'Hot Cocoa' AND d1.total_quantity = 38