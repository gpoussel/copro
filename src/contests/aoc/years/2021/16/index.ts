import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2021 - Day 16

function parseInput(input: string) {
  const hexString = utils.input.firstLine(input)
  let binaryString = ""
  for (const hexChar of hexString) {
    const decimal = parseInt(hexChar, 16)
    binaryString += decimal.toString(2).padStart(4, "0")
  }
  return binaryString
}

interface Packet {
  version: number
  typeId: number
  value?: number
  subpackets: Packet[]
}

function readPacket(binaryString: string, cursor: { position: number }): Packet {
  const version = parseInt(binaryString.slice(cursor.position, cursor.position + 3), 2)
  const typeId = parseInt(binaryString.slice(cursor.position + 3, cursor.position + 6), 2)
  cursor.position += 6
  if (typeId === 4) {
    // Packet is a literal value
    let literalBinary = ""
    while (true) {
      const group = binaryString.slice(cursor.position, cursor.position + 5)
      literalBinary += group.slice(1)
      cursor.position += 5
      if (group[0] === "0") {
        break
      }
    }
    const literalValue = parseInt(literalBinary, 2)
    return { version, typeId, value: literalValue, subpackets: [] }
  }
  const lengthTypeId = binaryString[cursor.position]
  cursor.position += 1
  const subpackets: Packet[] = []
  if (lengthTypeId === "0") {
    const totalLengthInBits = parseInt(binaryString.slice(cursor.position, cursor.position + 15), 2)
    cursor.position += 15
    const targetPosition = cursor.position + totalLengthInBits
    while (cursor.position < targetPosition) {
      subpackets.push(readPacket(binaryString, cursor))
    }
  } else {
    const numberOfSubpackets = parseInt(binaryString.slice(cursor.position, cursor.position + 11), 2)
    cursor.position += 11
    for (let i = 0; i < numberOfSubpackets; i++) {
      subpackets.push(readPacket(binaryString, cursor))
    }
  }
  return { version, typeId, subpackets }
}

function part1(inputString: string) {
  const binaryString = parseInput(inputString)
  let sumOfVersions = 0
  const rootPacket = readPacket(binaryString, { position: 0 })
  const packetsToProcess: Packet[] = [rootPacket]
  while (packetsToProcess.length > 0) {
    const packet = packetsToProcess.pop()!
    sumOfVersions += packet.version
    for (const subpacket of packet.subpackets) {
      packetsToProcess.push(subpacket)
    }
  }
  return sumOfVersions
}

function evaluatePacket(packet: Packet): number {
  switch (packet.typeId) {
    case 0:
      return packet.subpackets.reduce((sum, p) => sum + evaluatePacket(p), 0)
    case 1:
      return packet.subpackets.reduce((prod, p) => prod * evaluatePacket(p), 1)
    case 2:
      return Math.min(...packet.subpackets.map(p => evaluatePacket(p)))
    case 3:
      return Math.max(...packet.subpackets.map(p => evaluatePacket(p)))
    case 4:
      return packet.value!
    case 5:
      return evaluatePacket(packet.subpackets[0]) > evaluatePacket(packet.subpackets[1]) ? 1 : 0
    case 6:
      return evaluatePacket(packet.subpackets[0]) < evaluatePacket(packet.subpackets[1]) ? 1 : 0
    case 7:
      return evaluatePacket(packet.subpackets[0]) === evaluatePacket(packet.subpackets[1]) ? 1 : 0
  }
  throw new Error(`Unknown typeId: ${packet.typeId}`)
}

function part2(inputString: string) {
  const binaryString = parseInput(inputString)
  const rootPacket = readPacket(binaryString, { position: 0 })
  return evaluatePacket(rootPacket)
}

export default {
  part1: {
    run: part1,
    tests: [
      { input: `D2FE28`, expected: 6 },
      { input: `38006F45291200`, expected: 9 },
      { input: `EE00D40C823060`, expected: 14 },
      { input: `8A004A801A8002F478`, expected: 16 },
      { input: `620080001611562C8802118E34`, expected: 12 },
      { input: `C0015000016115A2E0802F182340`, expected: 23 },
      { input: `A0016C880162017C3686B18A3D4780`, expected: 31 },
    ],
  },
  part2: {
    run: part2,
    tests: [
      { input: `C200B40A82`, expected: 3 },
      { input: `04005AC33890`, expected: 54 },
      { input: `880086C3E88112`, expected: 7 },
      { input: `CE00C43D881120`, expected: 9 },
      { input: `D8005AC2A8F0`, expected: 1 },
      { input: `F600BC2D8F`, expected: 0 },
      { input: `9C005AC2F8F0`, expected: 0 },
      { input: `9C0141080250320F1802104A08`, expected: 1 },
    ],
  },
} as AdventOfCodeContest
