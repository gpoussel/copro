// 🎮 CodinGame Puzzle - video-assistant-referee
// https://www.codingame.com/training/easy/video-assistant-referee

type Player = { x: number; active: boolean }

const rows: string[] = []
for (let y = 0; y < 15; y++) {
  rows.push(readline())
}

const teamA: Player[] = []
const teamB: Player[] = []
let ballX = -1
let ballY = -1
let attackingA = false

for (let y = 0; y < rows.length; y++) {
  const row = rows[y]
  for (let x = 0; x < row.length; x++) {
    const c = row[x]
    if (c === "a" || c === "A") {
      teamA.push({ x, active: c === "A" })
    } else if (c === "b" || c === "B") {
      teamB.push({ x, active: c === "B" })
    } else if (c === "o" || c === "O") {
      ballX = x
      ballY = y
      attackingA = c === "o"
    }
  }
}

const isThrowIn = ballY === 0 || ballY === 14

const attackers = attackingA ? teamA : teamB
const defenders = attackingA ? teamB : teamA

let secondLastX = -1
if (defenders.length >= 2) {
  const xs = defenders.map(p => p.x).sort((p, q) => p - q)
  // TEAM_A attacks right->left: opponent goal at X=0, second-last = 2nd lowest X
  // TEAM_B attacks left->right: opponent goal at X=50, second-last = 2nd highest X
  secondLastX = attackingA ? xs[1] : xs[xs.length - 2]
}

let offsideCount = 0
let offence = false

if (!isThrowIn && defenders.length >= 2) {
  for (const p of attackers) {
    let inOpponentHalf: boolean
    let nearer: boolean
    if (attackingA) {
      inOpponentHalf = p.x < 25
      nearer = p.x < ballX && p.x < secondLastX
    } else {
      inOpponentHalf = p.x > 25
      nearer = p.x > ballX && p.x > secondLastX
    }
    if (inOpponentHalf && nearer) {
      offsideCount++
      if (p.active) {
        offence = true
      }
    }
  }
}

if (offsideCount === 0) {
  console.log("No player in an offside position.")
} else {
  console.log(`${offsideCount} player(s) in an offside position.`)
}
console.log(offence ? "VAR: OFFSIDE!" : "VAR: ONSIDE!")
