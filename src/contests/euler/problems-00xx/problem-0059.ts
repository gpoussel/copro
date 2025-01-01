// 🧮 Project Euler - Problem 59

import { readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { LOWERCASE_LETTERS } from "../../../utils/string.js"

function decrypt(numbers: number[], key: number[]): string {
  let result = ""
  for (let i = 0; i < numbers.length; i++) {
    result += String.fromCharCode(numbers[i] ^ key[i % key.length])
  }
  return result
}

export function solve() {
  const filePath = resolve(dirname(fileURLToPath(import.meta.url)), "0059_cipher.txt")
  const numbers = readFileSync(filePath, "utf-8").split(",").map(Number)
  for (const letter1 of LOWERCASE_LETTERS) {
    for (const letter2 of LOWERCASE_LETTERS) {
      for (const letter3 of LOWERCASE_LETTERS) {
        const key = [letter1, letter2, letter3].map(letter => letter.charCodeAt(0))
        const decrypted = decrypt(numbers, key)
        if (decrypted.includes(" the ")) {
          return decrypted.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
        }
      }
    }
  }
}
