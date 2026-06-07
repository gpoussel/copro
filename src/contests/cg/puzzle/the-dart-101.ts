// 🎮 CodinGame Puzzle - the-dart-101
// https://www.codingame.com/training/easy/the-dart-101

const N = parseInt(readline())
const names: string[] = []
for (let i = 0; i < N; i++) names.push(readline())
const shootLines: string[] = []
for (let i = 0; i < N; i++) shootLines.push(readline())

function parseShot(token: string): number {
  if (token.includes("*")) {
    const parts = token.split("*")
    return parseInt(parts[0]) * parseInt(parts[1])
  }
  return parseInt(token)
}

function simulate(shootsStr: string): number {
  const tokens = shootsStr.split(" ")
  let total = 0
  let tokenIdx = 0
  let rounds = 0

  while (tokenIdx < tokens.length) {
    const roundStart = total
    rounds++

    // Play up to 3 darts this round
    let roundDelta = 0 // points scored (or lost from misses) this round
    let extraPenalty = 0 // extra -10 for consecutive misses
    let missCount = 0
    let prevMiss = false
    let earlyEnd = false // exceeded 101
    let tripleReset = false

    for (let dart = 0; dart < 3 && tokenIdx < tokens.length; dart++) {
      const token = tokens[tokenIdx++]

      if (token === "X") {
        missCount++
        roundDelta -= 20

        if (prevMiss) {
          // two consecutive misses: extra -10 penalty
          extraPenalty -= 10
        }

        if (missCount === 3) {
          // three misses in round: reset entire total to 0
          tripleReset = true
          break // round ends
        }

        prevMiss = true
        // After a miss, check if we somehow reached/exceeded 101 (impossible since -20)
        // so no need to check
      } else {
        const pts = parseShot(token)
        const candidate = roundStart + roundDelta + extraPenalty + pts

        if (candidate > 101) {
          // Exceed: revert, end round immediately
          total = roundStart
          earlyEnd = true
          break
        } else if (candidate === 101) {
          // Exact win!
          return rounds
        } else {
          roundDelta += pts
          prevMiss = false
        }

        // Check if reaching/exceeding 101 (candidate < 101 here, so just continue)
      }
    }

    if (!earlyEnd) {
      if (tripleReset) {
        total = 0
      } else {
        total = roundStart + roundDelta + extraPenalty
      }
    }
    // if earlyEnd, total was already set to roundStart inside loop
  }

  return Infinity // never reached exactly 101
}

let bestRounds = Infinity
let winner = ""

for (let i = 0; i < N; i++) {
  const rounds = simulate(shootLines[i])
  if (rounds < bestRounds) {
    bestRounds = rounds
    winner = names[i]
  }
}

console.log(winner)
