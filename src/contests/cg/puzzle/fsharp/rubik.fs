// 🎮 CodinGame Puzzle - rubik
// https://www.codingame.com/training/medium/rubik

let n = int64 (System.Console.ReadLine().Trim())
// Visible mini-cubes = all cubes minus the hidden inner cube of side n-2.
let inner = if n >= 2L then n - 2L else 0L
printfn "%d" (n * n * n - inner * inner * inner)
