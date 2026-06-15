// 🎮 CodinGame Puzzle - max-area
// https://www.codingame.com/training/easy/max-area

System.Console.ReadLine() |> ignore
let a = System.Console.ReadLine().Trim().Split(' ') |> Array.map int64
let mutable left = 0
let mutable right = a.Length - 1
let mutable best = 0L
while left < right do
    let h = min a.[left] a.[right]
    let area = h * int64 (right - left)
    if area > best then best <- area
    if a.[left] < a.[right] then left <- left + 1 else right <- right - 1
printfn "%d" best
