// 🎮 CodinGame Puzzle - distributing-candy
// https://www.codingame.com/training/easy/distributing-candy

fun main() {
    val (n, m) = readLine()!!.trim().split(" ").map { it.toInt() }
    val candies = readLine()!!.trim().split(" ").map { it.toInt() }.sorted()
    var best = Int.MAX_VALUE
    var i = 0
    while (i + m - 1 < n) {
        val diff = candies[i + m - 1] - candies[i]
        if (diff < best) best = diff
        i++
    }
    println(best)
}
