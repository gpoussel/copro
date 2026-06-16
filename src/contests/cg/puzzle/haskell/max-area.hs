-- 🎮 CodinGame Puzzle - max-area
-- https://www.codingame.com/training/easy/max-area

import Data.Array

main :: IO ()
main = do
  _ <- getLine
  line <- getLine
  let xs = map read (words line) :: [Integer]
      n = length xs
      arr = listArray (0, n - 1) xs
      go l r best
        | l >= r = best
        | otherwise =
            let h = min (arr ! l) (arr ! r)
                area = h * fromIntegral (r - l)
                nb = max best area
             in if arr ! l < arr ! r then go (l + 1) r nb else go l (r - 1) nb
  print (go 0 (n - 1) 0)
