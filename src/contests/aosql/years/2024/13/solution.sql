-- 🎄 Advent of SQL - Year 2024 - Day 13

SELECT split_part(unnest(email_addresses), '@', 2)
FROM contact_list
GROUP BY 1
ORDER BY COUNT(*) DESC
LIMIT 1;