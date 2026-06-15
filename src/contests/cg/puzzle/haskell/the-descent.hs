-- 🎮 CodinGame Puzzle - the-descent
-- https://www.codingame.com/training/easy/the-descent

import System.IO

-- Game loop: each turn, read 8 mountain heights and fire on the tallest one.
main :: IO ()
main = do
  hSetBuffering stdout NoBuffering
  let loop = do
        hs <- mapM (const (readLn :: IO Int)) [1 .. 8 :: Int]
        let go _ _ mi [] = mi
            go i mh mi (h : t) =
              if h > mh then go (i + 1) h i t else go (i + 1) mh mi t
        print (go (0 :: Int) (-1 :: Int) (0 :: Int) hs)
        loop
  loop
