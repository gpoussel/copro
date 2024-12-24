import { clearBits, nextClearBit, nextSetBit, setBit, setBits } from "./bitset.js"

export function mapBy<T, K>(arr: T[], key: (item: T) => K): Map<K, T[]> {
  const map = new Map<K, T[]>()
  for (const item of arr) {
    const k = key(item)
    if (!map.has(k)) {
      map.set(k, [])
    }
    map.get(k)!.push(item)
  }
  return map
}

export function count<T>(arr: T[], key: T): number {
  return arr.reduce((acc, item) => acc + (item === key ? 1 : 0), 0)
}

export function countBy<T, K>(arr: Iterable<T>, key: (item: T) => K): Map<K, number> {
  const map = new Map<K, number>()
  for (const item of arr) {
    const k = key(item)
    if (!map.has(k)) {
      map.set(k, 0)
    }
    map.set(k, map.get(k)! + 1)
  }
  return map
}

export function arrayEquals<T>(a: T[], b: T[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i])
}

export function swap<K>(array: K[], index1: number, index2: number) {
  const temp = array[index1]
  array[index1] = array[index2]
  array[index2] = temp
}

export function permutations<T>(array: T[], cmpFn?: (a: T, B: T) => number): T[][] {
  const result: T[][] = []
  const compare = cmpFn || ((a: T, b: T) => (a > b ? 1 : a < b ? -1 : 0))
  const sortedCombination = array.slice().sort((a, b) => compare(a, b))
  result.push(sortedCombination.slice())

  while (true) {
    let k = -1
    for (let i = 0; i < array.length - 1; i++) {
      if (compare(array[i], array[i + 1]) < 0) {
        k = i
      }
    }
    if (k === -1) {
      break
    }
    let l = -1
    for (let i = k + 1; i < array.length; i++) {
      if (compare(array[k], array[i]) < 0) {
        l = i
      }
    }
    if (l === -1) {
      break
    }
    swap(array, k, l)
    const reversed = array.splice(k + 1).reverse()
    array.push(...reversed)
    result.push(array.slice())
  }
  return result
}

export function* combinations<T>(values: Iterable<T>, size: number) {
  const byIndex = new Map(Array.from(values, (v, k) => [k, v]))
  for (
    let bits = 2 ** size - 1, firstSetBit = 0, bitToFlip = -1;
    bitToFlip !== byIndex.size;
    firstSetBit = nextSetBit(bits, 0),
      bitToFlip = nextClearBit(bits, firstSetBit),
      bits = setBits(bits, 0, bitToFlip - firstSetBit - 1),
      bits = clearBits(bits, bitToFlip - firstSetBit - 1, bitToFlip),
      bits = setBit(bits, bitToFlip)
  ) {
    const combination: T[] = []
    for (let index = nextSetBit(bits); index !== -1; index = nextSetBit(bits, index + 1)) {
      combination.push(byIndex.get(index)!)
    }
    yield combination
  }
}

export function intersectionBy<T, V>(a: T[], b: T[], mapper: (k: T) => V): T[] {
  const other = b.map(mapper)
  return a.filter(value => other.includes(mapper(value)))
}

export function differenceBy<T, V>(a: T[], b: T[], mapper: (k: T) => V): T[] {
  const other = b.map(mapper)
  return a.filter(value => !other.includes(mapper(value)))
}

export function range(start: number, end: number, inc = 1) {
  const iterationCount = Math.floor((end - start) / inc)
  return Array.from({ length: iterationCount }, (_, i) => start + i * inc)
}

export function union<T>(a: T[], b: T[]): T[] {
  return Array.from(new Set([...a, ...b]))
}

export function min(numbers: number[]) {
  if (numbers.length === 0) {
    return -Infinity
  }
  return numbers.reduce((acc, n) => (n < acc ? n : acc), numbers[0])
}

export function max(numbers: number[]) {
  if (numbers.length === 0) {
    return Infinity
  }
  return numbers.reduce((acc, n) => (n > acc ? n : acc), numbers[0])
}

export function maxBy<T>(values: T[], key: (item: T) => number): T | undefined {
  return values.reduce((acc, value) => (key(value) > key(acc) ? value : acc), values[0])
}

export function combinationsFromRangeToSum(count: number, sum: number): number[][] {
  if (count === 1) {
    return [[sum]]
  }
  const results: number[][] = []
  for (let i = 0; i <= sum; i++) {
    for (const rest of combinationsFromRangeToSum(count - 1, sum - i)) {
      results.push([i, ...rest])
    }
  }
  return results
}

export function invertMap<K, V>(map: Map<K, V[]>): Map<V, K[]> {
  const result = new Map<V, K[]>()
  for (const [k, v] of map.entries()) {
    for (const value of v) {
      if (!result.has(value)) {
        result.set(value, [])
      }
      result.get(value)!.push(k)
    }
  }
  return result
}
