// 🎮 CodinGame Puzzle - kangaroo-words
// https://www.codingame.com/training/easy/kangaroo-words

const n: number = parseInt(readline())
const results: string[] = []
const isSubseq = (joey: string, kang: string): boolean => {
  let i = 0
  for (let j = 0; j < kang.length && i < joey.length; j++) {
    if (kang[j] === joey[i]) i++
  }
  return i === joey.length
}
for (let l = 0; l < n; l++) {
  const words: string[] = readline()
    .split(",")
    .map(w => w.trim())
  for (const kang of words) {
    const joeys: string[] = []
    for (const joey of words) {
      if (joey === kang) continue
      if (joey.length >= kang.length) continue
      if (isSubseq(joey, kang)) joeys.push(joey)
    }
    if (joeys.length > 0) {
      joeys.sort()
      results.push(`${kang}: ${joeys.join(", ")}`)
    }
  }
}
results.sort()
console.log(results.length > 0 ? results.join("\n") : "NONE")
