-- 🎮 CodinGame Puzzle - horse-racing-duals
-- https://www.codingame.com/training/easy/horse-racing-duals

import Data.List (sort)

main :: IO ()
main = do
  n <- readLn :: IO Int
  xs <- mapM (const (readLn :: IO Integer)) [1 .. n]
  let s = sort xs
  print (minimum (zipWith (-) (tail s) s))
