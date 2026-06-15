// 🎮 CodinGame Puzzle - fibonaccis-rabbit
// https://www.codingame.com/training/easy/fibonaccis-rabbit

fun main() {
    val (f0, n) = readLine()!!.trim().split(" ").map { it.toInt() }
    val (a, b) = readLine()!!.trim().split(" ").map { it.toInt() }
    // FN can exceed 2^63 (but is < 2^64), so accumulate in ULong.
    val f = ULongArray(n + 1)
    f[0] = f0.toULong()
    for (i in 1..n) {
        var total = 0UL
        for (k in a..b) {
            if (i - k >= 0) total += f[i - k]
        }
        f[i] = total
    }
    println(f[n])
}
