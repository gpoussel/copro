-- 🎮 CodinGame Puzzle - teds-compiler
-- https://www.codingame.com/training/easy/teds-compiler

local line = (io.read():gsub("%s+$", ""))
local balance = 0
local best = 0
for i = 1, #line do
  local c = line:sub(i, i)
  if c == "<" then
    balance = balance + 1
  else
    balance = balance - 1
  end
  if balance < 0 then
    break
  end
  if balance == 0 then
    best = i
  end
end
print(best)
