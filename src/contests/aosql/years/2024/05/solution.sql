-- 🎄 Advent of SQL - Year 2024 - Day 5

WITH production_days_with_previous AS (
    SELECT production_date, LAG(production_date) OVER (ORDER BY production_date) AS previous_production_date
    FROM toy_production
), production_dfference AS (
    SELECT
        production_days_with_previous.production_date,
        (current_tp.toys_produced - previous_tp.toys_produced)::double precision / previous_tp.toys_produced::double precision AS diff_toys_produced
    FROM production_days_with_previous
    JOIN toy_production AS current_tp ON production_days_with_previous.production_date = current_tp.production_date
    JOIN toy_production AS previous_tp ON production_days_with_previous.previous_production_date = previous_tp.production_date
)
SELECT TO_CHAR(production_dfference.production_date, 'YYYY-MM-DD') AS production_date
FROM production_dfference
ORDER BY production_dfference.diff_toys_produced DESC
LIMIT 1;
