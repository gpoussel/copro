-- 🎮 CodinGame Puzzle - the-fastest
-- https://www.codingame.com/training/medium/the-fastest

-- Times are HH:MM:SS so lexicographic comparison equals chronological comparison.
local n = tonumber(io.read())
local best = nil
for _ = 1, n do
  local t = (io.read():gsub("%s+$", ""))
  if best == nil or t < best then
    best = t
  end
end
print(best)
