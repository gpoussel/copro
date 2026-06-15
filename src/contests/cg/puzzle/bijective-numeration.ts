// 🎮 CodinGame Puzzle - bijective-numeration
// https://www.codingame.com/

const count = parseInt(readline(), 10)
const values = readline().split(" ").slice(0, count)

const digitValue = (c: string): bigint => (c === "A" ? 10n : BigInt(c))

const parse = (s: string): bigint => {
  let n = 0n
  for (const c of s) {
    n = n * 10n + digitValue(c)
  }
  return n
}

let sum = 0n
for (const v of values) {
  sum += parse(v)
}

const encode = (n: bigint): string => {
  let out = ""
  while (n > 0n) {
    const d = ((n - 1n) % 10n) + 1n
    out = (d === 10n ? "A" : d.toString()) + out
    n = (n - 1n) / 10n
  }
  return out
}

console.log(encode(sum))
