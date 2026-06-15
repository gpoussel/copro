// 🎮 CodinGame Puzzle - mirrors
// https://www.codingame.com/training/easy/mirrors

import java.util.Locale

fun main() {
    readLine()
    val r = readLine()!!.trim().split(" ").map { it.toDouble() }
    var reflected = 0.0
    for (i in r.indices.reversed()) {
        val ri = r[i]
        val denom = 1 - ri * reflected
        reflected = ri + if (denom == 0.0) 0.0 else ((1 - ri) * (1 - ri) * reflected) / denom
    }
    println(String.format(Locale.US, "%.4f", reflected))
}
