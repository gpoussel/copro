// 🎮 CodinGame Puzzle - english-length-units-conversion
// https://www.codingame.com/training/medium/english-length-units-conversion

// BFS over the unit graph, carrying the exact ratio as a reduced fraction
function gcd(a: number, b: number): number {
  while (b) [a, b] = [b, a % b]
  return a
}

const query = readline()
const separator = query.indexOf(" in ")
const sourceUnit = query.substring(0, separator).trim()
const targetUnit = query.substring(separator + 4).trim()

// edges[x] = list of [y, num, den] meaning 1 x = num/den y
const unitEdges: { [unit: string]: [string, number, number][] } = {}
function addEdge(from: string, to: string, num: number, den: number): void {
  if (!unitEdges[from]) unitEdges[from] = []
  unitEdges[from].push([to, num, den])
}

function parseSide(side: string): [number, string] {
  const trimmed = side.trim()
  const space = trimmed.indexOf(" ")
  return [parseInt(trimmed.substring(0, space)), trimmed.substring(space + 1).trim()]
}

const relationCount = parseInt(readline())
for (let i = 0; i < relationCount; i++) {
  const [left, right] = readline().split("=")
  const [a, unitX] = parseSide(left)
  const [b, unitY] = parseSide(right)
  addEdge(unitX, unitY, b, a)
  addEdge(unitY, unitX, a, b)
}

const ratioOf: { [unit: string]: [number, number] } = {}
ratioOf[sourceUnit] = [1, 1]
const unitQueue = [sourceUnit]
for (let head = 0; head < unitQueue.length; head++) {
  const unit = unitQueue[head]
  const [num, den] = ratioOf[unit]
  for (const [next, edgeNum, edgeDen] of unitEdges[unit] || []) {
    if (ratioOf[next]) continue
    let newNum = num * edgeNum
    let newDen = den * edgeDen
    const g = gcd(newNum, newDen)
    newNum /= g
    newDen /= g
    ratioOf[next] = [newNum, newDen]
    unitQueue.push(next)
  }
}

// 1 source = num/den target, i.e. den source = num target
const [finalNum, finalDen] = ratioOf[targetUnit]
console.log(`${finalDen} ${sourceUnit} = ${finalNum} ${targetUnit}`)
