export const LOWERCASE_LETTERS = "abcdefghijklmnopqrstuvwxyz"
export const UPPERCASE_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

export function countSubstring(haystack: string, needle: string): number {
  let count = 0
  let index = 0
  while ((index = haystack.indexOf(needle, index)) !== -1) {
    index++
    count++
  }
  return count
}

export function isUpperCaseLetter(char: string): boolean {
  return char >= "A" && char <= "Z"
}

export function isPalindrome(s: string): boolean {
  return s === reverse(s)
}

export function reverse(s: string): string {
  return s.split("").reverse().join("")
}
