// 🎮 CodinGame Puzzle - merlins-magic-square
// https://www.codingame.com/training/easy/merlins-magic-square

const r1 = readline().replace(/ /g, "")
const r2 = readline().replace(/ /g, "")
const r3 = readline().replace(/ /g, "")
const presses = readline().trim()

const state: boolean[] = []
for (const ch of r1 + r2 + r3) state.push(ch === "*")

const effects: { [btn: string]: number[] } = {
  "1": [0, 1, 3, 4],
  "2": [0, 1, 2],
  "3": [1, 2, 4, 5],
  "4": [0, 3, 6],
  "5": [1, 3, 4, 5, 7],
  "6": [2, 5, 8],
  "7": [3, 4, 6, 7],
  "8": [6, 7, 8],
  "9": [4, 5, 7, 8],
}

function press(s: boolean[], btn: string): void {
  for (const i of effects[btn]) s[i] = !s[i]
}

for (const ch of presses) press(state, ch)

const solved = [true, true, true, true, false, true, true, true, true]

function isSolved(s: boolean[]): boolean {
  for (let i = 0; i < 9; i++) if (s[i] !== solved[i]) return false
  return true
}

let answer = ""
for (let b = 1; b <= 9; b++) {
  const copy = state.slice()
  press(copy, String(b))
  if (isSolved(copy)) {
    answer = String(b)
    break
  }
}

console.log(answer)
