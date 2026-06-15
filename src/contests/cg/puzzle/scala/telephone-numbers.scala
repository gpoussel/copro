// 🎮 CodinGame Puzzle - telephone-numbers
// https://www.codingame.com/training/medium/telephone-numbers

import scala.collection.mutable

object Solution {
  def main(args: Array[String]): Unit = {
    val n = scala.io.StdIn.readLine().trim.toInt
    val root = mutable.Map[Char, Any]()
    var cable = 0
    for (_ <- 0 until n) {
      val number = scala.io.StdIn.readLine().trim
      var node = root
      for (d <- number) {
        if (!node.contains(d)) {
          node(d) = mutable.Map[Char, Any]()
          cable += 1
        }
        node = node(d).asInstanceOf[mutable.Map[Char, Any]]
      }
    }
    println(cable)
  }
}
