// 🎮 CodinGame Puzzle - the-fastest
// https://www.codingame.com/training/medium/the-fastest

fun main() {
    // Times are HH:MM:SS so lexicographic comparison equals chronological comparison.
    val n = readLine()!!.trim().toInt()
    var best = ""
    for (i in 0 until n) {
        val t = readLine()!!.trim()
        if (best == "" || t < best) best = t
    }
    println(best)
}
