// 🎮 CodinGame Puzzle - the-river-i-
// https://www.codingame.com/training/easy/the-river-i-

object Solution {
  def digitSum(x0: Long): Long = {
    var x = x0
    var s = 0L
    while (x > 0) {
      s += x % 10
      x /= 10
    }
    s
  }

  def main(args: Array[String]): Unit = {
    var a = scala.io.StdIn.readLine().trim.toLong
    var b = scala.io.StdIn.readLine().trim.toLong
    while (a != b) {
      if (a < b) a += digitSum(a) else b += digitSum(b)
    }
    println(a)
  }
}
