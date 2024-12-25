-- 🎄 Advent of SQL - Year 2024 - Day 14

SELECT receipts.drop_off
FROM SantaRecords,
     jsonb_to_recordset(SantaRecords.cleaning_receipts) AS receipts(drop_off text, garment text, color text)
WHERE receipts.garment = 'suit'
  AND receipts.color = 'green'
ORDER BY 1 DESC
LIMIT 1;