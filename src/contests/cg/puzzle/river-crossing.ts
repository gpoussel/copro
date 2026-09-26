// 🎮 CodinGame Puzzle - river-crossing
// https://www.codingame.com/training/medium/river-crossing

// State: sides of Farmer, Wolf, Goat, Cabbage, formatted like the input ("L L L R")
const initial = readline().trim()
const target = readline().trim()

const flip = (side: string) => (side === "L" ? "R" : "L")

function isSafe(s: string[]): boolean {
  const [farmer, wolf, goat, cabbage] = s
  if (wolf === goat && goat !== farmer) return false
  if (goat === cabbage && goat !== farmer) return false
  return true
}

function nextStates(state: string): string[] {
  const s = state.split(" ")
  const result: string[] = []
  // The farmer crosses alone (passenger 0) or with an entity on his side
  for (let passenger = 0; passenger < 4; passenger++) {
    if (passenger > 0 && s[passenger] !== s[0]) continue
    const next = s.slice()
    next[0] = flip(s[0])
    if (passenger > 0) next[passenger] = flip(s[passenger])
    if (isSafe(next)) result.push(next.join(" "))
  }
  return result.sort()
}

// BFS expanding neighbours alphabetically: the first path found is the shortest, alphabetically first one
const parent = new Map<string, string | null>()
parent.set(initial, null)
const queue = [initial]
for (let head = 0; head < queue.length && !parent.has(target); head++) {
  for (const next of nextStates(queue[head])) {
    if (parent.has(next)) continue
    parent.set(next, queue[head])
    queue.push(next)
  }
}

const path: string[] = []
for (let state: string | null = target; state !== null; state = parent.get(state)!) path.unshift(state)
path.forEach(line => console.log(line))
