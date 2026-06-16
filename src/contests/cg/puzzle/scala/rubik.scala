// 🎮 CodinGame Puzzle - rubik
// https://www.codingame.com/training/medium/rubik

object Solution {
  def main(args: Array[String]): Unit = {
    val n = scala.io.StdIn.readLine().trim.toLong
    // Visible mini-cubes = all cubes minus the hidden inner cube of side n-2.
    val inner = if (n >= 2) n - 2 else 0L
    println(n * n * n - inner * inner * inner)
  }
}
