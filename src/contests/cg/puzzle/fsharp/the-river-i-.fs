// 🎮 CodinGame Puzzle - the-river-i-
// https://www.codingame.com/training/easy/the-river-i-

let digitSum (x0: int64) =
    let mutable x = x0
    let mutable s = 0L
    while x > 0L do
        s <- s + x % 10L
        x <- x / 10L
    s

let mutable a = int64 (System.Console.ReadLine().Trim())
let mutable b = int64 (System.Console.ReadLine().Trim())
while a <> b do
    if a < b then a <- a + digitSum a else b <- b + digitSum b
printfn "%d" a
