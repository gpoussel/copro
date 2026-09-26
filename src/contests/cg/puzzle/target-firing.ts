// 🎮 CodinGame Puzzle - target-firing
// https://www.codingame.com/training/medium/target-firing

interface Ship {
  turns: number
  damage: number
}

const n = Number(readline())
const ships: Ship[] = []
for (let i = 0; i < n; i++) {
  const [type, hpStr, armorStr, damageStr] = readline().split(" ")
  const beam = Math.max(1, (type === "FIGHTER" ? 20 : 10) - Number(armorStr))
  ships.push({ turns: Math.ceil(Number(hpStr) / beam), damage: Number(damageStr) })
}

// Smith's rule: minimize weighted completion time by sorting on turns / damage
ships.sort((a, b) => a.turns * b.damage - b.turns * a.damage)

let shields = 5000
let elapsed = 0
for (const ship of ships) {
  elapsed += ship.turns
  shields -= elapsed * ship.damage
}
console.log(shields < 0 ? "FLEE" : String(shields))
