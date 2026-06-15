// 🎮 CodinGame Puzzle - buzzle
// https://www.codingame.com/

const [n, a, b] = readline().split(" ").map(Number)
const k = Number(readline())
const nums: number[] = readline().split(" ").map(Number)
const numSet: Set<number> = new Set(nums)
void k

function digitSum(value: number, base: number): number {
  let s = 0
  let v = value
  while (v > 0) {
    s += v % base
    v = Math.floor(v / base)
  }
  return s
}

const memo: Map<number, boolean> = new Map()

function isBuzzle(value: number): boolean {
  const cached = memo.get(value)
  if (cached !== undefined) {
    return cached
  }
  // Guard against cycles: assume false while computing
  memo.set(value, false)
  let result = false
  for (const num of nums) {
    if (value % num === 0) {
      result = true
      break
    }
  }
  if (!result) {
    // last digit in base n equals one of num
    const lastDigit = value % n
    if (numSet.has(lastDigit)) {
      result = true
    }
  }
  if (!result) {
    // sum of digits in base n is itself a Buzzle (recursively)
    const s = digitSum(value, n)
    if (s !== value && isBuzzle(s)) {
      result = true
    }
  }
  memo.set(value, result)
  return result
}

const out: string[] = []
for (let x = a; x <= b; x++) {
  out.push(isBuzzle(x) ? "Buzzle" : String(x))
}
console.log(out.join("\n"))
