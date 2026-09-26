// 🎮 CodinGame Puzzle - fishing-with-a-stick
// https://www.codingame.com/training/medium/fishing-with-a-stick

const h = parseInt(readline())
const w = parseInt(readline())
const current = readline().trim() === "RIGHT" ? 1 : -1
const rows: string[] = []
for (let i = 0; i < h; i++) rows.push(readline())

// Locate the rod: a column of '|' ended by a hook 'C' just below, or the first 'C' of row 0
let rodX = -1
let hookY = -1
for (let y = 0; y < h && rodX < 0; y++) {
  const x = rows[y].indexOf("|")
  if (x >= 0) rodX = x
}
if (rodX >= 0) {
  let y = 0
  while (y < h && rows[y][rodX] !== "|") y++
  while (y < h && rows[y][rodX] === "|") y++
  hookY = y // the hook sits just below the last rod segment
} else {
  rodX = rows[0].indexOf("C")
  hookY = 0
}

interface Item {
  pos: number
  dir: number
  fish: boolean
}

// Items only move horizontally, and the rod splits each row in two independent halves.
// Collect the times at which fish and garbage reach the rod.
const catchTimes: number[] = []
let breakTime = Infinity
const simulate = (items: Item[], lo: number, hi: number) => {
  // Items live in [lo, hi]; reaching rodX means touching the rod
  items.sort((a, b) => a.pos - b.pos)
  for (let t = 1; items.length > 0; t++) {
    // Opposite-moving neighbours meet (same cell or swapping cells) and vanish
    const dead: boolean[] = items.map(() => false)
    for (let i = 0; i + 1 < items.length; i++) {
      const a = items[i]
      const b = items[i + 1]
      if (!dead[i] && a.dir > 0 && b.dir < 0 && b.pos - a.pos <= 2) dead[i] = dead[i + 1] = true
    }
    const next: Item[] = []
    items.forEach((item, i) => {
      if (dead[i]) return
      item.pos += item.dir
      if (item.pos === rodX) {
        if (item.fish) catchTimes.push(t)
        else breakTime = Math.min(breakTime, t)
      } else if (item.pos >= lo && item.pos <= hi) next.push(item)
    })
    items = next
  }
}

for (let y = 0; y <= Math.min(hookY, h - 1); y++) {
  const left: Item[] = []
  const right: Item[] = []
  for (let x = 0; x < w; x++) {
    const ch = rows[y][x] || "."
    if (x === rodX || ch === ".") continue
    const item: Item =
      ch === ">" ? { pos: x, dir: 1, fish: true } : ch === "<" ? { pos: x, dir: -1, fish: true } : { pos: x, dir: current, fish: false }
    ;(x < rodX ? left : right).push(item)
  }
  simulate(left, 0, rodX - 1)
  simulate(right, rodX + 1, w - 1)
}

// Fish reaching the rod at the same time as garbage are still caught
console.log(catchTimes.filter(t => t <= breakTime).length)
