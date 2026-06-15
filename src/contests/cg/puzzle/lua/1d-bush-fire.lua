-- 🎮 CodinGame Puzzle - 1d-bush-fire
-- https://www.codingame.com/training/easy/1d-bush-fire

local n = tonumber(io.read())
for _ = 1, n do
  local strip = (io.read():gsub("%s+$", ""))
  local drops = 0
  local j = 1
  while j <= #strip do
    if strip:sub(j, j) == "f" then
      -- Drop at j covers j, j+1, j+2 — skip past all 3.
      drops = drops + 1
      j = j + 3
    else
      j = j + 1
    end
  end
  print(drops)
end
