-- 🎮 CodinGame Puzzle - euclids-algorithm
-- https://www.codingame.com/training/easy/euclids-algorithm

local sa, sb = io.read():match("(%S+)%s+(%S+)")
local a, b = tonumber(sa), tonumber(sb)
local x, y = a, b
while y ~= 0 do
  local q = x // y
  local r = x % y
  print(string.format("%d=%d*%d+%d", x, y, q, r))
  x, y = y, r
end
print(string.format("GCD(%d,%d)=%d", a, b, x))
