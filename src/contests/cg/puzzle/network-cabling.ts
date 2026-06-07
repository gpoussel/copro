// 🎮 CodinGame Puzzle - network-cabling
// https://www.codingame.com/training/medium/network-cabling

const n: number = parseInt(readline())
const xs: number[] = []
const ys: number[] = []

for (let i = 0; i < n; i++) {
  const parts: string[] = readline().split(" ")
  xs.push(parseInt(parts[0]))
  ys.push(parseInt(parts[1]))
}

// Horizontal span: main cable runs from min_x to max_x
const minX: number = Math.min(...xs)
const maxX: number = Math.max(...xs)
const horizontalCable: bigint = BigInt(maxX - minX)

// Optimal main cable row = median of y-coordinates
ys.sort((a: number, b: number) => a - b)
const median: number = ys[Math.floor(n / 2)]

// Sum of vertical distances from each building to the median row
let verticalCable: bigint = 0n
for (let i = 0; i < n; i++) {
  verticalCable += BigInt(Math.abs(ys[i] - median))
}

console.log(String(horizontalCable + verticalCable))
