// 🎮 CodinGame Puzzle - retaining-water
// https://www.codingame.com/training/easy/retaining-water

const N = parseInt(readline())
const grid: number[][] = []
for (let i = 0; i < N; i++) {
  const line = readline()
  grid.push(line.split("").map(c => c.charCodeAt(0) - 64)) // A=1, Z=26
}

// Classic 2D trapping water problem using BFS with min-heap
// Start from all border cells, expand inward tracking the minimum "wall height" seen

// Simple min-heap implementation
class MinHeap {
  private data: [number, number, number][] = [] // [height, row, col]
  push(item: [number, number, number]) {
    this.data.push(item)
    this._bubbleUp(this.data.length - 1)
  }
  pop(): [number, number, number] {
    const top = this.data[0]
    const last = this.data.pop()!
    if (this.data.length > 0) {
      this.data[0] = last
      this._sinkDown(0)
    }
    return top
  }
  get size() {
    return this.data.length
  }
  private _bubbleUp(i: number) {
    while (i > 0) {
      const parent = (i - 1) >> 1
      if (this.data[parent][0] <= this.data[i][0]) break
      ;[this.data[parent], this.data[i]] = [this.data[i], this.data[parent]]
      i = parent
    }
  }
  private _sinkDown(i: number) {
    const n = this.data.length
    while (true) {
      let smallest = i
      const l = 2 * i + 1,
        r = 2 * i + 2
      if (l < n && this.data[l][0] < this.data[smallest][0]) smallest = l
      if (r < n && this.data[r][0] < this.data[smallest][0]) smallest = r
      if (smallest === i) break
      ;[this.data[smallest], this.data[i]] = [this.data[i], this.data[smallest]]
      i = smallest
    }
  }
}

const visited = Array.from({ length: N }, () => new Array(N).fill(false))
const heap = new MinHeap()

// Push all border cells
for (let r = 0; r < N; r++) {
  for (let c = 0; c < N; c++) {
    if (r === 0 || r === N - 1 || c === 0 || c === N - 1) {
      heap.push([grid[r][c], r, c])
      visited[r][c] = true
    }
  }
}

const dirs = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
]
let volume = 0

while (heap.size > 0) {
  const [level, r, c] = heap.pop()
  for (const [dr, dc] of dirs) {
    const nr = r + dr
    const nc = c + dc
    if (nr < 0 || nr >= N || nc < 0 || nc >= N || visited[nr][nc]) continue
    visited[nr][nc] = true
    const cellHeight = grid[nr][nc]
    const waterLevel = Math.max(level, cellHeight)
    volume += waterLevel - cellHeight
    heap.push([waterLevel, nr, nc])
  }
}

console.log(volume)
