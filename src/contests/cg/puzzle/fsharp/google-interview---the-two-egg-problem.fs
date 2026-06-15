// 🎮 CodinGame Puzzle - google-interview---the-two-egg-problem
// https://www.codingame.com/training/hard/google-interview---the-two-egg-problem

let n = int64 (System.Console.ReadLine().Trim())
let mutable k = 0L
while k * (k + 1L) / 2L < n do
    k <- k + 1L
printfn "%d" k
