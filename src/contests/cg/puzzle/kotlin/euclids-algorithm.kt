// 🎮 CodinGame Puzzle - euclids-algorithm
// https://www.codingame.com/training/easy/euclids-algorithm

fun main() {
    val (a, b) = readLine()!!.trim().split(" ").map { it.toLong() }
    var x = a
    var y = b
    while (y != 0L) {
        val q = x / y
        val r = x % y
        println("$x=$y*$q+$r")
        x = y
        y = r
    }
    println("GCD($a,$b)=$x")
}
