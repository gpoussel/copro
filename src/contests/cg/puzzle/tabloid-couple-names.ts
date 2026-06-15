// 🎮 CodinGame Puzzle - tabloid-couple-names
// https://www.codingame.com/

function couple(a: string, b: string): string {
  const byOverlap: Map<number, Set<string>> = new Map()
  let maxK = 0
  const minLen = Math.min(a.length, b.length)
  const aLow = a.toLowerCase()
  const bLow = b.toLowerCase()
  const consider = (x: string, y: string): void => {
    const xl = x.toLowerCase()
    const yl = y.toLowerCase()
    for (let p = 1; p <= x.length; p++) {
      for (let q = 0; q < y.length; q++) {
        const sLen = y.length - q
        const maxOverlap = Math.min(p, sLen)
        for (let k = 1; k <= maxOverlap; k++) {
          if (p <= k || sLen <= k) continue
          if (xl.slice(p - k, p) !== yl.slice(q, q + k)) continue
          const resLow = (x.slice(0, p) + y.slice(q + k)).toLowerCase()
          if (resLow.length < minLen) continue
          if (resLow === aLow || resLow === bLow) continue
          const name = resLow.charAt(0).toUpperCase() + resLow.slice(1)
          let bucket = byOverlap.get(k)
          if (!bucket) {
            bucket = new Set<string>()
            byOverlap.set(k, bucket)
          }
          bucket.add(name)
          if (k > maxK) maxK = k
        }
      }
    }
  }
  consider(a, b)
  consider(b, a)
  if (maxK === 0) return "NONE"
  const names: string[] = Array.from(byOverlap.get(maxK) as Set<string>)
  names.sort((m: string, n: string): number => (m < n ? -1 : m > n ? 1 : 0))
  return names.length ? names.join(" ") : "NONE"
}

const n: number = parseInt(readline(), 10)
const lines: string[] = []
for (let i = 0; i < n; i++) {
  const words: string[] = readline().trim().split(/\s+/)
  const name1: string = words[0]
  const name2: string = words[2]
  lines.push(`${name1} plus ${name2} = ${couple(name1, name2)}`)
}
console.log(lines.join("\n"))
