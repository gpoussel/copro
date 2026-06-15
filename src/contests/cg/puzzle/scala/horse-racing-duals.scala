// 🎮 CodinGame Puzzle - horse-racing-duals
// https://www.codingame.com/training/easy/horse-racing-duals

object Solution {
  def main(args: Array[String]): Unit = {
    val n = scala.io.StdIn.readLine().trim.toInt
    val s = Array.fill(n)(scala.io.StdIn.readLine().trim.toInt)
    scala.util.Sorting.quickSort(s)
    var minDiff = Int.MaxValue
    for (i <- 1 until n) {
      val diff = s(i) - s(i - 1)
      if (diff < minDiff) minDiff = diff
    }
    println(minDiff)
  }
}
