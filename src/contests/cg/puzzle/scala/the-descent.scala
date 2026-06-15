// 🎮 CodinGame Puzzle - the-descent
// https://www.codingame.com/training/easy/the-descent

import java.io.{BufferedReader, InputStreamReader}

// CodinGame's Scala game-loop runner launches an object named `Player`.
object Player {
  def main(args: Array[String]): Unit = {
    // Game loop: each turn, read 8 mountain heights and fire on the tallest one.
    val br = new BufferedReader(new InputStreamReader(System.in))
    while (true) {
      var maxHeight = -1
      var maxIndex = 0
      for (i <- 0 until 8) {
        val h = br.readLine().trim.toInt
        if (h > maxHeight) {
          maxHeight = h
          maxIndex = i
        }
      }
      println(maxIndex)
    }
  }
}
