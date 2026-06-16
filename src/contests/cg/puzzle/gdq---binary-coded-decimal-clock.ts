// 🎮 CodinGame Puzzle - gdq---binary-coded-decimal-clock
// https://www.codingame.com/training/easy/gdq---binary-coded-decimal-clock

const input: string = readline()
const digits: number[] = input
  .split(":")
  .join("")
  .split("")
  .map((c: string): number => Number(c))
  .slice(1)

const bits: number[] = [8, 4, 2, 1]
for (const bit of bits) {
  let line: string = "|"
  for (const digit of digits) {
    line += (digit & bit ? "#####" : "_____") + "|"
  }
  console.log(line)
}
