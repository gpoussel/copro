-- 🎄 Advent of SQL - Year 2024 - Day 3

WITH guest_counts AS (
    SELECT
        christmas_menus.id,
        (xpath('(//total_present/text() | //total_guests/text() | //total_count/text())', christmas_menus.menu_data))[1]::text::integer AS seats
    FROM christmas_menus
), food_items AS (
    SELECT
        christmas_menus.id,
        unnest(xpath('//food_item_id/text()', christmas_menus.menu_data))::text::integer AS food_item_id
    FROM christmas_menus
    JOIN guest_counts ON christmas_menus.id = guest_counts.id
    WHERE seats > 78
), food_items_counts AS (
    SELECT
        food_items.food_item_id,
        COUNT(food_items.*) AS count
    FROM food_items
    GROUP BY food_items.food_item_id
    ORDER BY 2 DESC
)
SELECT food_item_id
FROM food_items_counts
LIMIT 1;
