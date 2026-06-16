// 🎮 CodinGame Puzzle - euclids-algorithm
// https://www.codingame.com/training/easy/euclids-algorithm

let parts = System.Console.ReadLine().Trim().Split(' ')
let a = int64 parts.[0]
let b = int64 parts.[1]
let mutable x = a
let mutable y = b
while y <> 0L do
    let q = x / y
    let r = x % y
    printfn "%d=%d*%d+%d" x y q r
    x <- y
    y <- r
printfn "GCD(%d,%d)=%d" a b x
