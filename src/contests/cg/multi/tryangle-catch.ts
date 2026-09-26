// 🎮 CodinGame Multiplayer - tryangle-catch
// https://www.codingame.com/multiplayer/bot-programming/tryangle-catch
// Referee: https://github.com/eulerscheZahl/TryAngle-Catch
//
// Houses joined by paths; a house is ours with strictly more units; owning
// the 3 corners of a triangle captures it (1 point per turn), and using one
// spawns a unit. Plan: hold the corners of our triangles, send spare units
// (BFS over paths) to the corners of capturable triangles we do not hold yet
// (houses shared by several triangles first), and spawn while the army is
// small.

const houseCount = parseInt(readline())
for (let i = 0; i < houseCount; i++) readline()
const SPAWN_BELOW = 30

while (true) {
  readline() // scores
  const mine = new Int32Array(houseCount)
  const theirs = new Int32Array(houseCount)
  for (let i = 0; i < houseCount; i++) {
    const [h, m, o] = readline().split(" ").map(Number)
    mine[h] = m
    theirs[h] = o
  }
  const adj: number[][] = Array.from({ length: houseCount }, () => [])
  const pc = parseInt(readline())
  for (let i = 0; i < pc; i++) {
    const [a, b] = readline().split(" ").map(Number)
    adj[a].push(b)
    adj[b].push(a)
  }
  const tc = parseInt(readline())
  const triangles: { corners: number[]; owner: number; canCapture: boolean }[] = []
  for (let i = 0; i < tc; i++) {
    const [a, b, c, owner, can] = readline().split(" ").map(Number)
    triangles.push({ corners: [a, b, c], owner, canCapture: can === 1 })
  }
  const lc = parseInt(readline())
  for (let i = 0; i < lc; i++) readline()

  const commands: string[] = []
  // Units kept on each house: enough to keep the corners of our triangles.
  const need = new Int32Array(houseCount)
  const wanted = new Float64Array(houseCount) // attraction of a house
  const held = (h: number) => mine[h] > theirs[h]
  for (const t of triangles) {
    if (t.owner === 0) for (const h of t.corners) need[h] = Math.max(need[h], theirs[h] + 1)
    else if (t.canCapture) {
      // Triangles close to completion pull harder.
      const done = t.corners.filter(held).length
      for (const h of t.corners) if (!held(h)) wanted[h] += 1 + 2 * done
    }
  }
  // A house whose neighbours are all enemy-held kills the units sent there.
  const enemyHeld = (h: number) => theirs[h] > mine[h]
  const deathTrap = (h: number) => adj[h].length > 0 && adj[h].every(enemyHeld)
  // Spawns from our triangles, on the corner that needs units the most.
  let army = mine.reduce((a, b) => a + b, 0)
  for (const t of triangles) {
    if (t.owner !== 0 || army >= SPAWN_BELOW) continue
    const [a, b, c] = t.corners.slice().sort((x, y) => theirs[y] - mine[y] - (theirs[x] - mine[x]))
    commands.push(`SPAWN ${a} ${b} ${c}`)
    army++
  }
  // Move spare units towards the most wanted houses (nearest first).
  for (let h = 0; h < houseCount; h++) {
    let spare = mine[h] - need[h]
    if (spare <= 0) continue
    const dist = new Int32Array(houseCount).fill(-1)
    dist[h] = 0
    const q = [h]
    for (let i = 0; i < q.length; i++)
      for (const n of adj[q[i]])
        if (dist[n] < 0) {
          dist[n] = dist[q[i]] + 1
          q.push(n)
        }
    const targets = [...Array(houseCount).keys()]
      .filter(x => x !== h && dist[x] > 0 && wanted[x] > 0 && !deathTrap(x))
      .sort((x, y) => wanted[y] / dist[y] - wanted[x] / dist[x])
    for (const tgt of targets) {
      if (spare <= 0) break
      const send = Math.min(spare, Math.max(1, theirs[tgt] + 1 - mine[tgt]))
      commands.push(`MOVE ${h} ${tgt} ${send}`)
      wanted[tgt] = Math.max(0, wanted[tgt] - 0.5)
      spare -= send
    }
  }
  console.log(commands.length ? commands.join(";") : `MOVE 0 0 0`)
}
