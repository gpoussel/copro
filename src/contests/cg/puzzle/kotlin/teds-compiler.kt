// 🎮 CodinGame Puzzle - teds-compiler
// https://www.codingame.com/training/easy/teds-compiler

fun main() {
    val line = readLine()!!.trimEnd()
    var balance = 0
    var best = 0
    for (i in line.indices) {
        if (line[i] == '<') balance++ else balance--
        if (balance < 0) break
        if (balance == 0) best = i + 1
    }
    println(best)
}
