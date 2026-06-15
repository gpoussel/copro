-- 🎮 CodinGame Puzzle - distributing-candy
-- https://www.codingame.com/training/easy/distributing-candy

local sn, sm = io.read():match("(%S+)%s+(%S+)")
local n, m = tonumber(sn), tonumber(sm)
local candies = {}
for num in io.read():gmatch("%S+") do
  candies[#candies + 1] = tonumber(num)
end
table.sort(candies)
local best = math.huge
for i = 1, n - m + 1 do
  local diff = candies[i + m - 1] - candies[i]
  if diff < best then
    best = diff
  end
end
print(best)
