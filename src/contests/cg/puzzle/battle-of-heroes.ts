// 🎮 CodinGame Puzzle - battle-of-heroes
// https://www.codingame.com/training/easy/battle-of-heroes

interface Stack {
  name: string
  amount: number
  health: number
  damage: number
  frontHp: number
}

function parse(line: string): Stack {
  const parts: string[] = line.split(";")
  const health: number = parseInt(parts[2], 10)
  return {
    name: parts[0],
    amount: parseInt(parts[1], 10),
    health,
    damage: parseInt(parts[3], 10),
    frontHp: health,
  }
}

const s1: Stack = parse(readline())
const s2: Stack = parse(readline())

const out: string[] = []

function attack(attacker: Stack, defender: Stack): void {
  const dmg: number = attacker.amount * attacker.damage
  out.push(
    `${attacker.amount} ${attacker.name}(s) attack(s) ${defender.amount} ${defender.name}(s) dealing ${dmg} damage`
  )
  let remaining: number = dmg
  let perished: number = 0
  // damage the partially-wounded front unit first
  if (remaining >= defender.frontHp) {
    remaining -= defender.frontHp
    perished += 1
    defender.frontHp = defender.health
    const full: number = Math.min(Math.floor(remaining / defender.health), defender.amount - perished)
    perished += full
    remaining -= full * defender.health
    defender.frontHp -= remaining
    if (defender.frontHp <= 0) {
      defender.frontHp = defender.health
    }
  } else {
    defender.frontHp -= remaining
  }
  if (perished > defender.amount) {
    perished = defender.amount
  }
  defender.amount -= perished
  if (defender.amount <= 0) {
    defender.amount = 0
    defender.frontHp = defender.health
  }
  out.push(`${perished} unit(s) perish`)
}

let round: number = 0
while (true) {
  round += 1
  out.push(`Round ${round}`)
  attack(s1, s2)
  out.push("----------")
  if (s2.amount <= 0) {
    out.push(`${s1.name} won! ${s1.amount} unit(s) left`)
    break
  }
  attack(s2, s1)
  out.push("##########")
  if (s1.amount <= 0) {
    out.push(`${s2.name} won! ${s2.amount} unit(s) left`)
    break
  }
}

console.log(out.join("\n"))
