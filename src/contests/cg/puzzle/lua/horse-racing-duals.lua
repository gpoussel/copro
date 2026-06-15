-- 🎮 CodinGame Puzzle - horse-racing-duals
-- https://www.codingame.com/training/easy/horse-racing-duals

local n = tonumber(io.read())
local s = {}
for i = 1, n do
  s[i] = tonumber(io.read())
end
table.sort(s)
local min_diff = math.huge
for i = 2, n do
  local diff = s[i] - s[i - 1]
  if diff < min_diff then
    min_diff = diff
  end
end
print(min_diff)
