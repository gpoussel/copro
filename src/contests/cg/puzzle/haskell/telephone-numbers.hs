-- 🎮 CodinGame Puzzle - telephone-numbers
-- https://www.codingame.com/training/medium/telephone-numbers

import Data.List (inits)
import qualified Data.Set as Set

-- Each distinct non-empty prefix is exactly one trie node (= one cable unit).
main :: IO ()
main = do
  n <- readLn :: IO Int
  ls <- mapM (const getLine) [1 .. n]
  let prefixes = Set.fromList (concatMap (filter (not . null) . inits) ls)
  print (Set.size prefixes)
