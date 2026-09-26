// 🎮 CodinGame Puzzle - minimax-simple-example
// https://www.codingame.com/training/expert/minimax-simple-example

// After k turns the pile is always "one skipped letter" followed by the
// untouched suffix starting at k + 1, so a state is (turn, skipped letter,
// letters of each player). Negamax with alpha-beta on the score difference,
// plus a word-based bound: a word stays reachable for a player as long as the
// opponent holds none of its letters, and is already scored once complete.

const [n, q] = readline().split(" ").map(Number)
const pile = readline().split(" ")
const bitOf = new Map<string, number>()
pile.forEach((letter, i) => bitOf.set(letter, 1 << i))

const wordMasks: number[] = []
const wordScores: number[] = []
for (let i = 0; i < q; i++) {
  const [word, score] = readline().split(" ")
  let mask = 0
  let valid = true
  for (const ch of word) {
    const b = bitOf.get(ch)
    if (b === undefined) valid = false
    else mask |= b
  }
  if (valid) {
    wordMasks.push(mask)
    wordScores.push(Number(score))
  }
}
const W = wordMasks.length

const scoreOf = (mask: number): number => {
  let s = 0
  for (let w = 0; w < W; w++) if ((wordMasks[w] & mask) === wordMasks[w]) s += wordScores[w]
  return s
}

// Best achievable [my score, opponent score] for the player to move
// (holding `mine`), given the pile front `front` and turn `k`.
// The result is exact when its difference lies strictly inside (alpha, beta).
const search = (
  k: number,
  front: number,
  mine: number,
  theirs: number,
  alpha: number,
  beta: number
): [number, number] => {
  if (k === n - 1) {
    const me = mine | (1 << front)
    return [scoreOf(me), scoreOf(theirs)]
  }
  // Bounds on the final difference for the player to move
  let myMin = 0
  let myMax = 0
  let thMin = 0
  let thMax = 0
  for (let w = 0; w < W; w++) {
    const m = wordMasks[w]
    const s = wordScores[w]
    if ((m & mine) === m) myMin += s
    if ((m & theirs) === 0) myMax += s
    if ((m & theirs) === m) thMin += s
    if ((m & mine) === 0) thMax += s
  }
  if (myMax - thMin <= alpha) return [myMax, thMin]
  if (myMin - thMax >= beta) return [myMin, thMax]

  let best: [number, number] = [0, 0]
  let bestDiff = -Infinity
  // Option A: take the front letter, the next suffix letter becomes the front
  // Option B: take the suffix letter, the front stays
  const options: [number, number][] = [
    [front, k + 1],
    [k + 1, front],
  ]
  for (const [taken, nextFront] of options) {
    const [th, me] = search(k + 1, nextFront, theirs, mine | (1 << taken), -beta, -Math.max(alpha, bestDiff))
    const diff = me - th
    if (diff > bestDiff) {
      bestDiff = diff
      best = [me, th]
      if (diff >= beta) break
    }
  }
  return best
}

// Root: evaluate both choices to report the best one
const rootOptions: [number, number][] = [
  [0, 1],
  [1, 0],
]
let answer = ""
let bestDiff = -Infinity
for (const [taken, nextFront] of rootOptions) {
  const [th, me] = search(1, nextFront, 0, 1 << taken, -Infinity, -bestDiff)
  if (me - th > bestDiff) {
    bestDiff = me - th
    answer = `${pile[taken]} ${me}-${th}`
  }
}
console.log(answer)
