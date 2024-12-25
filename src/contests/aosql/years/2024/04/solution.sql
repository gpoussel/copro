-- 🎄 Advent of SQL - Year 2024 - Day 4

WITH previous_tags AS (
    SELECT toy_id, toy_name, unnest(previous_tags) AS tag
    FROM toy_production
), new_tags AS (
    SELECT toy_id, toy_name, unnest(new_tags) AS tag
    FROM toy_production
), toy_added_tags AS (
    SELECT toy_id, toy_name, tag
    FROM new_tags
    WHERE (toy_id, tag) NOT IN (SELECT toy_id, tag FROM previous_tags)
), toy_removed_tags AS (
    SELECT toy_id, toy_name, tag
    FROM previous_tags
    WHERE (toy_id, tag) NOT IN (SELECT toy_id, tag FROM new_tags)
), toy_unchanged_tags AS (
    SELECT toy_id, toy_name, tag
    FROM previous_tags
    WHERE (toy_id, tag) IN (SELECT toy_id, tag FROM new_tags)
), toy_added_tags_count AS (
    SELECT toy_id, COUNT(*) AS added_tags_count
    FROM toy_added_tags
    GROUP BY toy_id
    ORDER BY 2 DESC
), toy_removed_tags_count AS (
    SELECT toy_id, COUNT(*) AS removed_tags_count
    FROM toy_removed_tags
    GROUP BY toy_id
    ORDER BY 2 DESC
), toy_unchanged_tags_count AS (
    SELECT toy_id, COUNT(*) AS unchanged_tags_count
    FROM toy_unchanged_tags
    GROUP BY toy_id
    ORDER BY 2 DESC
)
SELECT
    toy_added_tags_count.toy_id,
    toy_added_tags_count.added_tags_count,
    COALESCE(toy_unchanged_tags_count.unchanged_tags_count, 0) AS unchanged_tags_count,
    COALESCE(toy_removed_tags_count.removed_tags_count, 0) AS removed_tags_count
FROM toy_added_tags_count
JOIN (SELECT toy_id FROM toy_added_tags_count LIMIT 1) AS most_added_tags ON toy_added_tags_count.toy_id = most_added_tags.toy_id
LEFT JOIN toy_removed_tags_count ON toy_added_tags_count.toy_id = toy_removed_tags_count.toy_id
LEFT JOIN toy_unchanged_tags_count ON toy_added_tags_count.toy_id = toy_unchanged_tags_count.toy_id