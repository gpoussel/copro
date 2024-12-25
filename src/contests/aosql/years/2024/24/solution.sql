-- 🎄 Advent of SQL - Year 2024 - Day 24

WITH play_counts AS (
    SELECT songs.song_id, COUNT(*)
    FROM user_plays
    JOIN songs USING (song_id)
    GROUP BY songs.song_id
), skip_count AS (
    SELECT song_id, COUNT(*)
    FROM user_plays
    JOIN songs USING (song_id)
    WHERE user_plays.duration IS NULL OR (songs.song_duration IS NOT NULL AND user_plays.duration < songs.song_duration)
    GROUP BY song_id
)
SELECT songs.song_title
FROM songs
JOIN play_counts USING (song_id)
JOIN skip_count USING (song_id)
ORDER BY play_counts.count DESC, skip_count.count ASC
LIMIT 1;