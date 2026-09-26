// 🎮 CodinGame Puzzle - count-as-i-count-2
// https://www.codingame.com/training/medium/count-as-i-count-2

// Results exceed 2^53: keep counts as little-endian base-1e9 limbs
const BASE = 1e9
type Big = number[]

function addScaled(target: Big, value: Big, factor: number): void {
  let carry = 0
  for (let i = 0; i < Math.max(target.length, value.length) || carry > 0; i++) {
    const sum = (target[i] || 0) + (value[i] || 0) * factor + carry
    target[i] = sum % BASE
    carry = Math.floor(sum / BASE)
  }
}

function toString(value: Big): string {
  let text = String(value[value.length - 1])
  for (let i = value.length - 2; i >= 0; i--) text += ("000000000" + value[i]).slice(-9)
  return text
}

const TARGET = 50
const start = parseInt(readline())
const remaining = TARGET - start

// A throw worth 1 can only be pin 1; a throw worth 2..12 is either that single pin or that many pins
const ways: Big[] = [[1]]
for (let s = 1; s <= remaining; s++) {
  const total: Big = [0]
  for (let v = 1; v <= Math.min(12, s); v++) addScaled(total, ways[s - v], v === 1 ? 1 : 2)
  ways.push(total)
}
console.log(toString(ways[remaining]))
