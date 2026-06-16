// 🎮 CodinGame Puzzle - max-area
// https://www.codingame.com/training/easy/max-area

object Solution {
  def main(args: Array[String]): Unit = {
    scala.io.StdIn.readLine()
    val a = scala.io.StdIn.readLine().trim.split(" ").map(_.toLong)
    var left = 0
    var right = a.length - 1
    var best = 0L
    while (left < right) {
      val h = math.min(a(left), a(right))
      val area = h * (right - left)
      if (area > best) best = area
      if (a(left) < a(right)) left += 1 else right -= 1
    }
    println(best)
  }
}
