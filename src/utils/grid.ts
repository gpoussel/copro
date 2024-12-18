import { positiveModulo } from "./math.js"

export function build<K>(grid: K[][], printer?: (item: K) => string) {
  const print = printer || ((item: K) => `${item}`)
  return grid.map(row => row.map(print).join("")).join("\n")
}

export type Direction = "up" | "right" | "down" | "left"
export const DIRECTIONS: Direction[] = ["up", "right", "down", "left"] as const
export const VISITED = "~"
export const DIRECTION_CHARS = {
  up: "^",
  down: "v",
  left: "<",
  right: ">",
} as const

export function fromDirectionChar(char: string) {
  return Object.entries(DIRECTION_CHARS).find(([, value]) => value === char)?.[0] as Direction
}

export function nextDirClockwise(dir: Direction) {
  return DIRECTIONS[(DIRECTIONS.indexOf(dir) + 1) % DIRECTIONS.length]
}

export function nextDirCounterClockwise(dir: Direction) {
  return DIRECTIONS[(DIRECTIONS.indexOf(dir) + 3) % DIRECTIONS.length]
}

export type Heading = Direction | "up-right" | "down-right" | "down-left" | "up-left"
export const HEADING_DIRECTIONS: Heading[] = [...DIRECTIONS, "up-right", "down-right", "down-left", "up-left"] as const

export type Direction3D = "up" | "right" | "down" | "left" | "forward" | "backward"
export const DIRECTIONS_3D: Direction3D[] = ["up", "right", "down", "left", "forward", "backward"] as const

export function iterate<K, V>(
  grid: K[][],
  callback: (item: K, x: number, y: number) => V,
  filter?: (item: K) => boolean
) {
  const result: V[] = []
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (filter && !filter(grid[y][x])) {
        continue
      }
      result.push(callback(grid[y][x], x, y))
    }
  }
  return result
}

export function map<K, V>(grid: K[][], callback: (item: K, x: number, y: number) => V) {
  return grid.map((row, y) => row.map((item, x) => callback(item, x, y)))
}

export function find<K>(grid: K[][], predicate: (item: K) => boolean) {
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (predicate(grid[y][x])) {
        return { x, y }
      }
    }
  }
}

export function findPositions<K>(grid: K[][], predicate: (item: K) => boolean) {
  return iterate(grid, (_, x, y) => ({ x, y }), predicate)
}

export function at<K>(grid: K[][], position: { x: number; y: number }) {
  return grid[position.y]?.[position.x]
}

export function modulo<K>(grid: K[][], position: { x: number; y: number }) {
  const y = positiveModulo(position.y, grid.length)
  const x = positiveModulo(position.x, grid[y].length)
  return { x, y }
}

export function moduloHorizontal<K>(grid: K[][], position: { x: number; y: number }) {
  if (position.y < 0 || position.y >= grid.length) {
    return position
  }
  return { x: positiveModulo(position.x, grid[position.y].length), y: position.y }
}

export function set<K>(grid: K[][], position: { x: number; y: number }, value: K) {
  if (inBounds(grid, position)) {
    grid[position.y][position.x] = value
  }
}

export function countBy(grid: string[][], predicate: (item: string) => boolean) {
  return grid.flat().filter(predicate).length
}

export function inBounds<K>(grid: K[][], position: { x: number; y: number }) {
  return position.y >= 0 && position.y < grid.length && position.x >= 0 && position.x < grid[position.y].length
}

export function clone<K>(grid: K[][]): K[][]
export function clone<K, V>(grid: K[][], mapper: (item: K) => V): V[][]
export function clone<K, V>(grid: K[][], mapper?: (item: K) => V): K[][] | V[][] {
  if (mapper) {
    return grid.map(row => row.map(mapper))
  }
  return grid.map(row => [...row])
}

export function uniqueElements<K>(grid: K[][]) {
  return [...new Set<K>(iterate(grid, item => item))]
}

export function columns<K>(grid: K[][]) {
  return Array.from({ length: grid[0].length }, () => 0).map((_, i) => grid.map(row => row[i]))
}
