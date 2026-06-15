// 🎮 CodinGame Puzzle - agent-x-mission-1-the-caesar-cipher
// https://www.codingame.com/

const ciphertext: string = readline()
const word: string = readline()

function decrypt(text: string, key: number): string {
  let out: string = ""
  for (const ch of text) {
    const code: number = ch.charCodeAt(0)
    const shifted: number = ((((code - 32 - key) % 95) + 95) % 95) + 32
    out += String.fromCharCode(shifted)
  }
  return out
}

for (let key = 0; key < 95; key++) {
  const plain: string = decrypt(ciphertext, key)
  const tokens: string[] = plain.split(new RegExp("[ ,.?;:!]"))
  if (tokens.indexOf(word) !== -1) {
    console.log(String(key))
    console.log(plain)
    break
  }
}
