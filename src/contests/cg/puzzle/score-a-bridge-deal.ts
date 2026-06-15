// 🎮 CodinGame Puzzle - score-a-bridge-deal
// https://www.codingame.com/

const nbTests: number = parseInt(readline(), 10)

function scoreDeal(line: string): number {
  const parts: string[] = line.split(" ")
  const vuln: boolean = parts[0] === "V"
  const contract: string = parts[1]
  if (contract === "Pass") {
    return 0
  }
  const tricksWon: number = parseInt(parts[2], 10)

  // Parse level, suit, doubling
  const level: number = parseInt(contract[0], 10)
  let rest: string = contract.slice(1)
  let doubled: number = 1 // 1 = none, 2 = doubled, 4 = redoubled
  if (rest.endsWith("XX")) {
    doubled = 4
    rest = rest.slice(0, -2)
  } else if (rest.endsWith("X")) {
    doubled = 2
    rest = rest.slice(0, -1)
  }
  const suit: string = rest // C, D, H, S, NT

  const needed: number = level + 6
  const made: boolean = tricksWon >= needed

  if (made) {
    // Contract trick value
    let contractScore: number = 0
    if (suit === "C" || suit === "D") {
      contractScore = level * 20
    } else if (suit === "H" || suit === "S") {
      contractScore = level * 30
    } else {
      // NT: first trick 40, others 30
      contractScore = 40 + (level - 1) * 30
    }
    contractScore *= doubled

    let score: number = contractScore

    // Game bonus
    if (contractScore >= 100) {
      score += vuln ? 500 : 300
    } else {
      score += 50
    }

    // Slam bonuses
    if (level === 6) {
      score += vuln ? 750 : 500
    } else if (level === 7) {
      score += vuln ? 1500 : 1000
    }

    // Overtricks
    const overtricks: number = tricksWon - needed
    if (overtricks > 0) {
      if (doubled === 1) {
        let perTrick: number = 0
        if (suit === "C" || suit === "D") {
          perTrick = 20
        } else if (suit === "H" || suit === "S") {
          perTrick = 30
        } else {
          perTrick = 30
        }
        score += overtricks * perTrick
      } else {
        const base: number = vuln ? 200 : 100
        score += overtricks * base * (doubled === 4 ? 2 : 1)
      }
    }

    // Insult bonus for making doubled/redoubled
    if (doubled === 2) {
      score += 50
    } else if (doubled === 4) {
      score += 100
    }

    return score
  } else {
    // Undertricks
    const under: number = needed - tricksWon
    let penalty: number = 0
    if (doubled === 1) {
      penalty = under * (vuln ? 100 : 50)
    } else {
      // doubled penalties (per-undertrick), then *2 for redoubled
      let dblPenalty: number = 0
      for (let i = 1; i <= under; i++) {
        if (vuln) {
          dblPenalty += i === 1 ? 200 : 300
        } else {
          if (i === 1) {
            dblPenalty += 100
          } else if (i === 2 || i === 3) {
            dblPenalty += 200
          } else {
            dblPenalty += 300
          }
        }
      }
      penalty = dblPenalty * (doubled === 4 ? 2 : 1)
    }
    return -penalty
  }
}

const out: string[] = []
for (let i = 0; i < nbTests; i++) {
  out.push(String(scoreDeal(readline())))
}
console.log(out.join("\n"))
