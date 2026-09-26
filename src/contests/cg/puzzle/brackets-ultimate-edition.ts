// 🎮 CodinGame Puzzle - brackets-ultimate-edition
// https://www.codingame.com/training/medium/brackets-ultimate-edition

const OPENERS = "([{<"
const CLOSERS = ")]}>"
const INF = 1e9

const minFlips = (expression: string): number => {
  const brackets = expression.split("").filter(ch => OPENERS.indexOf(ch) >= 0 || CLOSERS.indexOf(ch) >= 0)
  const n = brackets.length
  if (n % 2 === 1) return -1
  const kind = brackets.map(ch => (OPENERS.indexOf(ch) >= 0 ? OPENERS.indexOf(ch) : CLOSERS.indexOf(ch)))
  const isOpen = brackets.map(ch => OPENERS.indexOf(ch) >= 0)

  // best[i][j]: min flips to make brackets[i..j-1] valid (empty range costs 0)
  const best: number[][] = []
  for (let i = 0; i <= n; i++) {
    best.push([])
    for (let j = 0; j <= n; j++) best[i].push(j === i ? 0 : INF)
  }
  for (let len = 2; len <= n; len += 2) {
    for (let i = 0; i + len <= n; i++) {
      const j = i + len
      let result = INF
      // brackets[i] is matched with brackets[k]
      for (let k = i + 1; k < j; k += 2) {
        if (kind[i] !== kind[k]) continue
        const pairCost = (isOpen[i] ? 0 : 1) + (isOpen[k] ? 1 : 0)
        result = Math.min(result, pairCost + best[i + 1][k] + best[k + 1][j])
      }
      best[i][j] = result
    }
  }
  return best[0][n] >= INF ? -1 : best[0][n]
}

const expressionCount = +readline()
for (let i = 0; i < expressionCount; i++) console.log(minFlips(readline()))
