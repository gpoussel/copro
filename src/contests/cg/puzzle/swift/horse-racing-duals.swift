// 🎮 CodinGame Puzzle - horse-racing-duals
// https://www.codingame.com/training/easy/horse-racing-duals

let n = Int(readLine()!)!
var s = [Int]()
for _ in 0..<n {
    s.append(Int(readLine()!)!)
}
s.sort()
var minDiff = Int.max
for i in 1..<n {
    let diff = s[i] - s[i - 1]
    if diff < minDiff {
        minDiff = diff
    }
}
print(minDiff)
