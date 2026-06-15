-- 🎮 CodinGame Puzzle - teds-compiler
-- https://www.codingame.com/training/easy/teds-compiler

main :: IO ()
main = do
  line <- getLine
  let go _ _ best [] = best
      go i balance best (c : cs)
        | nb < 0 = best
        | nb == 0 = go (i + 1) nb (i + 1) cs
        | otherwise = go (i + 1) nb best cs
        where
          nb = if c == '<' then balance + 1 else balance - 1
  print (go (0 :: Int) (0 :: Int) (0 :: Int) line)
