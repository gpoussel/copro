// 🎮 CodinGame Puzzle - cosmic-love
// https://www.codingame.com/training/easy/cosmic-love

const N = parseInt(readline())

interface Planet {
  name: string
  r: number
  m: number
  c: number
  density: number
}

const planets: Planet[] = []

for (let i = 0; i < N; i++) {
  const parts = readline().split(" ")
  const name = parts[0]
  const r = parseFloat(parts[1])
  const m = parseFloat(parts[2])
  const c = parseFloat(parts[3])
  const volume = (4 / 3) * Math.PI * r * r * r
  const density = m / volume
  planets.push({ name, r, m, c, density })
}

const alice = planets.find(p => p.name === "Alice")!

// For each non-Alice planet, compute the Roche limit
// Roche limit = rA * cubeRoot(2 * dA / dP)
// Planet is safe if its distance c >= Roche limit

const safePlanets = planets.filter(p => {
  if (p.name === "Alice") return false
  const rocheLimit = alice.r * Math.cbrt((2 * alice.density) / p.density)
  return p.c >= rocheLimit
})

// Find the closest safe planet (smallest c)
safePlanets.sort((a, b) => a.c - b.c)
console.log(safePlanets[0].name)
