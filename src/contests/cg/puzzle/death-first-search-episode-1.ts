// @ts-nocheck
// 🎮 CodinGame Puzzle - death-first-search-episode-1
// https://www.codingame.com/training/medium/death-first-search-episode-1

// Read initialization data
const [N, L, E] = readline().split(' ').map(Number);

// Build adjacency list: edges[node] = Set of neighbors
const edges: Map<number, Set<number>> = new Map();
for (let i = 0; i < N; i++) {
  edges.set(i, new Set());
}

for (let i = 0; i < L; i++) {
  const [n1, n2] = readline().split(' ').map(Number);
  edges.get(n1)!.add(n2);
  edges.get(n2)!.add(n1);
}

const gateways: Set<number> = new Set();
for (let i = 0; i < E; i++) {
  const ei = parseInt(readline());
  gateways.add(ei);
}

/**
 * BFS from the agent's current node.
 * Returns the edge [nodeBeforeGateway, gateway] on the shortest path
 * from agentPos to any gateway.
 * The key insight from the problem rules: at most one node links to a gateway,
 * so we just need to find the closest gateway-adjacent node and cut that link.
 */
function findLinkToSever(agentPos: number): [number, number] {
  // BFS to find the shortest path from agentPos to any gateway
  const visited: Set<number> = new Set();
  const parent: Map<number, number> = new Map();
  const queue: number[] = [agentPos];
  visited.add(agentPos);

  let foundGateway: number | null = null;

  bfsLoop:
  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const neighbor of edges.get(current)!) {
      if (visited.has(neighbor)) continue;
      parent.set(neighbor, current);

      if (gateways.has(neighbor)) {
        // neighbor is a gateway — cut the link from current to neighbor
        foundGateway = neighbor;
        break bfsLoop;
      }

      visited.add(neighbor);
      queue.push(neighbor);
    }
  }

  if (foundGateway === null) {
    // No path to any gateway — shouldn't happen in a valid puzzle state
    // Return a dummy value (game is already won or error)
    return [0, 0];
  }

  // The link to sever is: parent[foundGateway] -- foundGateway
  // i.e. the last hop before the gateway on the shortest BFS path
  const nodeBeforeGateway = parent.get(foundGateway)!;
  return [nodeBeforeGateway, foundGateway];
}

// Game loop
while (true) {
  const SI = parseInt(readline());

  const [c1, c2] = findLinkToSever(SI);

  // Sever the link in our local graph so future turns reflect the cut
  edges.get(c1)!.delete(c2);
  edges.get(c2)!.delete(c1);

  console.log(`${c1} ${c2}`);
}
