// 🎮 CodinGame Puzzle - mirrors
// https://www.codingame.com/training/easy/mirrors

import Foundation

_ = readLine()
let r = readLine()!.split(separator: " ").map { Double($0)! }
var reflected = 0.0
for i in stride(from: r.count - 1, through: 0, by: -1) {
    let ri = r[i]
    let denom = 1 - ri * reflected
    reflected = ri + (denom == 0 ? 0 : ((1 - ri) * (1 - ri) * reflected) / denom)
}
print(String(format: "%.4f", reflected))
