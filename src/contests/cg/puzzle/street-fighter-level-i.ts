// 🎮 CodinGame Puzzle - street-fighter-level-i
// https://www.codingame.com/training/easy/street-fighter-level-i

interface Fighter {
  name: string
  life: number
  rage: number
  hitsMade: number
  damageReceived: number
}

const stats: { [name: string]: number } = {
  KEN: 25,
  RYU: 25,
  TANK: 50,
  VLAD: 30,
  JADE: 20,
  ANNA: 18,
  JUN: 60,
}

const punch: { [name: string]: number } = {
  KEN: 6,
  RYU: 4,
  TANK: 2,
  VLAD: 3,
  JADE: 2,
  ANNA: 9,
  JUN: 2,
}

const kick: { [name: string]: number } = {
  KEN: 5,
  RYU: 5,
  TANK: 2,
  VLAD: 3,
  JADE: 7,
  ANNA: 1,
  JUN: 1,
}

const [name1, name2] = readline().split(" ")
const n = parseInt(readline(), 10)

const make = (name: string): Fighter => ({
  name,
  life: stats[name],
  rage: 0,
  hitsMade: 0,
  damageReceived: 0,
})

const c1 = make(name1)
const c2 = make(name2)

const apply = (attacker: Fighter, defender: Fighter, attack: string): void => {
  let damage = 0
  if (attack === "PUNCH") {
    damage = punch[attacker.name]
  } else if (attack === "KICK") {
    damage = kick[attacker.name]
  } else {
    // SPECIAL
    switch (attacker.name) {
      case "KEN":
        damage = 3 * attacker.rage
        break
      case "RYU":
        damage = 4 * attacker.rage
        break
      case "TANK":
        damage = 2 * attacker.rage
        break
      case "VLAD":
        damage = 2 * (attacker.rage + defender.rage)
        defender.rage = 0
        break
      case "JADE":
        damage = attacker.hitsMade * attacker.rage
        break
      case "ANNA":
        damage = attacker.damageReceived * attacker.rage
        break
      case "JUN":
        damage = 1 * attacker.rage
        break
    }
    attacker.rage = 0
  }

  defender.life -= damage
  defender.rage += 1
  defender.damageReceived += damage
  attacker.hitsMade += 1

  if (attacker.name === "JUN" && attack === "SPECIAL") {
    attacker.life += damage
  }
}

for (let i = 0; i < n; i++) {
  const [d, attack] = readline().split(" ")
  if (d === ">") {
    apply(c1, c2, attack)
  } else {
    apply(c2, c1, attack)
  }
  if (c1.life <= 0 || c2.life <= 0) {
    break
  }
}

const winner = c1.life > c2.life ? c1 : c2
const loser = winner === c1 ? c2 : c1
console.log(`${winner.name} beats ${loser.name} in ${winner.hitsMade} hits`)
