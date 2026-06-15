// 🎮 CodinGame Puzzle - euclids-algorithm
// https://www.codingame.com/training/easy/euclids-algorithm

let parts = readLine()!.split(separator: " ").map { Int($0)! }
let a = parts[0], b = parts[1]
var x = a, y = b
while y != 0 {
    let q = x / y, r = x % y
    print("\(x)=\(y)*\(q)+\(r)")
    x = y
    y = r
}
print("GCD(\(a),\(b))=\(x)")
