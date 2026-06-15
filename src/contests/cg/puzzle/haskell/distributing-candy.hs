-- 🎮 CodinGame Puzzle - distributing-candy
-- https://www.codingame.com/training/easy/distributing-candy

import Data.List (sort)

main :: IO ()
main = do
  l1 <- getLine
  let [_, m] = map read (words l1) :: [Int]
  l2 <- getLine
  let sorted = sort (map read (words l2)) :: [Int]
  print (minimum (zipWith (-) (drop (m - 1) sorted) sorted))
