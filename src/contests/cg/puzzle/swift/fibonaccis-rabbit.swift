// 🎮 CodinGame Puzzle - fibonaccis-rabbit
// https://www.codingame.com/training/easy/fibonaccis-rabbit

let l1 = readLine()!.split(separator: " ").map { Int($0)! }
let f0 = l1[0], n = l1[1]
let l2 = readLine()!.split(separator: " ").map { Int($0)! }
let a = l2[0], b = l2[1]
// FN can exceed 2^63 (but is < 2^64), so accumulate in UInt64.
var f = [UInt64](repeating: 0, count: n + 1)
f[0] = UInt64(f0)
for i in stride(from: 1, through: n, by: 1) {
    var total: UInt64 = 0
    for k in a...b {
        if i - k >= 0 {
            total += f[i - k]
        }
    }
    f[i] = total
}
print(f[n])
