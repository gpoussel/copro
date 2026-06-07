// 🎮 CodinGame Puzzle - offset-arrays
// https://www.codingame.com/training/easy/offset-arrays

const n = parseInt(readline())

// Store arrays as a map from name -> { firstIndex, values[] }
const arrays: Record<string, { firstIndex: number; values: number[] }> = {}

for (let i = 0; i < n; i++) {
  const line = readline()
  // Format: NAME[first..last] = v1 v2 v3 ...
  const match = line.match(/^(\w+)\[(-?\d+)\.\.(-?\d+)\]\s*=\s*(.+)$/)!
  const name = match[1]
  const firstIndex = parseInt(match[2])
  const values = match[4].split(" ").map(Number)
  arrays[name] = { firstIndex, values }
}

// Read the query expression, e.g. "B[A[C[-329054771]]]"
const query = readline()

// Evaluate a nested indexing expression recursively
function evaluate(expr: string): number {
  // Find the outermost array name and its bracket content
  const bracketStart = expr.indexOf("[")
  if (bracketStart === -1) {
    // It's a plain integer
    return parseInt(expr)
  }

  const name = expr.slice(0, bracketStart)
  // The content inside the outermost brackets
  const inner = expr.slice(bracketStart + 1, expr.length - 1)

  // Evaluate the inner expression to get the index
  const index = evaluate(inner)

  const arr = arrays[name]
  const offset = index - arr.firstIndex
  return arr.values[offset]
}

console.log(evaluate(query))
