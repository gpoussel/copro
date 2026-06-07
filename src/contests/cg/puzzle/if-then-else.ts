// 🎮 CodinGame Puzzle - if-then-else
// https://www.codingame.com/training/medium/if-then-else

const N = parseInt(readline())
const lines: string[] = []
for (let i = 0; i < N; i++) {
  lines.push(readline())
}

// Skip "begin" and "end", work with the inner lines
// lines[0] = "begin", lines[N-1] = "end"
let pos = 1 // current position in lines array

// Parse a sequence of statements until we hit "else", "endif", or "end".
// Returns the number of result combinations for this sequence.
// Sequential statements: combinations multiply (each is independent).
// An if/else/endif block: combinations = trueBranch + falseBranch.
// An "S" statement (action): 1 combination.
// An empty sequence: 1 combination (implied hidden action).
function parseSequence(): bigint {
  let total = 1n // multiplicative identity for sequential composition

  while (pos < lines.length) {
    const line = lines[pos]

    if (line === "end" || line === "else" || line === "endif") {
      // Don't consume; let the caller handle it
      break
    } else if (line === "S") {
      pos++
      // S contributes 1 combination, multiplying total by 1 (no change)
    } else if (line === "if") {
      pos++ // consume "if"
      const trueCombinations = parseSequence()
      // Now pos should be at "else"
      pos++ // consume "else"
      const falseCombinations = parseSequence()
      // Now pos should be at "endif"
      pos++ // consume "endif"
      // This if/else/endif contributes (true + false) paths
      total *= trueCombinations + falseCombinations
    }
  }

  return total
}

const result = parseSequence()
console.log(result.toString())
