// 🎮 CodinGame Puzzle - telephone-numbers
// https://www.codingame.com/training/medium/telephone-numbers

fun main() {
    val n = readLine()!!.trim().toInt()
    val root = HashMap<Char, Any>()
    var cable = 0
    repeat(n) {
        val number = readLine()!!.trim()
        var node = root
        for (d in number) {
            if (!node.containsKey(d)) {
                node[d] = HashMap<Char, Any>()
                cable++
            }
            @Suppress("UNCHECKED_CAST")
            node = node[d] as HashMap<Char, Any>
        }
    }
    println(cable)
}
