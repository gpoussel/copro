// 🎮 CodinGame Puzzle - death-first-search-episode-2
// https://www.codingame.com/training/hard/death-first-search-episode-2

// Each turn: if the agent is next to a gateway, cut that link. Otherwise run a
// 0-1 BFS from the agent where entering a node that touches a gateway is free
// (the agent forces a cut there anyway) and entering any other node costs one
// spare turn. The node touching two gateways with the fewest spare turns is
// the most dangerous: cut one of its gateway links.

const [nodeCount, linkCount, gatewayCount] = readline().split(" ").map(Number)
const adj: Set<number>[] = Array.from({ length: nodeCount }, () => new Set<number>())
for (let i = 0; i < linkCount; i++) {
  const [a, b] = readline().split(" ").map(Number)
  adj[a].add(b)
  adj[b].add(a)
}
const isGateway = new Array<boolean>(nodeCount).fill(false)
for (let i = 0; i < gatewayCount; i++) isGateway[Number(readline())] = true

const gatewayLinks = (v: number): number[] => [...adj[v]].filter(u => isGateway[u])

function cut(a: number, b: number): void {
  adj[a].delete(b)
  adj[b].delete(a)
  console.log(`${a} ${b}`)
}

while (true) {
  const agent = Number(readline())
  const direct = gatewayLinks(agent)
  if (direct.length > 0) {
    cut(agent, direct[0])
    continue
  }
  // 0-1 BFS on spare turns
  const cost = new Array<number>(nodeCount).fill(Infinity)
  cost[agent] = 0
  const deque: number[] = [agent]
  const done = new Array<boolean>(nodeCount).fill(false)
  while (deque.length > 0) {
    const v = deque.shift() as number
    if (done[v]) continue
    done[v] = true
    for (const u of adj[v]) {
      if (isGateway[u]) continue
      const w = gatewayLinks(u).length > 0 ? 0 : 1
      if (cost[v] + w < cost[u]) {
        cost[u] = cost[v] + w
        if (w === 0) deque.unshift(u)
        else deque.push(u)
      }
    }
  }
  let best = -1
  let bestKey = Infinity
  for (let v = 0; v < nodeCount; v++) {
    const links = gatewayLinks(v).length
    if (links === 0 || cost[v] === Infinity) continue
    // Nodes touching two gateways first, then fewest spare turns
    const key = cost[v] + (links >= 2 ? 0 : 10000)
    if (key < bestKey) {
      bestKey = key
      best = v
    }
  }
  if (best >= 0) cut(best, gatewayLinks(best)[0])
  else {
    // Agent can no longer reach anything: cut any remaining gateway link
    let severed = false
    for (let v = 0; v < nodeCount && !severed; v++) {
      if (isGateway[v] && adj[v].size > 0) {
        cut(v, [...adj[v]][0])
        severed = true
      }
    }
    if (!severed) console.log("0 1")
  }
}
