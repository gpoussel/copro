// 🎮 CodinGame Puzzle - criminal
// https://www.codingame.com/training/medium/criminal

const h = parseInt(readline())
const w = parseInt(readline())
const area: string[] = []
for (let i = 0; i < h; i++) area.push(readline())

const FORWARD: { [c: string]: [number, number] } = { "^": [-1, 0], v: [1, 0], "<": [0, -1], ">": [0, 1] }
const maxDepth = Math.max(h, w)

// Cells are addressed by (depth, offset) relative to the person: depth along the gaze,
// offset sideways. The cone at depth d spans offsets -d..d.
const hidden = (obstacles: [number, number][], d: number, o: number): boolean =>
  obstacles.some(([d0, o0]) => {
    if (d0 >= d) return false
    const k = d - d0
    if (o0 === 0) return o === 0
    return o0 > 0 ? o >= o0 && o <= o0 + k : o <= o0 && o >= o0 - k
  })

const sees = (pr: number, pc: number, [fr, fc]: [number, number]): boolean => {
  const [lr, lc] = [fc, fr]
  const obstacles: [number, number][] = []
  for (let d = 1; d <= maxDepth; d++) {
    for (let o = -d; o <= d; o++) {
      const r = pr + d * fr + o * lr
      const c = pc + d * fc + o * lc
      if (r < 0 || r >= h || c < 0 || c >= w) continue
      const cell = area[r][c]
      if (cell === ".") continue
      if (cell === "Y") {
        if (!hidden(obstacles, d, o)) return true
      } else obstacles.push([d, o])
    }
  }
  return false
}

let watchers = 0
for (let r = 0; r < h; r++) {
  for (let c = 0; c < w; c++) {
    const forward = FORWARD[area[r][c]]
    if (forward && sees(r, c, forward)) watchers++
  }
}
console.log(watchers)
