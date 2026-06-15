// 🎮 CodinGame Puzzle - 1d-bush-fire
// https://www.codingame.com/training/easy/1d-bush-fire

object Solution {
  def main(args: Array[String]): Unit = {
    val n = scala.io.StdIn.readLine().trim.toInt
    for (_ <- 0 until n) {
      val strip = scala.io.StdIn.readLine().replaceAll("\\s+$", "")
      var drops = 0
      var j = 0
      while (j < strip.length) {
        if (strip.charAt(j) == 'f') {
          // Drop at j covers j, j+1, j+2 — skip past all 3.
          drops += 1
          j += 3
        } else {
          j += 1
        }
      }
      println(drops)
    }
  }
}
