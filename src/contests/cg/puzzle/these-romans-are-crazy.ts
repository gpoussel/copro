const vals: { [k: string]: number } = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 }
function toInt(s: string): number {
  let total = 0
  for (let i = 0; i < s.length; i++) {
    const v = vals[s[i]]
    if (i + 1 < s.length && vals[s[i + 1]] > v) total -= v
    else total += v
  }
  return total
}
function toRoman(n: number): string {
  const table: [number, string][] = [
    [1000, "M"],
    [900, "CM"],
    [500, "D"],
    [400, "CD"],
    [100, "C"],
    [90, "XC"],
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ]
  let res = ""
  for (const [val, sym] of table) {
    while (n >= val) {
      res += sym
      n -= val
    }
  }
  return res
}
const a = toInt(readline())
const b = toInt(readline())
console.log(toRoman(a + b))
