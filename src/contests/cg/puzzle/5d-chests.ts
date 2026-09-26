// 🎮 CodinGame Puzzle - 5d-chests
// https://www.codingame.com/training/medium/5d-chests

const N = parseInt(readline())
const C = parseInt(readline())

// Primality of 1 + (product mod C), i.e. values up to C
const composite = new Uint8Array(C + 1)
composite[0] = composite[1] = 1
for (let i = 2; i * i <= C; i++) {
  if (composite[i]) continue
  for (let j = i * i; j <= C; j += i) composite[j] = 1
}

// Cell index = sum of (coord - 1) * N^dim, dimension 0 being x
const total = N ** 5
const strides = [1, N, N ** 2, N ** 3, N ** 4]
const gold = new Uint8Array(total)
let chests = 0
for (let idx = 0; idx < total; idx++) {
  let product = 1
  let rest = idx
  for (let d = 0; d < 5; d++) {
    product *= (rest % N) + 1
    rest = Math.floor(rest / N)
  }
  if (!composite[1 + (product % C)]) {
    gold[idx] = 1
    chests++
  }
}

// Flood fill each room of connected chests
const visited = new Uint8Array(total)
const queue = new Int32Array(total)
let rooms = 0
let largest = 0
for (let start = 0; start < total; start++) {
  if (!gold[start] || visited[start]) continue
  visited[start] = 1
  let head = 0
  let tail = 0
  queue[tail++] = start
  while (head < tail) {
    const cell = queue[head++]
    for (let d = 0; d < 5; d++) {
      const coord = Math.floor(cell / strides[d]) % N
      if (coord > 0) {
        const n = cell - strides[d]
        if (gold[n] && !visited[n]) {
          visited[n] = 1
          queue[tail++] = n
        }
      }
      if (coord < N - 1) {
        const n = cell + strides[d]
        if (gold[n] && !visited[n]) {
          visited[n] = 1
          queue[tail++] = n
        }
      }
    }
  }
  rooms++
  largest = Math.max(largest, tail)
}

console.log(chests)
console.log(rooms)
console.log(largest)
