// 🎮 CodinGame Puzzle - horse-racing-duals
// https://www.codingame.com/training/easy/horse-racing-duals

let n = int (System.Console.ReadLine().Trim())
let s = Array.zeroCreate<int64> n
for i in 0 .. (n - 1) do
    s.[i] <- int64 (System.Console.ReadLine().Trim())
Array.sortInPlace s
let mutable minDiff = System.Int64.MaxValue
for i in 1 .. (n - 1) do
    let diff = s.[i] - s.[i - 1]
    if diff < minDiff then minDiff <- diff
printfn "%d" minDiff
