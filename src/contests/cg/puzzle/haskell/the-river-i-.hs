-- 🎮 CodinGame Puzzle - the-river-i-
-- https://www.codingame.com/training/easy/the-river-i-

main :: IO ()
main = do
  a <- readLn :: IO Integer
  b <- readLn :: IO Integer
  let digitSum x = sum (map (\c -> fromIntegral (fromEnum c - fromEnum '0')) (show x)) :: Integer
      go x y
        | x == y = x
        | x < y = go (x + digitSum x) y
        | otherwise = go x (y + digitSum y)
  print (go a b)
