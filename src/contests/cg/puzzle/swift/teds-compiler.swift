// 🎮 CodinGame Puzzle - teds-compiler
// https://www.codingame.com/training/easy/teds-compiler

let line = Array(readLine()!)
var balance = 0
var best = 0
for i in 0..<line.count {
    if line[i] == "<" {
        balance += 1
    } else {
        balance -= 1
    }
    if balance < 0 {
        break
    }
    if balance == 0 {
        best = i + 1
    }
}
print(best)
