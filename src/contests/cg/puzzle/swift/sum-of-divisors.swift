// 🎮 CodinGame Puzzle - sum-of-divisors
// https://www.codingame.com/training/medium/sum-of-divisors

// d appears as a divisor in floor(n/d) of the numbers 1..n, so the total sum
// of divisors is sum over d of d * floor(n/d).
let n = Int(readLine()!)!
var total = 0
var d = 1
while d <= n {
    total += d * (n / d)
    d += 1
}
print(total)
