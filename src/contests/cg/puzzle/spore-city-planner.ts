// 🎮 CodinGame Puzzle - spore-city-planner
// https://www.codingame.com/training/medium/spore-city-planner

const HOUSE = 0
const ENTERTAINMENT = 1
const FACTORY = 2

const n = Number(readline())
const l = Number(readline())
const links: [number, number][] = []
for (let i = 0; i < l; i++) {
  const [a, b] = readline().split(" ").map(Number)
  links.push([a, b])
}

// Place 0 is the City Hall (a house); try every assignment of the other places
const types: number[] = new Array<number>(n + 1).fill(HOUSE)
let best = 0
const total = Math.pow(3, n)
for (let code = 0; code < total; code++) {
  let rest = code
  let happiness = 0
  for (let place = 1; place <= n; place++) {
    types[place] = rest % 3
    rest = Math.floor(rest / 3)
    if (types[place] === ENTERTAINMENT) happiness++
    else if (types[place] === FACTORY) happiness--
  }
  let production = 0
  for (const [a, b] of links) {
    const ta = types[a]
    const tb = types[b]
    if (ta === tb) continue
    if (ta !== ENTERTAINMENT && tb !== ENTERTAINMENT) production++ // house - factory
    else if (ta !== FACTORY && tb !== FACTORY) happiness++ // house - entertainment
    else happiness-- // factory - entertainment
  }
  if (happiness >= 0 && production > best) best = production
}
console.log(best)
