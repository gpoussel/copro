// 🎮 CodinGame Puzzle - enigma---3-rotors-without-plugboard
// https://www.codingame.com/training/medium/enigma---3-rotors-without-plugboard

const code = (ch: string) => ch.charCodeAt(0) - 65
const mod26 = (x: number) => ((x % 26) + 26) % 26

// Wiring as a forward table (at position A) and its inverse
const readWiring = (): { forward: number[]; backward: number[] } => {
  const forward: number[] = new Array(26).fill(0)
  const backward: number[] = new Array(26).fill(0)
  for (const wire of readline().trim().split(/\s+/)) {
    const [from, to] = wire.split("-").map(code)
    forward[from] = to
    backward[to] = from
  }
  return { forward, backward }
}

const rotors: { forward: number[]; backward: number[]; trigger: number }[] = []
for (let i = 0; i < 3; i++) {
  const wiring = readWiring()
  rotors.push({ ...wiring, trigger: code(readline().trim()) })
}
const reflector = readWiring().forward
const positions = readline().trim().split(/\s+/).map(code)
const message = readline().trim()

let rotateSecond: boolean = false
let rotateThird: boolean = false
let output = ""
for (const ch of message) {
  // Stepping happens before the letter is encoded
  const stepSecond: boolean = rotateSecond || rotateThird
  const stepThird: boolean = rotateThird
  positions[0] = mod26(positions[0] + 1)
  if (stepSecond) positions[1] = mod26(positions[1] + 1)
  if (stepThird) positions[2] = mod26(positions[2] + 1)
  rotateSecond = positions[0] === rotors[0].trigger
  rotateThird = stepSecond && positions[1] === rotors[1].trigger

  // A rotor at offset k maps x to wiring[x + k] - k
  let x = code(ch)
  for (let r = 0; r < 3; r++) x = mod26(rotors[r].forward[mod26(x + positions[r])] - positions[r])
  x = reflector[x]
  for (let r = 2; r >= 0; r--) x = mod26(rotors[r].backward[mod26(x + positions[r])] - positions[r])
  output += String.fromCharCode(65 + x)
}
console.log(output)
