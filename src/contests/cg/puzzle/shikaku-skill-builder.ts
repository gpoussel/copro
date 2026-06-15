// 🎮 CodinGame Puzzle - shikaku-skill-builder
// https://www.codingame.com/

const [w, h] = readline()
  .split(" ")
  .map((x: string) => parseInt(x, 10))

const grid: number[][] = []
for (let i = 0; i < h; i++) {
  grid.push(
    readline()
      .split(" ")
      .map((x: string) => parseInt(x, 10))
  )
}

const out: string[] = []

for (let r = 0; r < h; r++) {
  for (let c = 0; c < w; c++) {
    const n = grid[r][c]
    if (n <= 0) {
      continue
    }
    const rects: [number, number, number, number][] = []
    for (let width = 1; width <= n; width++) {
      if (n % width !== 0) {
        continue
      }
      const height = n / width
      for (let r0 = Math.max(0, r - height + 1); r0 <= r && r0 + height <= h; r0++) {
        for (let c0 = Math.max(0, c - width + 1); c0 <= c && c0 + width <= w; c0++) {
          let ok = true
          for (let rr = r0; rr < r0 + height && ok; rr++) {
            for (let cc = c0; cc < c0 + width; cc++) {
              if (grid[rr][cc] > 0 && !(rr === r && cc === c)) {
                ok = false
                break
              }
            }
          }
          if (ok) {
            rects.push([r0, c0, width, height])
          }
        }
      }
    }
    if (rects.length === 0) {
      continue
    }
    rects.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2])
    out.push(`${r} ${c} ${n}`)
    for (const rect of rects) {
      out.push(`${rect[0]} ${rect[1]} ${rect[2]} ${rect[3]}`)
    }
  }
}

console.log(out.join("\n"))
