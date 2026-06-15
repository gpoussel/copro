// 🎮 CodinGame Puzzle - teds-compiler
// https://www.codingame.com/training/easy/teds-compiler

import scala.util.control.Breaks._

object Solution {
  def main(args: Array[String]): Unit = {
    val line = scala.io.StdIn.readLine().replaceAll("\\s+$", "")
    var balance = 0
    var best = 0
    breakable {
      for (i <- 0 until line.length) {
        if (line.charAt(i) == '<') balance += 1 else balance -= 1
        if (balance < 0) break()
        if (balance == 0) best = i + 1
      }
    }
    println(best)
  }
}
