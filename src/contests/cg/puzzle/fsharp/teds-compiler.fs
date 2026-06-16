// 🎮 CodinGame Puzzle - teds-compiler
// https://www.codingame.com/training/easy/teds-compiler

let line = System.Console.ReadLine().TrimEnd()
let mutable balance = 0
let mutable best = 0
let mutable i = 0
let mutable stop = false
while i < line.Length && not stop do
    if line.[i] = '<' then balance <- balance + 1 else balance <- balance - 1
    if balance < 0 then stop <- true
    else
        if balance = 0 then best <- i + 1
        i <- i + 1
printfn "%d" best
