-- 🎮 CodinGame Puzzle - 1d-bush-fire
-- https://www.codingame.com/training/easy/1d-bush-fire

count :: String -> Int
count = go 0
  where
    go acc [] = acc
    -- Drop at the fire covers it plus the next two cells — skip past all 3.
    go acc ('f' : rest) = go (acc + 1) (drop 2 rest)
    go acc (_ : rest) = go acc rest

main :: IO ()
main = do
  n <- readLn :: IO Int
  ls <- mapM (const getLine) [1 .. n]
  mapM_ (print . count) ls
