// 🎮 CodinGame Puzzle - risk-odds-calculator
// https://www.codingame.com/training/medium/risk-odds-calculator

const attack = parseInt(readline())
const defense = parseInt(readline())

// outcomes[ad][dd] maps "attacker losses" to probability for one round
function roundOutcomes(ad: number, dd: number): number[] {
  const probs = [0, 0, 0]
  const total = 6 ** (ad + dd)
  for (let code = 0; code < total; code++) {
    const dice: number[] = []
    let rest = code
    for (let i = 0; i < ad + dd; i++) {
      dice.push((rest % 6) + 1)
      rest = Math.floor(rest / 6)
    }
    const att = dice.slice(0, ad).sort((x, y) => y - x)
    const def = dice.slice(ad).sort((x, y) => y - x)
    let attackerLosses = 0
    for (let i = 0; i < Math.min(ad, dd); i++) if (att[i] <= def[i]) attackerLosses++
    probs[attackerLosses] += 1 / total
  }
  return probs
}
const outcomes: number[][][] = [[]]
for (let ad = 1; ad <= 3; ad++) {
  outcomes.push([[]])
  for (let dd = 1; dd <= 2; dd++) outcomes[ad].push(roundOutcomes(ad, dd))
}

// win[a][d]: probability that the attacker eliminates the defender
const win: number[][] = []
for (let a = 0; a <= attack; a++) {
  win.push([])
  for (let d = 0; d <= defense; d++) {
    if (d === 0) win[a].push(1)
    else if (a === 0) win[a].push(0)
    else {
      const ad = Math.min(a, 3)
      const dd = Math.min(d, 2)
      const fights = Math.min(ad, dd)
      let p = 0
      outcomes[ad][dd].forEach((prob, attackerLosses) => {
        if (prob > 0) p += prob * win[a - attackerLosses][d - (fights - attackerLosses)]
      })
      win[a].push(p)
    }
  }
}

console.log(`${(win[attack][defense] * 100).toFixed(2)}%`)
