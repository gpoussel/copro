// 🎮 CodinGame Puzzle - google-interview---the-two-egg-problem
// https://www.codingame.com/training/hard/google-interview---the-two-egg-problem

let n = Int(readLine()!)!
var k = 0
while k * (k + 1) / 2 < n {
    k += 1
}
print(k)
