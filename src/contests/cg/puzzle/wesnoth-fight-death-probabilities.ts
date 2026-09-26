// 🎮 CodinGame Puzzle - wesnoth-fight-death-probabilities
// https://www.codingame.com/training/medium/wesnoth-fight-death-probabilities

interface Unit {
  hp: number
  blows: number
  toHit: number
  damage: number
}

const readUnit = (): Unit => {
  const [, hp, blows, toHit, damage] = readline().trim().split(/\s+/)
  return { hp: +hp, blows: +blows, toHit: +toHit / 100, damage: +damage }
}
const units = [readUnit(), readUnit()]
const death = [0, 0]

// Explore every hit/miss sequence, weighting outcomes by their probability
const fight = (hp: number[], blowsLeft: number[], turn: number, probability: number): void => {
  if (blowsLeft[0] === 0 && blowsLeft[1] === 0) return
  if (blowsLeft[turn] === 0) turn = 1 - turn
  const attacker = units[turn]
  const target = 1 - turn
  const nextBlows = blowsLeft.slice()
  nextBlows[turn]--

  const hitHp = hp.slice()
  hitHp[target] -= attacker.damage
  if (hitHp[target] <= 0) death[target] += probability * attacker.toHit
  else fight(hitHp, nextBlows, target, probability * attacker.toHit)

  fight(hp, nextBlows, target, probability * (1 - attacker.toHit))
}

fight(
  units.map(u => u.hp),
  units.map(u => u.blows),
  0,
  1,
)
console.log(death.map(p => Math.round(p * 100)).join(" "))
