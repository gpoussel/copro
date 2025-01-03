import { readFileSync } from "fs"
import { dirname, resolve } from "path"
import { fileURLToPath } from "url"

// 🧮 Project Euler - Problem 89

function reduceRoman(roman: string): string {
  return roman
    .replace("IIII", "IV") // 4 -> IV
    .replace("VIV", "IX") // 9 -> IX
    .replace("XXXX", "XL") // 40 -> XL
    .replace("LXL", "XC") // 90 -> XC
    .replace("CCCC", "CD") // 400 -> CD
    .replace("DCD", "CM") // 900 -> CM
}

function getGainedChars(roman: string): number {
  return roman.length - reduceRoman(roman).length
}

export function solve() {
  const filePath = resolve(dirname(fileURLToPath(import.meta.url)), "0089_roman.txt")
  const words = readFileSync(filePath, "utf-8").trim().split("\n")
  return words.map(word => getGainedChars(word)).reduce((acc, val) => acc + val, 0)
}
