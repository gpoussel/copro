-- 🎮 CodinGame Puzzle - euclids-algorithm
-- https://www.codingame.com/training/easy/euclids-algorithm

main :: IO ()
main = do
  line <- getLine
  let [a, b] = map read (words line) :: [Integer]
      go x y
        | y == 0 = putStrLn ("GCD(" ++ show a ++ "," ++ show b ++ ")=" ++ show x)
        | otherwise = do
            let q = x `div` y
                r = x `mod` y
            putStrLn (show x ++ "=" ++ show y ++ "*" ++ show q ++ "+" ++ show r)
            go y r
  go a b
