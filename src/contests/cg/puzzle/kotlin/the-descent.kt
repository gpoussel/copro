// 🎮 CodinGame Puzzle - the-descent
// https://www.codingame.com/training/easy/the-descent

fun main() {
    // Game loop: each turn, read 8 mountain heights and fire on the tallest one.
    while (true) {
        var maxHeight = -1
        var maxIndex = 0
        for (i in 0 until 8) {
            val h = readLine()!!.trim().toInt()
            if (h > maxHeight) {
                maxHeight = h
                maxIndex = i
            }
        }
        println(maxIndex)
    }
}
