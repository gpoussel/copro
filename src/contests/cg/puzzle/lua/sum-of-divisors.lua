-- 🎮 CodinGame Puzzle - sum-of-divisors
-- https://www.codingame.com/training/medium/sum-of-divisors

-- d appears as a divisor in floor(n/d) of the numbers 1..n, so the total sum
-- of divisors is sum over d of d * floor(n/d).
local n = tonumber(io.read())
local total = 0
for d = 1, n do
  total = total + d * (n // d)
end
print(total)
