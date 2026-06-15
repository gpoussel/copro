-- 🎮 CodinGame Puzzle - max-area
-- https://www.codingame.com/training/easy/max-area

io.read()
local a = {}
for num in io.read():gmatch("%S+") do
  a[#a + 1] = tonumber(num)
end
local left = 1
local right = #a
local best = 0
while left < right do
  local height = math.min(a[left], a[right])
  local area = height * (right - left)
  if area > best then
    best = area
  end
  if a[left] < a[right] then
    left = left + 1
  else
    right = right - 1
  end
end
print(best)
