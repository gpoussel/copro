// 🎮 CodinGame Puzzle - addem-up
// https://www.codingame.com/training/easy/addem-up

const n = parseInt(readline())
const cards = readline().split(" ").map(Number)

// Use a min-heap to always merge the two smallest cards first (Huffman-style)
// This minimizes the total cost.

class MinHeap {
  private heap: number[] = []

  push(val: number) {
    this.heap.push(val)
    this._bubbleUp(this.heap.length - 1)
  }

  pop(): number {
    const top = this.heap[0]
    const last = this.heap.pop()!
    if (this.heap.length > 0) {
      this.heap[0] = last
      this._sinkDown(0)
    }
    return top
  }

  get size() {
    return this.heap.length
  }

  private _bubbleUp(i: number) {
    while (i > 0) {
      const parent = (i - 1) >> 1
      if (this.heap[parent] <= this.heap[i]) break
      ;[this.heap[parent], this.heap[i]] = [this.heap[i], this.heap[parent]]
      i = parent
    }
  }

  private _sinkDown(i: number) {
    const n = this.heap.length
    while (true) {
      let smallest = i
      const l = 2 * i + 1
      const r = 2 * i + 2
      if (l < n && this.heap[l] < this.heap[smallest]) smallest = l
      if (r < n && this.heap[r] < this.heap[smallest]) smallest = r
      if (smallest === i) break
      ;[this.heap[smallest], this.heap[i]] = [this.heap[i], this.heap[smallest]]
      i = smallest
    }
  }
}

const heap = new MinHeap()
for (const c of cards) heap.push(c)

let totalCost = 0
while (heap.size > 1) {
  const a = heap.pop()
  const b = heap.pop()
  const merged = a + b
  totalCost += merged
  heap.push(merged)
}

console.log(totalCost)
