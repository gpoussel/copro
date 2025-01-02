// 🧮 Project Euler - Problem 84

const SQUARES = [
  "GO",
  "A1",
  "CC1",
  "A2",
  "T1",
  "R1",
  "B1",
  "CH1",
  "B2",
  "B3",
  "JAIL",
  "C1",
  "U1",
  "C2",
  "C3",
  "R2",
  "D1",
  "CC2",
  "D2",
  "D3",
  "FP",
  "E1",
  "CH2",
  "E2",
  "E3",
  "R3",
  "F1",
  "F2",
  "U2",
  "F3",
  "G2J",
  "G1",
  "G2",
  "CC3",
  "G3",
  "R4",
  "CH3",
  "H1",
  "T2",
  "H2",
]

const DICE_SIZE = 4

function rollDice() {
  return randomNumberInclusive(1, DICE_SIZE)
}

function randomNumberInclusive(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function solve() {
  let position = 0
  let doubleCounter = 0

  const stats = new Map<number, number>()
  function recordPosition() {
    stats.set(position, (stats.get(position) ?? 0) + 1)
  }

  for (let roll = 0; roll < 1_000_000; ++roll) {
    if (position === SQUARES.indexOf("JAIL")) {
      doubleCounter = 0
    }
    const dices = [rollDice(), rollDice()]
    if (dices[0] === dices[1]) {
      doubleCounter++
    } else {
      doubleCounter = 0
    }
    const dice = dices.reduce((a, b) => a + b, 0)
    position = (position + dice) % SQUARES.length

    if (SQUARES[position].startsWith("CC")) {
      const communityChestCard = randomNumberInclusive(1, 16)
      if (communityChestCard === 1) {
        position = SQUARES.indexOf("GO")
      } else if (communityChestCard === 2) {
        position = SQUARES.indexOf("JAIL")
      }
    } else if (SQUARES[position].startsWith("CH")) {
      const chanceCard = randomNumberInclusive(1, 16)
      if (chanceCard === 1) {
        position = SQUARES.indexOf("GO")
      } else if (chanceCard === 2) {
        position = SQUARES.indexOf("JAIL")
      } else if (chanceCard === 3) {
        position = SQUARES.indexOf("C1")
      } else if (chanceCard === 4) {
        position = SQUARES.indexOf("E3")
      } else if (chanceCard === 5) {
        position = SQUARES.indexOf("H2")
      } else if (chanceCard === 6) {
        position = SQUARES.indexOf("R1")
      } else if (chanceCard === 7 || chanceCard === 8) {
        position =
          [...SQUARES, ...SQUARES].findIndex((square, i) => square.startsWith("R") && i > position) % SQUARES.length
      } else if (chanceCard === 9) {
        position =
          [...SQUARES, ...SQUARES].findIndex((square, i) => square.startsWith("U") && i > position) % SQUARES.length
      } else if (chanceCard === 10) {
        position -= 3
      }
    }
    if (SQUARES[position] === "G2J" || doubleCounter === 3) {
      position = SQUARES.indexOf("JAIL")
    }
    recordPosition()
  }

  return [...stats.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([position]) => position.toString().padStart(2, "0"))
    .join("")
}
