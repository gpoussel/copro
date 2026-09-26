// 🎮 CodinGame Puzzle - simplified-monopoly-turns-prediction
// https://www.codingame.com/training/medium/simplified-monopoly-turns-prediction

const BOARD_SIZE = 40
const JAIL = 10
const GO_TO_JAIL = 30

interface MonopolyPlayer {
  playerName: string
  position: number
  inJail: boolean
  failedThrows: number
}

const playerCount = parseInt(readline())
const players: MonopolyPlayer[] = []
for (let i = 0; i < playerCount; i++) {
  const [playerName, position] = readline().split(" ")
  players.push({ playerName, position: parseInt(position), inJail: false, failedThrows: 0 })
}
const rollCount = parseInt(readline())
const rolls: [number, number][] = []
for (let i = 0; i < rollCount; i++) {
  const [a, b] = readline().split(" ").map(Number)
  rolls.push([a, b])
}
// The 40 board lines are not needed

let rollIndex = 0

function sendToJail(player: MonopolyPlayer): void {
  player.position = JAIL
  player.inJail = true
  player.failedThrows = 0
}

function playTurn(player: MonopolyPlayer): void {
  if (player.inJail) {
    const [a, b] = rolls[rollIndex++]
    if (a === b || ++player.failedThrows === 3) {
      player.inJail = false
      player.position = (player.position + a + b) % BOARD_SIZE
    }
    return
  }
  let doubles = 0
  while (rollIndex < rolls.length) {
    const [a, b] = rolls[rollIndex++]
    if (a === b && ++doubles === 3) {
      sendToJail(player)
      return
    }
    player.position = (player.position + a + b) % BOARD_SIZE
    if (player.position === GO_TO_JAIL) {
      sendToJail(player)
      return
    }
    if (a !== b) return
  }
}

for (let turn = 0; rollIndex < rolls.length; turn++) {
  playTurn(players[turn % playerCount])
}
console.log(players.map(p => `${p.playerName} ${p.position}`).join("\n"))
