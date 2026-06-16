-- 🎮 CodinGame Puzzle - fibonaccis-rabbit
-- https://www.codingame.com/training/easy/fibonaccis-rabbit

-- Integer is arbitrary precision, so FN > 2^63 is exact.
main :: IO ()
main = do
  l1 <- getLine
  let [f0, n] = map read (words l1) :: [Int]
  l2 <- getLine
  let [a, b] = map read (words l2) :: [Int]
      f = [fval i | i <- [0 .. n]]
      fval 0 = fromIntegral f0 :: Integer
      fval i = sum [f !! (i - k) | k <- [a .. b], i - k >= 0]
  print (f !! n)
