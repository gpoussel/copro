-- 🎄 Advent of SQL - Year 2024 - Day 9

WITH average_speeds_per_exercise AS (
    SELECT reindeers.reindeer_id, exercise_name, AVG(speed_record) AS average_speed_record
    FROM training_sessions
    JOIN reindeers ON training_sessions.reindeer_id = reindeers.reindeer_id
    WHERE reindeers.reindeer_name != 'Rudolph'
    GROUP BY 1, 2
), average_speeds AS (
    SELECT reindeer_id, MAX(average_speed_record) AS average_speed
    FROM average_speeds_per_exercise
    GROUP BY 1
)
SELECT reindeers.reindeer_name, ROUND(average_speed, 2) AS average_speed
FROM average_speeds
JOIN reindeers ON average_speeds.reindeer_id = reindeers.reindeer_id
ORDER BY average_speed DESC
LIMIT 3;