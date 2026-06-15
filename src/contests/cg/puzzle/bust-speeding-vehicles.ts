// 🎮 CodinGame Puzzle - bust-speeding-vehicles
// https://www.codingame.com/training/medium/bust-speeding-vehicles

const L: number = parseInt(readline(), 10)
const N: number = parseInt(readline(), 10)

type Rec = { plate: string; dist: number; time: number }
const recs: Rec[] = []
for (let i = 0; i < N; i++) {
  const parts = readline().split(" ")
  recs.push({ plate: parts[0], dist: parseInt(parts[1], 10), time: parseInt(parts[2], 10) })
}

const out: string[] = []
for (let i = 1; i < recs.length; i++) {
  const a = recs[i - 1]
  const b = recs[i]
  if (a.plate !== b.plate) continue
  const dKm = b.dist - a.dist
  const dt = b.time - a.time
  if (dt <= 0) continue
  // speed = dKm/(dt/3600) > L  <=>  dKm*3600 > L*dt
  if (dKm * 3600 > L * dt) out.push(`${b.plate} ${b.dist}`)
}

console.log(out.length ? out.join("\n") : "OK")
