// 🎮 CodinGame Puzzle - max-area
// https://www.codingame.com/training/easy/max-area

_ = readLine()
let a = readLine()!.split(separator: " ").map { Int($0)! }
var left = 0
var right = a.count - 1
var best = 0
while left < right {
    let h = min(a[left], a[right])
    let area = h * (right - left)
    if area > best {
        best = area
    }
    if a[left] < a[right] {
        left += 1
    } else {
        right -= 1
    }
}
print(best)
