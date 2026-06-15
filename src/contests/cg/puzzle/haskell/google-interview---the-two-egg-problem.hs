-- 🎮 CodinGame Puzzle - google-interview---the-two-egg-problem
-- https://www.codingame.com/training/hard/google-interview---the-two-egg-problem

main :: IO ()
main = do
  n <- readLn :: IO Integer
  print (head [k | k <- [0 ..], k * (k + 1) `div` 2 >= n])
