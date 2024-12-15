export function countSubstring(haystack: string, needle: string): number {
  let count = 0
  let index = 0
  while ((index = haystack.indexOf(needle, index)) !== -1) {
    index++
    count++
  }
  return count
}
