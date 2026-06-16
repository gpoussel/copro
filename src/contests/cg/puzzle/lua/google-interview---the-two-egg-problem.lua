-- 🎮 CodinGame Puzzle - google-interview---the-two-egg-problem
-- https://www.codingame.com/training/hard/google-interview---the-two-egg-problem

local n = tonumber(io.read())
local k = 0
while k * (k + 1) // 2 < n do
  k = k + 1
end
print(k)
