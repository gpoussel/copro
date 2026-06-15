// 🎮 CodinGame Puzzle - gdq---binary-coded-decimal-clock
// https://www.codingame.com/training/easy/gdq---binary-coded-decimal-clock

const input = readline().split(":").join("")
// Drop the leading hour digit (HH <= 09, so it is always 0): keep H M M S S f.
const digits = input
  .slice(1)
  .split("")
  .map(c => parseInt(c, 10))
const bits = [8, 4, 2, 1]
for (let r = 0; r < 4; r++) {
  let line = "|"
  for (const d of digits) {
    line += (d & bits[r] ? "#####" : "_____") + "|"
  }
  console.log(line)
}
