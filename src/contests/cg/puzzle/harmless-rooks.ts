// 🎮 CodinGame Puzzle - harmless-rooks
// https://www.codingame.com/training/hard/harmless-rooks

// Each free cell links its horizontal segment to its vertical segment; two
// rooks conflict iff they share a segment, so the answer is a maximum
// bipartite matching between row segments and column segments (Hopcroft-Karp).
const N = Number(readline())
const board: string[] = []
for (let i = 0; i < N; i++) board.push(readline())

const rowSeg: number[][] = board.map(() => new Array<number>(N).fill(-1))
const colSeg: number[][] = board.map(() => new Array<number>(N).fill(-1))
let nRow = 0
let nCol = 0
for (let r = 0; r < N; r++)
  for (let c = 0; c < N; c++)
    if (board[r][c] === ".") rowSeg[r][c] = c > 0 && board[r][c - 1] === "." ? rowSeg[r][c - 1] : nRow++
for (let c = 0; c < N; c++)
  for (let r = 0; r < N; r++)
    if (board[r][c] === ".") colSeg[r][c] = r > 0 && board[r - 1][c] === "." ? colSeg[r - 1][c] : nCol++

const adj: number[][] = Array.from({ length: nRow }, () => [])
for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (board[r][c] === ".") adj[rowSeg[r][c]].push(colSeg[r][c])

const matchL = new Int32Array(nRow).fill(-1)
const matchR = new Int32Array(nCol).fill(-1)
const dist = new Int32Array(nRow)

// BFS layering from free left vertices; true if an augmenting path exists
const bfs = (): boolean => {
  const queue: number[] = []
  let found = false
  for (let u = 0; u < nRow; u++) {
    if (matchL[u] < 0) {
      dist[u] = 0
      queue.push(u)
    } else dist[u] = -1
  }
  for (let h = 0; h < queue.length; h++) {
    const u = queue[h]
    for (const v of adj[u]) {
      const w = matchR[v]
      if (w < 0) found = true
      else if (dist[w] < 0) {
        dist[w] = dist[u] + 1
        queue.push(w)
      }
    }
  }
  return found
}
const dfs = (u: number): boolean => {
  for (const v of adj[u]) {
    const w = matchR[v]
    if (w < 0 || (dist[w] === dist[u] + 1 && dfs(w))) {
      matchL[u] = v
      matchR[v] = u
      return true
    }
  }
  dist[u] = -1
  return false
}

let matching = 0
while (bfs()) for (let u = 0; u < nRow; u++) if (matchL[u] < 0 && dfs(u)) matching++
console.log(String(matching))
