// 🎮 CodinGame Puzzle - highest-truncated-pyramid
// https://www.codingame.com/training/medium/highest-truncated-pyramid

const bricks = parseInt(readline())

// Height h with top floor t uses h*t + h(h-1)/2 bricks: find the largest h with an integer t >= 1
let height = 1
let top = bricks
for (let h = 1; (h * (h + 1)) / 2 <= bricks; h++) {
  const rest = bricks - (h * (h - 1)) / 2
  if (rest % h === 0) {
    height = h
    top = rest / h
  }
}
const floors: string[] = []
for (let i = 0; i < height; i++) floors.push(new Array(top + i + 1).join("*"))
console.log(floors.join("\n"))
