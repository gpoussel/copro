-- 🎮 CodinGame Puzzle - telephone-numbers
-- https://www.codingame.com/training/medium/telephone-numbers

local n = tonumber(io.read())
local root = {}
local cable_units = 0
for _ = 1, n do
  local number = (io.read():gsub("%s+$", ""))
  local node = root
  for d in number:gmatch(".") do
    if node[d] == nil then
      node[d] = {}
      cable_units = cable_units + 1
    end
    node = node[d]
  end
end
print(cable_units)
