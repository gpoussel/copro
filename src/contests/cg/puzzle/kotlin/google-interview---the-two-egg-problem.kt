// 🎮 CodinGame Puzzle - google-interview---the-two-egg-problem
// https://www.codingame.com/training/hard/google-interview---the-two-egg-problem

fun main() {
    val n = readLine()!!.trim().toLong()
    var k = 0L
    while (k * (k + 1) / 2 < n) k++
    println(k)
}
