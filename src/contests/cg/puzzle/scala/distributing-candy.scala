// 🎮 CodinGame Puzzle - distributing-candy
// https://www.codingame.com/training/easy/distributing-candy

object Solution {
  def main(args: Array[String]): Unit = {
    val Array(n, m) = scala.io.StdIn.readLine().trim.split(" ").map(_.toInt)
    val candies = scala.io.StdIn.readLine().trim.split(" ").map(_.toInt).sorted
    var best = Int.MaxValue
    var i = 0
    while (i + m - 1 < n) {
      val diff = candies(i + m - 1) - candies(i)
      if (diff < best) best = diff
      i += 1
    }
    println(best)
  }
}
