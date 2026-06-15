// 🎮 CodinGame Puzzle - rubik
// https://www.codingame.com/training/medium/rubik

let n = Int(readLine()!)!
// Visible mini-cubes = all cubes minus the hidden inner cube of side n-2.
let inner = n >= 2 ? n - 2 : 0
print(n * n * n - inner * inner * inner)
