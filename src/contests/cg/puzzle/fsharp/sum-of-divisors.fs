// 🎮 CodinGame Puzzle - sum-of-divisors
// https://www.codingame.com/training/medium/sum-of-divisors

// d appears as a divisor in floor(n/d) of the numbers 1..n, so the total sum
// of divisors is sum over d of d * floor(n/d).
let n = int64 (System.Console.ReadLine().Trim())
let mutable total = 0L
let mutable d = 1L
while d <= n do
    total <- total + d * (n / d)
    d <- d + 1L
printfn "%d" total
