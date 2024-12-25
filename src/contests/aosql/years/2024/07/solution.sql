-- 🎄 Advent of SQL - Year 2024 - Day 7

SELECT DISTINCT
    FIRST_VALUE(elf_id) OVER (PARTITION BY primary_skill ORDER BY years_experience DESC, elf_id) AS max_id,
    FIRST_VALUE(elf_id) OVER (PARTITION BY primary_skill ORDER BY years_experience, elf_id) AS min_id,
    primary_skill
FROM workshop_elves
ORDER BY max_id, min_id;