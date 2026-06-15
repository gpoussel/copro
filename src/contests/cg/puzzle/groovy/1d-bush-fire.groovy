// 🎮 CodinGame Puzzle - 1d-bush-fire
// https://www.codingame.com/training/easy/1d-bush-fire

def br = new BufferedReader(new InputStreamReader(System.in))
int n = br.readLine().trim() as int
n.times {
    String strip = br.readLine()
    int drops = 0, j = 0
    while (j < strip.length()) {
        if (strip[j] == 'f') {
            // Drop at j covers j, j+1, j+2 — skip past all 3.
            drops++
            j += 3
        } else {
            j++
        }
    }
    println drops
}
