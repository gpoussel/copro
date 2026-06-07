// 🎮 CodinGame Puzzle - 1d-bush-fire
// https://www.codingame.com/training/easy/1d-bush-fire

const n = parseInt(readline())
for (let i = 0; i < n; i++) {
  const strip = readline()
  let drops = 0
  let j = 0
  while (j < strip.length) {
    if (strip[j] === "f") {
      // Place water drop centered to cover as far right as possible:
      // drop at j covers j, j+1, j+2 — skip past all 3
      drops++
      j += 3
    } else {
      j++
    }
  }
  console.log(drops)
}
