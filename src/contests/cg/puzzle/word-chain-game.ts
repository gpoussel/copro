// 🎮 CodinGame Puzzle - word-chain-game
// https://www.codingame.com/training/medium/word-chain-game

const n = parseInt(readline())
const words: string[] = []
for (let i = 0; i < n; i++) words.push(readline().trim())

// successors[i] = words that may follow word i
const successors: number[][] = words.map(w => {
  const last = w.charAt(w.length - 1)
  const list: number[] = []
  words.forEach((other, j) => {
    if (other.charAt(0) === last) list.push(j)
  })
  return list
})

// memo[mask * n + last]: 0 = unknown, 1 = player to move wins, 2 = player to move loses
const memo = new Uint8Array((1 << n) * n)

function wins(mask: number, last: number): boolean {
  const key = mask * n + last
  if (memo[key] === 0) {
    let result = false
    for (const next of successors[last]) {
      if (!(mask & (1 << next)) && !wins(mask | (1 << next), next)) {
        result = true
        break
      }
    }
    memo[key] = result ? 1 : 2
  }
  return memo[key] === 1
}

let aliceWins = false
for (let first = 0; first < n && !aliceWins; first++) {
  if (!wins(1 << first, first)) aliceWins = true
}
console.log(aliceWins ? "Alice" : "Bob")
