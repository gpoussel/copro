// 🎮 CodinGame Puzzle - merlins-magic-square
// https://www.codingame.com/

const effects: { [key: string]: number[] } = {
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

const state: boolean[] = []
for (let r = 0; r < 3; r++) {
  const cells: string[] = readline().split(" ")
  for (const c of cells) {
    state.push(c === "*")
  }
}

const presses: string = readline()

const apply = (grid: boolean[], button: string): void => {
  for (const i of effects[button]) {
    grid[i] = !grid[i]
  }
}

for (const button of presses) {
  apply(state, button)
}

const target: boolean[] = [true, true, true, true, false, true, true, true, true]

for (let b = 1; b <= 9; b++) {
  const test: boolean[] = state.slice()
  apply(test, String(b))
  if (test.every((v, i) => v === target[i])) {
    console.log(b)
    break
  }
}
