// 🎮 CodinGame Puzzle - teds-compiler
// https://www.codingame.com/training/easy/teds-compiler

const line = readline()
let depth = 0
let best = 0
for (let i = 0; i < line.length; i++) {
  if (line[i] === "<") depth++
  else depth--
  if (depth < 0) break
  if (depth === 0) best = i + 1
}
console.log(best)
