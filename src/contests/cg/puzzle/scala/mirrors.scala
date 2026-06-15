// 🎮 CodinGame Puzzle - mirrors
// https://www.codingame.com/training/easy/mirrors

object Solution {
  def main(args: Array[String]): Unit = {
    scala.io.StdIn.readLine()
    val r = scala.io.StdIn.readLine().trim.split(" ").map(_.toDouble)
    var reflected = 0.0
    for (i <- r.indices.reverse) {
      val ri = r(i)
      val denom = 1 - ri * reflected
      reflected = ri + (if (denom == 0) 0.0 else ((1 - ri) * (1 - ri) * reflected) / denom)
    }
    println("%.4f".formatLocal(java.util.Locale.US, reflected))
  }
}
