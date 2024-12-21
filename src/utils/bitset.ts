export function setBit(bits: number, index: number) {
  const mask = 2 ** index
  return bits | mask
}

export function setBits(bits: number, fromIndex: number, toIndex: number) {
  const mask = (2 ** toIndex - 1) ^ (2 ** fromIndex - 1)
  return bits | mask
}

export function clearBits(bits: number, fromIndex: number, toIndex: number) {
  const mask = (2 ** toIndex - 1) ^ (2 ** fromIndex - 1)
  return (bits | mask) ^ mask
}

export function nextSetBit(bits: number, fromIndex = 0) {
  for (let index = fromIndex, mask = 2 ** index; mask < bits; index++, mask <<= 1) {
    if (bits & mask) {
      return index
    }
  }
  return -1
}

export function nextClearBit(bits: number, fromIndex = 0) {
  for (let index = fromIndex, mask = 2 ** index; ; index++, mask <<= 1) {
    if (bits & mask) {
      continue
    }
    return index
  }
}
