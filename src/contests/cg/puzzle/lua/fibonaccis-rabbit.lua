-- 🎮 CodinGame Puzzle - fibonaccis-rabbit
-- https://www.codingame.com/training/easy/fibonaccis-rabbit

local sf0, sn = io.read():match("(%S+)%s+(%S+)")
local f0, n = tonumber(sf0), tonumber(sn)
local sa, sb = io.read():match("(%S+)%s+(%S+)")
local a, b = tonumber(sa), tonumber(sb)
local f = {}
for i = 0, n do
  f[i] = 0
end
f[0] = f0
for i = 1, n do
  local total = 0
  for k = a, b do
    if i - k >= 0 then
      total = total + f[i - k]
    end
  end
  f[i] = total
end
-- FN can exceed 2^63 (but is < 2^64); 64-bit integer math wraps mod 2^64,
-- so print the unsigned interpretation.
print(string.format("%u", f[n]))
