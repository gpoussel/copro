// 🎮 CodinGame Puzzle - snakes-and-ladders
// https://www.codingame.com/training/medium/snakes-and-ladders

const [width, height] = readline().split(" ").map(Number)
const sides = parseInt(readline())
const [snakes, ladders] = readline().split(" ").map(Number)
const last = width * height

// jump[t]: where the player ends after landing on tile t (no chaining)
const jump: number[] = []
for (let t = 0; t <= last; t++) jump.push(t)
for (let i = 0; i < snakes; i++) {
  const [head, tail] = readline().split(" ").map(Number)
  jump[head] = tail
}
for (let i = 0; i < ladders; i++) {
  const [top, bottom] = readline().split(" ").map(Number)
  jump[bottom] = top
}

// BFS on tiles; a roll that would overshoot the final tile is not allowed
const dist = new Array<number>(last + 1).fill(-1)
dist[1] = 0
const queue = [1]
for (let head = 0; head < queue.length && dist[last] < 0; head++) {
  const tile = queue[head]
  for (let roll = 1; roll <= sides && tile + roll <= last; roll++) {
    const next = jump[tile + roll]
    if (dist[next] >= 0) continue
    dist[next] = dist[tile] + 1
    queue.push(next)
  }
}
console.log(dist[last])
