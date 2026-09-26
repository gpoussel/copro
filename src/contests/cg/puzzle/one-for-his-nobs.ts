// 🎮 CodinGame Puzzle - one-for-his-nobs
// https://www.codingame.com/training/medium/one-for-his-nobs

const RANKS = "A23456789TJQK"

const score = (cards: string[]): number => {
  const ranks = cards.map(c => RANKS.indexOf(c[0]) + 1)
  const suits = cards.map(c => c[1])
  const values = ranks.map(r => Math.min(r, 10))
  let total = 0

  // Fifteens, and runs by subset (keep only the longest run length)
  let runLength = 0
  let runPoints = 0
  for (let mask = 1; mask < 32; mask++) {
    const picked: number[] = []
    for (let i = 0; i < 5; i++) if (mask & (1 << i)) picked.push(i)
    if (picked.reduce((s, i) => s + values[i], 0) === 15) total += 2
    if (picked.length >= 3) {
      const rs = picked.map(i => ranks[i]).sort((a, b) => a - b)
      let isRun = true
      for (let k = 1; k < rs.length; k++) if (rs[k] !== rs[k - 1] + 1) isRun = false
      if (isRun) {
        if (rs.length > runLength) {
          runLength = rs.length
          runPoints = 0
        }
        if (rs.length === runLength) runPoints += runLength
      }
    }
  }
  total += runPoints

  // Pairs
  for (let i = 0; i < 5; i++) for (let j = i + 1; j < 5; j++) if (ranks[i] === ranks[j]) total += 2

  // Flush
  if (suits[1] === suits[0] && suits[2] === suits[0] && suits[3] === suits[0]) {
    total += suits[4] === suits[0] ? 5 : 4
  }

  // His nobs
  for (let i = 0; i < 4; i++) if (cards[i][0] === "J" && suits[i] === suits[4]) total++

  return total
}

const n = +readline()
for (let i = 0; i < n; i++) console.log(score(readline().trim().split(/\s+/)))
