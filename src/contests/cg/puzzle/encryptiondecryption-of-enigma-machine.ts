// 🎮 CodinGame Puzzle - encryptiondecryption-of-enigma-machine
// https://www.codingame.com/training/easy/encryptiondecryption-of-enigma-machine

const operation = readline()
const startShift = parseInt(readline())
const rotors: string[] = []
for (let i = 0; i < 3; i++) {
  rotors.push(readline())
}
const message = readline()

const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

function rotorEncode(ch: string, rotor: string): string {
  const idx = ALPHA.indexOf(ch)
  return rotor[idx]
}

function rotorDecode(ch: string, rotor: string): string {
  const idx = rotor.indexOf(ch)
  return ALPHA[idx]
}

function caesarShift(ch: string, shift: number): string {
  const idx = ALPHA.indexOf(ch)
  return ALPHA[(idx + shift) % 26]
}

function caesarUnshift(ch: string, shift: number): string {
  const idx = ALPHA.indexOf(ch)
  return ALPHA[(((idx - shift) % 26) + 26) % 26]
}

let result = ""

if (operation === "ENCODE") {
  for (let i = 0; i < message.length; i++) {
    let ch = message[i]
    // Step 1: Caesar shift by (startShift + i)
    ch = caesarShift(ch, startShift + i)
    // Step 2: Apply rotor I, II, III in order
    ch = rotorEncode(ch, rotors[0])
    ch = rotorEncode(ch, rotors[1])
    ch = rotorEncode(ch, rotors[2])
    result += ch
  }
} else {
  // DECODE
  for (let i = 0; i < message.length; i++) {
    let ch = message[i]
    // Step 1: Reverse rotor III, II, I
    ch = rotorDecode(ch, rotors[2])
    ch = rotorDecode(ch, rotors[1])
    ch = rotorDecode(ch, rotors[0])
    // Step 2: Reverse Caesar shift by (startShift + i)
    ch = caesarUnshift(ch, startShift + i)
    result += ch
  }
}

console.log(result)
