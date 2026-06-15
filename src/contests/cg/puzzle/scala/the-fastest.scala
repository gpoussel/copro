// 🎮 CodinGame Puzzle - the-fastest
// https://www.codingame.com/training/medium/the-fastest

object Solution {
  def main(args: Array[String]): Unit = {
    // Times are HH:MM:SS so lexicographic comparison equals chronological comparison.
    val n = scala.io.StdIn.readLine().trim.toInt
    var best = ""
    for (_ <- 0 until n) {
      val t = scala.io.StdIn.readLine().trim
      if (best == "" || t < best) best = t
    }
    println(best)
  }
}
