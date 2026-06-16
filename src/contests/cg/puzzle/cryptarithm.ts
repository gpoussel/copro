// 🎮 CodinGame Puzzle - cryptarithm
// https://www.codingame.com/training/hard/cryptarithm

const n: number = parseInt(readline(), 10)
const words: string[] = []
for (let i = 0; i < n; i++) words.push(readline().trim())
const total: string = readline().trim()

const coeff: Map<string, number> = new Map()
const leading: Set<string> = new Set()

function addWord(w: string, sign: number): void {
  leading.add(w[0])
  for (let i = 0; i < w.length; i++) {
    const c = w[i]
    const place = Math.pow(10, w.length - 1 - i)
    coeff.set(c, (coeff.get(c) ?? 0) + sign * place)
  }
}

for (const w of words) addWord(w, 1)
addWord(total, -1)

const letters: string[] = [...coeff.keys()].sort()
const k = letters.length
const coeffs: number[] = letters.map(l => coeff.get(l) as number)
const isLead: boolean[] = letters.map(l => leading.has(l))

const used: boolean[] = new Array(10).fill(false)
const assign: number[] = new Array(k).fill(-1)
let found: number[] | null = null

function backtrack(idx: number, sum: number): boolean {
  if (idx === k) {
    if (sum === 0) {
      found = assign.slice()
      return true
    }
    return false
  }
  for (let d = 0; d <= 9; d++) {
    if (used[d]) continue
    if (d === 0 && isLead[idx]) continue
    used[d] = true
    assign[idx] = d
    if (backtrack(idx + 1, sum + coeffs[idx] * d)) return true
    used[d] = false
    assign[idx] = -1
  }
  return false
}

backtrack(0, 0)

if (found) {
  const sol = found as number[]
  for (let i = 0; i < k; i++) {
    console.log(`${letters[i]} ${sol[i]}`)
  }
}
