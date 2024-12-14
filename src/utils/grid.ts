export function build<K>(grid: K[][], printer?: (item: K) => string) {
  const print = printer || ((item: K) => `${item}`)
  return grid.map(row => row.map(print).join("")).join("\n")
}
