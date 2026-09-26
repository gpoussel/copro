// 🎮 CodinGame Puzzle - simons-ex-oracle
// https://www.codingame.com/training/hard/simons-ex-oracle

// Keep the set of secrets still consistent with the answers so far.
// For a new query x, giving it a fresh letter rules out every secret x ⊕ q for
// each previously seen query q. The adversarial oracle does that whenever some
// candidate survives; otherwise it is forced to reuse a letter: it picks the earliest
// letter among queries q with x ⊕ q still possible, which pins the secret to x ⊕ q.

const [L, N] = readline().split(" ").map(Number)
const size = 1 << L
const possible = new Array<boolean>(size).fill(true)
possible[0] = false

const letterOf = new Map<number, number>() // query -> letter index
let nextLetter = 0
const results: string[] = []

for (let i = 0; i < N; i++) {
  const x = parseInt(readline().trim(), 2)
  let letter = letterOf.get(x)
  if (letter === undefined) {
    const excluded = new Set<number>()
    for (const q of letterOf.keys()) excluded.add(x ^ q)
    const survivors = possible.some((ok, s) => ok && !excluded.has(s))
    if (survivors) {
      for (const s of excluded) possible[s] = false
      letter = nextLetter++
    } else {
      // Forced: reuse the earliest letter compatible with a remaining secret
      let bestQ = -1
      for (const [q, l] of letterOf) {
        if (possible[x ^ q] && (bestQ < 0 || l < (letterOf.get(bestQ) ?? Infinity))) bestQ = q
      }
      letter = letterOf.get(bestQ) ?? 0
      const secret = x ^ bestQ
      possible.fill(false)
      possible[secret] = true
    }
    letterOf.set(x, letter)
  }
  results.push(String.fromCharCode(65 + letter))
}

let best = 0
for (let s = size - 1; s > 0; s--) {
  if (possible[s]) {
    best = s
    break
  }
}
console.log(best.toString(2).padStart(L, "0"))
console.log(results.join("\n"))
