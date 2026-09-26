// 🎮 CodinGame Puzzle - guessing-n-cheating
// https://www.codingame.com/training/medium/guessing-n-cheating

// Track the interval of numbers still consistent with every answer so far
const roundCount = Number(readline())
let low = 1
let high = 100
let cheatRound = 0
for (let round = 1; round <= roundCount; round++) {
  const line = readline()
  if (cheatRound) continue
  const guess = parseInt(line, 10)
  if (line.indexOf("too high") >= 0) high = Math.min(high, guess - 1)
  else if (line.indexOf("too low") >= 0) low = Math.max(low, guess + 1)
  else {
    low = Math.max(low, guess)
    high = Math.min(high, guess)
  }
  if (low > high) cheatRound = round
}

console.log(cheatRound ? `Alice cheated in round ${cheatRound}` : "No evidence of cheating")
