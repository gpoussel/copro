// 🎮 CodinGame Puzzle - fibonaccis-rabbit
// https://www.codingame.com/training/easy/fibonaccis-rabbit

let l1 = System.Console.ReadLine().Trim().Split(' ')
let f0 = int l1.[0]
let n = int l1.[1]
let l2 = System.Console.ReadLine().Trim().Split(' ')
let a = int l2.[0]
let b = int l2.[1]
// FN can exceed 2^63 (but is < 2^64), so accumulate in uint64.
let f = Array.zeroCreate<uint64> (n + 1)
f.[0] <- uint64 f0
for i in 1 .. n do
    let mutable total = 0UL
    for k in a .. b do
        if i - k >= 0 then total <- total + f.[i - k]
    f.[i] <- total
printfn "%d" f.[n]
