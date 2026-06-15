// 🎮 CodinGame Puzzle - buzzle
// https://www.codingame.com/training/easy/buzzle

const [n, a, b] = readline()
  .split(/\s+/)
  .map(s => parseInt(s, 10))
const k = parseInt(readline(), 10)
const nums = readline()
  .split(/\s+/)
  .map(s => parseInt(s, 10))
  .slice(0, k)

function digitSum(x: number, base: number): number {
  let s = 0
  while (x > 0) {
    s += x % base
    x = Math.floor(x / base)
  }
  return s
}

function isBuzzle(x: number): boolean {
  for (const num of nums) {
    if (x % num === 0) return true // multiple rule (decimal, base-independent)
    if (x % n === num) return true // last digit in base n
  }
  const s = digitSum(x, n)
  if (s !== x && isBuzzle(s)) return true // digit sum is itself a Buzzle
  return false
}

const out: string[] = []
for (let i = a; i <= b; i++) {
  out.push(isBuzzle(i) ? "Buzzle" : String(i))
}
console.log(out.join("\n"))
