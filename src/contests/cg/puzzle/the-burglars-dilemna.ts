// 🎮 CodinGame Puzzle - the-burglars-dilemna
// https://www.codingame.com/training/hard/the-burglars-dilemna

// Try the 6 assignments of meanings to sounds. For a given assignment every
// position is independent: keep the digits consistent with all attempts.
// Enumerate the resulting combinations (skipping previous failed attempts)
// and stop as soon as two distinct valid ones are found.
const N = parseInt(readline())
const C = parseInt(readline())
const attempts: number[][] = []
for (let i = 0; i < N; i++) attempts.push(readline().trim().split(/\s+/).map(Number))
const sounds: string[][] = []
for (let i = 0; i < N; i++) sounds.push(readline().trim().split(/\s+/))

const names = ["CLICK", "CLACK", "CLUCK"]
// meaning: 0 correct, 1 adjacent, 2 wrong
const meaning = (guess: number, code: number): number => {
  if (guess === code) return 0
  const d = Math.abs(guess - code)
  return d === 1 || d === 9 ? 1 : 2
}
const perms = [
  [0, 1, 2],
  [0, 2, 1],
  [1, 0, 2],
  [1, 2, 0],
  [2, 0, 1],
  [2, 1, 0],
]
const failed = new Set(attempts.map(a => a.join(" ")))
const found = new Set<string>()

for (const perm of perms) {
  // candidate digits per position under this sound -> meaning mapping
  const cands: number[][] = []
  for (let p = 0; p < C; p++) {
    const ok: number[] = []
    for (let d = 0; d < 10; d++) {
      let good = true
      for (let i = 0; i < N && good; i++) {
        if (meaning(attempts[i][p], d) !== perm[names.indexOf(sounds[i][p])]) good = false
      }
      if (good) ok.push(d)
    }
    cands.push(ok)
  }
  if (cands.some(c => c.length === 0)) continue
  const cur: number[] = []
  const dfs = (p: number): void => {
    if (found.size >= 2) return
    if (p === C) {
      const key = cur.join(" ")
      if (!failed.has(key)) found.add(key)
      return
    }
    for (const d of cands[p]) {
      cur.push(d)
      dfs(p + 1)
      cur.pop()
      if (found.size >= 2) return
    }
  }
  dfs(0)
}
console.log(found.size === 1 ? [...found][0] : "FLEE")
