// 🎮 CodinGame Puzzle - sum-of-divisors
// https://www.codingame.com/training/medium/sum-of-divisors

fun main() {
    // d appears as a divisor in floor(n/d) of the numbers 1..n, so the total sum
    // of divisors is sum over d of d * floor(n/d).
    val n = readLine()!!.trim().toLong()
    var total = 0L
    var d = 1L
    while (d <= n) {
        total += d * (n / d)
        d++
    }
    println(total)
}
