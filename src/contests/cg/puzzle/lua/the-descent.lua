-- 🎮 CodinGame Puzzle - the-descent
-- https://www.codingame.com/training/easy/the-descent

-- Game loop: each turn, read 8 mountain heights and fire on the tallest one.
io.stdout:setvbuf("no")
while true do
  local max_height = -1
  local max_index = 0
  for i = 0, 7 do
    local h = tonumber(io.read())
    if h > max_height then
      max_height = h
      max_index = i
    end
  end
  print(max_index)
end
