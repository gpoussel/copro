-- 🎄 Advent of SQL - Year 2024 - Day 19

WITH last_performance_score AS (
    SELECT employee_id, year_end_performance_scores[array_upper(year_end_performance_scores, 1)] AS last_score
    FROM employees
), average_performance_score AS (
    SELECT AVG(last_score) AS average_score
    FROM last_performance_score
), bonuses AS (
    SELECT employee_id, CASE WHEN last_score > average_score THEN 1.15 ELSE 1 END AS ratio
    FROM last_performance_score, average_performance_score
)
SELECT ROUND(SUM(employees.salary * bonuses.ratio), 2)
FROM employees
JOIN bonuses USING (employee_id);