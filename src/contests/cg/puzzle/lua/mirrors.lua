-- 🎮 CodinGame Puzzle - mirrors
-- https://www.codingame.com/training/easy/mirrors

io.read()
local r = {}
for num in io.read():gmatch("%S+") do
  r[#r + 1] = tonumber(num)
end
local reflected = 0.0
for i = #r, 1, -1 do
  local ri = r[i]
  local denom = 1 - ri * reflected
  if denom == 0 then
    reflected = ri
  else
    reflected = ri + ((1 - ri) * (1 - ri) * reflected) / denom
  end
end
print(string.format("%.4f", reflected))
