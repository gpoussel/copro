-- 🎮 CodinGame Puzzle - the-fastest
-- https://www.codingame.com/training/medium/the-fastest

-- Times are HH:MM:SS so lexicographic comparison equals chronological comparison.
main :: IO ()
main = do
  n <- readLn :: IO Int
  ts <- mapM (const getLine) [1 .. n]
  putStrLn (minimum ts)
