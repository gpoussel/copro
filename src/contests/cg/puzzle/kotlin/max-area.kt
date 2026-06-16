// 🎮 CodinGame Puzzle - max-area
// https://www.codingame.com/training/easy/max-area

fun main() {
    readLine()
    val a = readLine()!!.trim().split(" ").map { it.toLong() }
    var left = 0
    var right = a.size - 1
    var best = 0L
    while (left < right) {
        val h = minOf(a[left], a[right])
        val area = h * (right - left)
        if (area > best) best = area
        if (a[left] < a[right]) left++ else right--
    }
    println(best)
}
