-- 🎮 CodinGame Puzzle - the-river-i-
-- https://www.codingame.com/training/easy/the-river-i-

local function digit_sum(x)
  local s = 0
  while x > 0 do
    s = s + x % 10
    x = x // 10
  end
  return s
end

local a = tonumber(io.read())
local b = tonumber(io.read())
while a ~= b do
  if a < b then
    a = a + digit_sum(a)
  else
    b = b + digit_sum(b)
  end
end
print(a)
