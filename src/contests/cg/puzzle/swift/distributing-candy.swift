// 🎮 CodinGame Puzzle - distributing-candy
// https://www.codingame.com/training/easy/distributing-candy

let first = readLine()!.split(separator: " ").map { Int($0)! }
let n = first[0], m = first[1]
var candies = readLine()!.split(separator: " ").map { Int($0)! }
candies.sort()
var best = Int.max
var i = 0
while i + m - 1 < n {
    let diff = candies[i + m - 1] - candies[i]
    if diff < best {
        best = diff
    }
    i += 1
}
print(best)
