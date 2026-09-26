// 🎮 CodinGame Puzzle - non-triple-numbers
// https://www.codingame.com/training/medium/non-triple-numbers

const target = (parseInt(readline()) + 1).toString(2)
const bitLen = target.length

// A bit can be appended unless it would make three equal consecutive bits
const allowed = (prefix: string, bit: string) =>
  !(prefix.length >= 2 && prefix[prefix.length - 1] === bit && prefix[prefix.length - 2] === bit)

// Smallest completion of prefix to total length (always exists)
function fillMin(prefix: string, total: number): string {
  let s = prefix
  while (s.length < total) s += allowed(s, "0") ? "0" : "1"
  return s
}

// Smallest valid string of length bitLen that is >= target, keeping prefix equal to target so far
function search(prefix: string): string | null {
  const pos = prefix.length
  if (pos === bitLen) return prefix
  const t = target[pos]
  if (allowed(prefix, t)) {
    const res = search(prefix + t)
    if (res !== null) return res
  }
  if (t === "0" && allowed(prefix, "1")) return fillMin(prefix + "1", bitLen)
  return null
}

const best = search("") || fillMin("1", bitLen + 1)
console.log(parseInt(best, 2))
