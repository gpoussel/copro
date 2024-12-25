-- 🎄 Advent of SQL - Year 2024 - Day 22

SELECT COUNT(*)
FROM elves
WHERE 'SQL' = ANY(string_to_array(skills, ','));