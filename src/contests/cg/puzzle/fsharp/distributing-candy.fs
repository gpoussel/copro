// 🎮 CodinGame Puzzle - distributing-candy
// https://www.codingame.com/training/easy/distributing-candy

let first = System.Console.ReadLine().Trim().Split(' ')
let n = int first.[0]
let m = int first.[1]
let candies = System.Console.ReadLine().Trim().Split(' ') |> Array.map int |> Array.sort
let mutable best = System.Int32.MaxValue
for i in 0 .. (n - m) do
    let diff = candies.[i + m - 1] - candies.[i]
    if diff < best then best <- diff
printfn "%d" best
