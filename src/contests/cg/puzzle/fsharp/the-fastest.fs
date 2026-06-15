// 🎮 CodinGame Puzzle - the-fastest
// https://www.codingame.com/training/medium/the-fastest

// Times are HH:MM:SS so lexicographic comparison equals chronological comparison.
let n = int (System.Console.ReadLine().Trim())
let mutable best = ""
for _ in 1 .. n do
    let t = System.Console.ReadLine().Trim()
    if best = "" || System.String.CompareOrdinal(t, best) < 0 then best <- t
printfn "%s" best
