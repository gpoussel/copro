// 🎮 CodinGame Puzzle - mirrors
// https://www.codingame.com/training/easy/mirrors

System.Console.ReadLine() |> ignore
let r = System.Console.ReadLine().Trim().Split(' ') |> Array.map float
let mutable reflected = 0.0
for i in (r.Length - 1) .. -1 .. 0 do
    let ri = r.[i]
    let denom = 1.0 - ri * reflected
    reflected <- ri + (if denom = 0.0 then 0.0 else ((1.0 - ri) * (1.0 - ri) * reflected) / denom)
printfn "%.4f" reflected
