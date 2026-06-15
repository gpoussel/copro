// 🎮 CodinGame Puzzle - gauss-and-the-stolen-numbers
// https://www.codingame.com/

const n = BigInt(readline())
const s = BigInt(readline())
const q = BigInt(readline())

const totalSum = (n * (n + 1n)) / 2n
const totalSq = (n * (n + 1n) * (2n * n + 1n)) / 6n

const p = totalSum - s
const r = totalSq - q

const prod = (p * p - r) / 2n
const disc = p * p - 4n * prod

function isqrt(value: bigint): bigint {
  if (value < 0n) return 0n
  if (value < 2n) return value
  let x = value
  let y = (x + 1n) / 2n
  while (y < x) {
    x = y
    y = (x + value / x) / 2n
  }
  return x
}

const root = isqrt(disc)
const a = (p - root) / 2n
const b = (p + root) / 2n

console.log(`${a} ${b}`)
