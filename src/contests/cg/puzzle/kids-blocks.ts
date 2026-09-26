// 🎮 CodinGame Puzzle - kids-blocks
// https://www.codingame.com/training/medium/kids-blocks

const x1 = parseInt(readline())
const x2 = parseInt(readline())
const x3 = parseInt(readline())
const total = x1 + 2 * x2 + 3 * x3

// Can all pieces be split into rows of exactly `width` inches?
function canBuild(width: number): boolean {
  const rowShapes: [number, number, number][] = []
  for (let c = 0; 3 * c <= width; c++) {
    for (let b = 0; 3 * c + 2 * b <= width; b++) rowShapes.push([width - 3 * c - 2 * b, b, c])
  }
  const key = (a: number, b: number, c: number) => (a * 31 + b) * 31 + c
  const seen: boolean[] = []
  const stack: [number, number, number][] = [[0, 0, 0]]
  seen[0] = true
  while (stack.length > 0) {
    const [a, b, c] = stack.pop()!
    if (a === x1 && b === x2 && c === x3) return true
    for (const [da, db, dc] of rowShapes) {
      const na = a + da
      const nb = b + db
      const nc = c + dc
      if (na > x1 || nb > x2 || nc > x3 || seen[key(na, nb, nc)]) continue
      seen[key(na, nb, nc)] = true
      stack.push([na, nb, nc])
    }
  }
  return false
}

let possible = false
for (let height = 2; height <= total && !possible; height++) {
  if (total % height === 0) possible = canBuild(total / height)
}
console.log(possible ? "POSSIBLE" : "NOT POSSIBLE")
