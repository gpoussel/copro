// 🎮 CodinGame Puzzle - fibonaccis-rabbit
// https://www.codingame.com/training/easy/fibonaccis-rabbit

object Solution {
  def main(args: Array[String]): Unit = {
    val Array(f0, n) = scala.io.StdIn.readLine().trim.split(" ").map(_.toInt)
    val Array(a, b) = scala.io.StdIn.readLine().trim.split(" ").map(_.toInt)
    // FN can exceed 2^63 (but is < 2^64), so accumulate with BigInt.
    val f = Array.fill[BigInt](n + 1)(BigInt(0))
    f(0) = BigInt(f0)
    for (i <- 1 to n) {
      var total = BigInt(0)
      for (k <- a to b) {
        if (i - k >= 0) total += f(i - k)
      }
      f(i) = total
    }
    println(f(n))
  }
}
