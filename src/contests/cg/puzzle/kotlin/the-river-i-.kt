// 🎮 CodinGame Puzzle - the-river-i-
// https://www.codingame.com/training/easy/the-river-i-

fun digitSum(x0: Long): Long {
    var x = x0
    var s = 0L
    while (x > 0) {
        s += x % 10
        x /= 10
    }
    return s
}

fun main() {
    var a = readLine()!!.trim().toLong()
    var b = readLine()!!.trim().toLong()
    while (a != b) {
        if (a < b) a += digitSum(a) else b += digitSum(b)
    }
    println(a)
}
