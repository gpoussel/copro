-- 🎄 Advent of SQL - Year 2024 - Day 20

WITH unnested_params as (
    SELECT url, unnest(string_to_array(split_part(url, '?', 2), '&')) AS param
    FROM web_requests
    WHERE url LIKE '%utm_source=advent-of-sql%'
), key_value as (
    SELECT url, split_part(param, '=', 1) param_key, split_part(param, '=', 2) param_value
    FROM unnested_params 
)
SELECT url
FROM key_value
GROUP BY 1
ORDER BY COUNT(DISTINCT param_key) DESC, 1
LIMIT 1;