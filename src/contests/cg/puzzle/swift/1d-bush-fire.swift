// 🎮 CodinGame Puzzle - 1d-bush-fire
// https://www.codingame.com/training/easy/1d-bush-fire

let n = Int(readLine()!)!
for _ in 0..<n {
    let strip = Array(readLine()!)
    var drops = 0
    var j = 0
    while j < strip.count {
        if strip[j] == "f" {
            // Drop at j covers j, j+1, j+2 — skip past all 3.
            drops += 1
            j += 3
        } else {
            j += 1
        }
    }
    print(drops)
}
