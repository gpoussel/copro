-- 🎮 CodinGame Puzzle - rubik
-- https://www.codingame.com/training/medium/rubik

local n = tonumber(io.read())
-- Visible mini-cubes = all cubes minus the hidden inner cube of side n-2.
local inner = n >= 2 and n - 2 or 0
print(n * n * n - inner * inner * inner)
