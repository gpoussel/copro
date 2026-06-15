-- 🎮 CodinGame Puzzle - mirrors
-- https://www.codingame.com/training/easy/mirrors

import Text.Printf (printf)

main :: IO ()
main = do
  _ <- getLine
  line <- getLine
  let r = map read (words line) :: [Double]
      step reflected ri =
        let denom = 1 - ri * reflected
         in ri + (if denom == 0 then 0 else ((1 - ri) * (1 - ri) * reflected) / denom)
      reflected = foldl step 0.0 (reverse r)
  printf "%.4f\n" reflected
