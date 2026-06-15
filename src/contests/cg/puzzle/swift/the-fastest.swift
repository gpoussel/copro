// 🎮 CodinGame Puzzle - the-fastest
// https://www.codingame.com/training/medium/the-fastest

// Times are HH:MM:SS so lexicographic comparison equals chronological comparison.
let n = Int(readLine()!)!
var best = ""
for _ in 0..<n {
    let t = readLine()!
    if best.isEmpty || t < best {
        best = t
    }
}
print(best)
