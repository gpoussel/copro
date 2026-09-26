// 🎮 CodinGame Puzzle - train-passenger
// https://www.codingame.com/training/medium/train-passenger

const startStation = readline().trim()
const endStation = readline().trim()
const linkCount = parseInt(readline(), 10)
const links: { [station: string]: string[] } = {}
function addLink(a: string, b: string): void {
  if (!links[a]) links[a] = []
  links[a].push(b)
}
for (let i = 0; i < linkCount; i++) {
  const [a, b] = readline().trim().split(" ")
  addLink(a, b)
  addLink(b, a)
}

// Breadth-first search from the start, remembering each station's predecessor
const previous: { [station: string]: string } = {}
const visited: { [station: string]: boolean } = { [startStation]: true }
const bfsQueue = [startStation]
while (bfsQueue.length > 0) {
  const station = bfsQueue.shift() as string
  if (station === endStation) break
  for (const next of links[station] || []) {
    if (visited[next]) continue
    visited[next] = true
    previous[next] = station
    bfsQueue.push(next)
  }
}

const route = [endStation]
while (route[0] !== startStation) route.unshift(previous[route[0]])
console.log(route.join(" > "))
