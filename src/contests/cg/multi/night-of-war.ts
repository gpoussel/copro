// 🎮 CodinGame Multiplayer - night-of-war
// https://www.codingame.com/multiplayer/bot-programming/night-of-war
//
// One action per turn for the whole army. A soldier cannot move backwards
// (relative to where it faces) and attacks enemies within distance 2 that are
// not behind it (35 bucks, needs level ≥ target's). Each owned block pays 2
// per turn. Plan: attack whenever a valid target exists and we can pay;
// otherwise the move that takes an unowned block without ending in a spot an
// enemy can attack.

const DIRS = ["UP", "LEFT", "DOWN", "RIGHT"] // matches the direction codes
const DX = [0, -1, 0, 1]
const DY = [-1, 0, 1, 0]
const ATTACK_COST = 35

const myId = parseInt(readline())
const size = parseInt(readline())

interface Soldier {
  owner: number
  x: number
  y: number
  id: number
  level: number
  dir: number
}
// Can `a` (facing a.dir) attack the cell (x, y)?
function covers(a: Soldier, x: number, y: number): boolean {
  const dx = x - a.x
  const dy = y - a.y
  const d = Math.abs(dx) + Math.abs(dy)
  if (d === 0 || d > 2) return false
  return dx * DX[a.dir] + dy * DY[a.dir] >= 0 // not behind
}

while (true) {
  const myBucks = parseInt(readline())
  const oppBucks = parseInt(readline())
  const owner = new Int8Array(size * size).fill(-1)
  for (let i = 0; i < size * size; i++) {
    const [o, x, y] = readline().split(" ").map(Number)
    owner[y * size + x] = o
  }
  const n = parseInt(readline())
  const soldiers: Soldier[] = []
  for (let i = 0; i < n; i++) {
    const [o, x, y, id, level, dir] = readline().split(" ").map(Number)
    soldiers.push({ owner: o, x, y, id, level, dir })
  }
  const mine = soldiers.filter(s => s.owner === myId)
  const theirs = soldiers.filter(s => s.owner !== myId)

  let action = "WAIT"
  // 1. Attack.
  if (myBucks >= ATTACK_COST) {
    outer: for (const a of mine) {
      for (const t of theirs) {
        if (t.level <= a.level && covers(a, t.x, t.y)) {
          action = `ATTACK ${a.id} ${t.id}`
          break outer
        }
      }
    }
  }
  // 2. Move: take blocks, stay out of enemy reach.
  if (action === "WAIT") {
    let bestScore = -Infinity
    const occupied = new Set(soldiers.map(s => s.y * size + s.x))
    for (const s of mine) {
      for (let d = 0; d < 4; d++) {
        if (d === (s.dir + 2) % 4) continue // no moving backwards
        const nx = s.x + DX[d]
        const ny = s.y + DY[d]
        if (nx < 0 || ny < 0 || nx >= size || ny >= size || occupied.has(ny * size + nx)) continue
        const moved: Soldier = { ...s, x: nx, y: ny, dir: d }
        const danger = oppBucks >= ATTACK_COST && theirs.some(t => t.level >= s.level && covers(t, nx, ny))
        const threat = theirs.some(t => t.level <= s.level && covers(moved, t.x, t.y))
        const gain = owner[ny * size + nx] === myId ? 0 : owner[ny * size + nx] === -1 ? 2 : 3
        const score = gain - (danger ? 10 : 0) + (threat && myBucks >= ATTACK_COST ? 1 : 0)
        if (score > bestScore) {
          bestScore = score
          action = `MOVE ${s.id} ${DIRS[d]}`
        }
      }
    }
  }
  console.log(action)
}
