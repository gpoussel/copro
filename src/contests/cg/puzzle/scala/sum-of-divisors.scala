// 🎮 CodinGame Puzzle - sum-of-divisors
// https://www.codingame.com/training/medium/sum-of-divisors

object Solution {
  def main(args: Array[String]): Unit = {
    // d appears as a divisor in floor(n/d) of the numbers 1..n, so the total
    // sum of divisors is sum over d of d * floor(n/d).
    val n = scala.io.StdIn.readLine().trim.toLong
    var total = 0L
    var d = 1L
    while (d <= n) {
      total += d * (n / d)
      d += 1
    }
    println(total)
  }
}
