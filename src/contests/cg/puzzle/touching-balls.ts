// 🎮 CodinGame Puzzle - touching-balls
// https://www.codingame.com/

const n: number = parseInt(readline(), 10)
const spheres: number[][] = []
for (let i = 0; i < n; i++) {
  const parts: number[] = readline().split(" ").map(Number)
  spheres.push(parts)
}

for (let i = 0; i < n; i++) {
  const [xi, yi, zi] = spheres[i]
  let maxR: number = Infinity
  for (let j = 0; j < n; j++) {
    if (j === i) continue
    const [xj, yj, zj, rj] = spheres[j]
    const dist: number = Math.sqrt((xi - xj) ** 2 + (yi - yj) ** 2 + (zi - zj) ** 2)
    const candidate: number = dist - rj
    if (candidate < maxR) maxR = candidate
  }
  if (maxR > spheres[i][3]) spheres[i][3] = maxR
}

let sum: number = 0
for (let i = 0; i < n; i++) {
  sum += spheres[i][3] ** 3
}

console.log(Math.round(sum))
