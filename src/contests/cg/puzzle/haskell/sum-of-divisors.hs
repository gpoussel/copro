-- 🎮 CodinGame Puzzle - sum-of-divisors
-- https://www.codingame.com/training/medium/sum-of-divisors

-- d appears as a divisor in floor(n/d) of the numbers 1..n, so the total sum
-- of divisors is sum over d of d * floor(n/d).
main :: IO ()
main = do
  n <- readLn :: IO Integer
  print (sum [d * (n `div` d) | d <- [1 .. n]])
