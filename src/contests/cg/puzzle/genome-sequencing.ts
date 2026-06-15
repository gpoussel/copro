const n = parseInt(readline())
let seqs: string[] = []
for (let i = 0; i < n; i++) seqs.push(readline())

// Dedupe, then remove any string fully contained in another (longer) one
seqs = [...new Set(seqs)]
seqs = seqs.filter(s => !seqs.some(t => t !== s && t.includes(s)))

function overlap(a: string, b: string): number {
  const max = Math.min(a.length, b.length)
  for (let k = max; k > 0; k--) {
    if (a.slice(a.length - k) === b.slice(0, k)) return k
  }
  return 0
}

function merge(a: string, b: string): string {
  return a + b.slice(overlap(a, b))
}

let best = Infinity

function permute(arr: string[], cur: string[]) {
  if (arr.length === 0) {
    let s = cur[0]
    for (let i = 1; i < cur.length; i++) s = merge(s, cur[i])
    if (s.length < best) best = s.length
    return
  }
  for (let i = 0; i < arr.length; i++) {
    const rest = arr.slice(0, i).concat(arr.slice(i + 1))
    permute(rest, cur.concat(arr[i]))
  }
}

if (seqs.length === 0) best = 0
else permute(seqs, [])

console.log(best)
