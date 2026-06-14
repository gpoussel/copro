// 🎮 CodinGame Puzzle - surface
// https://www.codingame.com/training/hard/surface

const L = parseInt(readline())
const H = parseInt(readline())
const grid: string[] = []
for (let y = 0; y < H; y++) grid.push(readline())

// comp[idx]: -2 = land, -1 = water not yet labeled, >=0 = lake component id.
// sizes[id] holds each lake's area. Lakes are flood-filled lazily on first
// query and cached so repeated coordinates in the same lake are O(1).
const comp = new Int32Array(L * H).fill(-2)
for (let y = 0; y < H; y++) {
  const row = grid[y]
  for (let x = 0; x < L; x++) {
    if (row.charCodeAt(x) === 79) comp[y * L + x] = -1 // 'O'
  }
}

const sizes: number[] = []
const stack = new Int32Array(L * H)

// Iterative flood-fill (4-connectivity) to avoid stack overflow on large lakes.
function labelFrom(start: number): number {
  const id = sizes.length
  let sp = 0
  stack[sp++] = start
  comp[start] = id
  let count = 0
  while (sp > 0) {
    const cur = stack[--sp]
    count++
    const cx = cur % L
    const cy = (cur - cx) / L
    if (cy > 0) {
      const n = cur - L
      if (comp[n] === -1) {
        comp[n] = id
        stack[sp++] = n
      }
    }
    if (cy < H - 1) {
      const n = cur + L
      if (comp[n] === -1) {
        comp[n] = id
        stack[sp++] = n
      }
    }
    if (cx > 0) {
      const n = cur - 1
      if (comp[n] === -1) {
        comp[n] = id
        stack[sp++] = n
      }
    }
    if (cx < L - 1) {
      const n = cur + 1
      if (comp[n] === -1) {
        comp[n] = id
        stack[sp++] = n
      }
    }
  }
  sizes.push(count)
  return count
}

const N = parseInt(readline())
const out: string[] = []
for (let i = 0; i < N; i++) {
  const parts = readline().split(" ").map(Number)
  const x = parts[0]
  const y = parts[1]
  const idx = y * L + x
  const c = comp[idx]
  if (c === -2) {
    out.push("0")
  } else if (c === -1) {
    out.push(String(labelFrom(idx)))
  } else {
    out.push(String(sizes[c]))
  }
}
console.log(out.join("\n"))
