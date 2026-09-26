// 🎮 CodinGame Puzzle - firewall-placement
// https://www.codingame.com/training/medium/firewall-placement

const fwNodes = parseInt(readline())
const fwVirus = parseInt(readline())
const fwLinks = parseInt(readline())
const fwAdj: number[][] = []
for (let i = 0; i < fwNodes; i++) fwAdj.push([])
for (let i = 0; i < fwLinks; i++) {
  const [a, b] = readline().trim().split(/\s+/).map(Number)
  fwAdj[a].push(b)
  fwAdj[b].push(a)
}

// Number of nodes the virus reaches when `blocked` holds the firewall
function infectedCount(blocked: number): number {
  const seenNodes: boolean[] = new Array(fwNodes).fill(false)
  seenNodes[fwVirus] = true
  seenNodes[blocked] = true
  const queue = [fwVirus]
  for (let head = 0; head < queue.length; head++) {
    for (const next of fwAdj[queue[head]]) {
      if (seenNodes[next]) continue
      seenNodes[next] = true
      queue.push(next)
    }
  }
  return queue.length
}

let bestNode = -1
let bestInfected = Infinity
for (let node = 0; node < fwNodes; node++) {
  if (node === fwVirus) continue
  const infected = infectedCount(node)
  if (infected < bestInfected) {
    bestInfected = infected
    bestNode = node
  }
}
console.log(bestNode)
