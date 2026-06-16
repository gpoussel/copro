// 🎮 CodinGame Puzzle - grandmas-serial-keys
// https://www.codingame.com/training/easy/grandmas-serial-keys

const username: string = readline()
const len: number = username.length

let asciiSum: number = 0
for (let i = 0; i < len; i++) {
  asciiSum += username.charCodeAt(i)
}

const seed: number = (asciiSum * len) ^ 20480

const first: number = seed & 65535
const second: number = seed >> 16
const third: number = (username.charCodeAt(0) + username.charCodeAt(len - 1)) * len
const final: number = (first + second + third) % 65536

const hex = (n: number): string => n.toString(16).toUpperCase().padStart(4, "0")

console.log(`${hex(first)}-${hex(second)}-${hex(third)}-${hex(final)}`)
