// 🎮 CodinGame Puzzle - 1d-bush-fire
// https://www.codingame.com/training/easy/1d-bush-fire

fun main() {
    val n = readLine()!!.trim().toInt()
    repeat(n) {
        val strip = readLine()!!.trimEnd()
        var drops = 0
        var j = 0
        while (j < strip.length) {
            if (strip[j] == 'f') {
                // Drop at j covers j, j+1, j+2 — skip past all 3.
                drops++
                j += 3
            } else {
                j++
            }
        }
        println(drops)
    }
}
