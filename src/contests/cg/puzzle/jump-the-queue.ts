// 🎮 CodinGame Puzzle - jump-the-queue
// https://www.codingame.com/

const [g] = readline().split(" ").map(Number)

// Map each student to the id of their friend group (lonely wolves stay absent).
const groupOf = new Map<number, number>()
for (let i = 0; i < g; i++) {
  for (const id of readline().split(" ").map(Number)) {
    groupOf.set(id, i)
  }
}

const queue: number[] = []
const output: number[] = []

for (const event of readline().split(" ").map(Number)) {
  if (event === -1) {
    // Dequeue: the head buys his lunchbox and leaves.
    output.push(queue.shift()!)
    continue
  }

  const group = groupOf.get(event)
  let insertAt = queue.length // No friend found -> join at the tail.

  if (group !== undefined) {
    const first = queue.findIndex(id => groupOf.get(id) === group)
    if (first !== -1) {
      // Skip past the contiguous block of friends already gathered together,
      // then insert right behind that friend group.
      let i = first
      while (i + 1 < queue.length && groupOf.get(queue[i + 1]) === group) i++
      insertAt = i + 1
    }
  }

  queue.splice(insertAt, 0, event)
}

console.log(output.join("\n"))
