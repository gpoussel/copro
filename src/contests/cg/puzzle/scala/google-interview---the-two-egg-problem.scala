// 🎮 CodinGame Puzzle - google-interview---the-two-egg-problem
// https://www.codingame.com/training/hard/google-interview---the-two-egg-problem

object Solution {
  def main(args: Array[String]): Unit = {
    val n = scala.io.StdIn.readLine().trim.toLong
    var k = 0L
    while (k * (k + 1) / 2 < n) k += 1
    println(k)
  }
}
