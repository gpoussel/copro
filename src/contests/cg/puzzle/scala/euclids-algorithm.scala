// 🎮 CodinGame Puzzle - euclids-algorithm
// https://www.codingame.com/training/easy/euclids-algorithm

object Solution {
  def main(args: Array[String]): Unit = {
    val Array(a, b) = scala.io.StdIn.readLine().trim.split(" ").map(_.toLong)
    var x = a
    var y = b
    while (y != 0) {
      val q = x / y
      val r = x % y
      println(s"$x=$y*$q+$r")
      x = y
      y = r
    }
    println(s"GCD($a,$b)=$x")
  }
}
