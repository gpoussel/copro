// 🎮 CodinGame Puzzle - the-descent
// https://www.codingame.com/training/easy/the-descent

// Game loop: each turn, read 8 mountain heights and fire on the tallest one.
def br = new BufferedReader(new InputStreamReader(System.in))
while (true) {
    int maxHeight = -1, maxIndex = 0
    for (int i = 0; i < 8; i++) {
        int h = br.readLine().trim() as int
        if (h > maxHeight) {
            maxHeight = h
            maxIndex = i
        }
    }
    println maxIndex
}
