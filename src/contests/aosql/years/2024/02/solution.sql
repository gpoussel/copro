-- 🎄 Advent of SQL - Year 2024 - Day 2

SELECT string_agg(letters.value, '')
FROM (
    SELECT id, CHR(value) AS value
    FROM letters_a
    UNION ALL
    SELECT id, CHR(value) AS value
    FROM letters_b
) letters
WHERE (letters.value >= 'a' AND letters.value <= 'z')
   OR (letters.value >= 'A' AND letters.value <= 'Z')
   OR letters.value IN (' ', '!', '"', '''', '(', ')', ',', '-', '.', ':', ';', '?')