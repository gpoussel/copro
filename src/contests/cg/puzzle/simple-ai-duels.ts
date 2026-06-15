// 🎮 CodinGame Puzzle - simple-ai-duels
// https://www.codingame.com/

type Action = "C" | "D"

const C = 2
const D = 1
const T = 3
const F = 0

let lcg = 12

function nextRand(): Action {
  lcg = (137 * lcg + 187) % 256
  let bits = 0
  let v = lcg
  while (v > 0) {
    bits += v & 1
    v >>= 1
  }
  return bits % 2 === 0 ? "D" : "C"
}

interface AI {
  name: string
  commands: string[][]
  history: Action[]
  reward: number
}

function countMore(actions: Action[], x: Action): boolean {
  let cnt = 0
  for (const a of actions) {
    if (a === x) cnt++
  }
  return cnt * 2 > actions.length
}

function decide(me: AI, opp: AI, turn: number): Action {
  for (const cmd of me.commands) {
    const head = cmd[0]
    if (head === "*") {
      return resolve(cmd[1])
    } else if (head === "START") {
      if (turn === 0) return resolve(cmd[1])
    } else if (head === "ME" || head === "OPP") {
      const who = head === "ME" ? me : opp
      const what = cmd[1]
      if (what === "-1") {
        const x = cmd[2] as Action
        const y = cmd[3]
        if (who.history.length > 0 && who.history[who.history.length - 1] === x) {
          return resolve(y)
        }
      } else if (what === "MAX") {
        const x = cmd[2] as Action
        const y = cmd[3]
        if (countMore(who.history, x)) return resolve(y)
      } else if (what === "LAST") {
        const n = parseInt(cmd[2], 10)
        const x = cmd[3] as Action
        const y = cmd[4]
        const slice = who.history.slice(Math.max(0, who.history.length - n))
        if (countMore(slice, x)) return resolve(y)
      } else if (what === "WIN") {
        const y = cmd[2]
        if (me.reward > opp.reward) return resolve(y)
      }
    }
  }
  return "C"
}

function resolve(y: string): Action {
  if (y === "RAND") return nextRand()
  return y as Action
}

const nbTurns = parseInt(readline(), 10)

const firstHeader = readline().split(" ")
const n = parseInt(firstHeader[0], 10)
const ai1: AI = { name: firstHeader[1], commands: [], history: [], reward: 0 }
for (let i = 0; i < n; i++) {
  ai1.commands.push(readline().split(" "))
}

const secondHeader = readline().split(" ")
const m = parseInt(secondHeader[0], 10)
const ai2: AI = { name: secondHeader[1], commands: [], history: [], reward: 0 }
for (let i = 0; i < m; i++) {
  ai2.commands.push(readline().split(" "))
}

for (let turn = 0; turn < nbTurns; turn++) {
  const a1 = decide(ai1, ai2, turn)
  const a2 = decide(ai2, ai1, turn)
  if (a1 === "C" && a2 === "C") {
    ai1.reward += C
    ai2.reward += C
  } else if (a1 === "D" && a2 === "D") {
    ai1.reward += D
    ai2.reward += D
  } else if (a1 === "D") {
    ai1.reward += T
    ai2.reward += F
  } else {
    ai1.reward += F
    ai2.reward += T
  }
  ai1.history.push(a1)
  ai2.history.push(a2)
}

if (ai1.reward > ai2.reward) {
  console.log(ai1.name)
} else if (ai2.reward > ai1.reward) {
  console.log(ai2.name)
} else {
  console.log("DRAW")
}
