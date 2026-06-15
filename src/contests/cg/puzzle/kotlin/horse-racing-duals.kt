// 🎮 CodinGame Puzzle - horse-racing-duals
// https://www.codingame.com/training/easy/horse-racing-duals

fun main() {
    val n = readLine()!!.trim().toInt()
    val s = IntArray(n) { readLine()!!.trim().toInt() }
    s.sort()
    var minDiff = Int.MAX_VALUE
    for (i in 1 until n) {
        val diff = s[i] - s[i - 1]
        if (diff < minDiff) minDiff = diff
    }
    println(minDiff)
}
