-- 🎮 CodinGame Puzzle - rubik
-- https://www.codingame.com/training/medium/rubik

main :: IO ()
main = do
  n <- readLn :: IO Integer
  -- Visible mini-cubes = all cubes minus the hidden inner cube of side n-2.
  let inner = if n >= 2 then n - 2 else 0
  print (n * n * n - inner * inner * inner)
