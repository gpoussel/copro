// 🎮 CodinGame Puzzle - the-sovereigns-game
// https://www.codingame.com/training/medium/the-sovereigns-game

const k = parseInt(readline())
const n = parseInt(readline())
const value: number[] = []
const rate: number[] = []
for (let i = 0; i < n; i++) {
  const [v, r] = readline().split(" ").map(Number)
  value.push(v)
  rate.push(r)
}

// Max-heap of available pile indices: most points first, then highest rate
const heap: number[] = []
const better = (a: number, b: number): boolean =>
  value[a] > value[b] || (value[a] === value[b] && rate[a] > rate[b])
function push(i: number): void {
  heap.push(i)
  let c = heap.length - 1
  while (c > 0) {
    const p = (c - 1) >> 1
    if (!better(heap[c], heap[p])) break
    ;[heap[c], heap[p]] = [heap[p], heap[c]]
    c = p
  }
}
function pop(): number {
  const top = heap[0]
  const last = heap.pop()!
  if (heap.length > 0) {
    heap[0] = last
    let p = 0
    while (true) {
      const l = 2 * p + 1
      const r = l + 1
      let m = p
      if (l < heap.length && better(heap[l], heap[m])) m = l
      if (r < heap.length && better(heap[r], heap[m])) m = r
      if (m === p) break
      ;[heap[m], heap[p]] = [heap[p], heap[m]]
      p = m
    }
  }
  return top
}

for (let i = 0; i < n; i++) push(i)

// A pile collected on turn t becomes available again on turn t + 4
const cooling: [number, number][] = []
let head = 0
let total = 0
for (let turn = 0; turn < k; turn++) {
  while (head < cooling.length && cooling[head][1] <= turn) push(cooling[head++][0])
  if (heap.length === 0) continue
  const pile = pop()
  total += value[pile]
  value[pile] = Math.floor((value[pile] * rate[pile]) / 100)
  cooling.push([pile, turn + 4])
}

console.log(total)
