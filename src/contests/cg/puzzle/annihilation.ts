// 🎮 CodinGame Puzzle - annihilation
// https://www.codingame.com/

const [H, W] = readline().split(" ").map(Number)

interface Arrow {
  r: number
  c: number
  dir: string
}

let arrows: Arrow[] = []
for (let r = 0; r < H; r++) {
  const line = readline()
  for (let c = 0; c < W; c++) {
    const ch = line[c]
    if (ch === "^" || ch === "v" || ch === "<" || ch === ">") {
      arrows.push({ r, c, dir: ch })
    }
  }
}

let steps = 0
while (arrows.length > 0) {
  steps++
  for (const a of arrows) {
    if (a.dir === "^") a.r = (a.r - 1 + H) % H
    else if (a.dir === "v") a.r = (a.r + 1) % H
    else if (a.dir === "<") a.c = (a.c - 1 + W) % W
    else a.c = (a.c + 1) % W
  }
  const counts = new Map<number, number>()
  for (const a of arrows) {
    const key = a.r * W + a.c
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  arrows = arrows.filter(a => counts.get(a.r * W + a.c) === 1)
}

console.log(steps)
