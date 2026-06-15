// 🎮 CodinGame Puzzle - the-descent
// https://www.codingame.com/training/easy/the-descent

import Glibc

// Game loop: each turn, read 8 mountain heights and fire on the tallest one.
while true {
    var maxHeight = -1
    var maxIndex = 0
    for i in 0..<8 {
        let h = Int(readLine()!)!
        if h > maxHeight {
            maxHeight = h
            maxIndex = i
        }
    }
    print(maxIndex)
    fflush(stdout)
}
