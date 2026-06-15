// 🎮 CodinGame Puzzle - 1d-bush-fire
// https://www.codingame.com/training/easy/1d-bush-fire

let n = int (System.Console.ReadLine().Trim())
for _ in 1 .. n do
    let strip = System.Console.ReadLine().TrimEnd()
    let mutable drops = 0
    let mutable j = 0
    while j < strip.Length do
        if strip.[j] = 'f' then
            // Drop at j covers j, j+1, j+2 — skip past all 3.
            drops <- drops + 1
            j <- j + 3
        else
            j <- j + 1
    printfn "%d" drops
