-- 🎄 Advent of SQL - Year 2024 - Day 11

WITH seasons(id, name) AS (
    VALUES (1, 'Spring'), (2, 'Summer'), (3, 'Fall'), (4, 'Winter')
), moving_average_harvested_trees AS (
    SELECT
        field_name,
        harvest_year,
        seasons.id,
        trees_harvested,
        AVG(trees_harvested) OVER wdw AS average_trees
    FROM TreeHarvests
    JOIN seasons ON TreeHarvests.season = seasons.name
    WINDOW wdw AS (PARTITION BY field_name ORDER BY harvest_year, seasons.id ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)
)
SELECT ROUND(MAX(average_trees), 2)
FROM moving_average_harvested_trees;