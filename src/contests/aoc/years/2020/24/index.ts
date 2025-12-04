import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2020 - Day 24

function parseInput(input: string) {
  return utils.input.lines(input)
}

class AxialCoord {
  q: number
  r: number

  constructor(q: number, r: number) {
    this.q = q
    this.r = r
  }

  static fromString(coordString: string): AxialCoord {
    const [q, r] = coordString.split(",").map(Number)
    return new AxialCoord(q, r)
  }

  east() {
    return new AxialCoord(this.q + 1, this.r)
  }

  southeast() {
    return new AxialCoord(this.q, this.r + 1)
  }

  southwest() {
    return new AxialCoord(this.q - 1, this.r + 1)
  }

  west() {
    return new AxialCoord(this.q - 1, this.r)
  }

  northwest() {
    return new AxialCoord(this.q, this.r - 1)
  }
  northeast() {
    return new AxialCoord(this.q + 1, this.r - 1)
  }

  neighbors() {
    return [this.east(), this.southeast(), this.southwest(), this.west(), this.northwest(), this.northeast()]
  }

  toString() {
    return `${this.q},${this.r}`
  }
}

function getTargetCoordinate(start: AxialCoord, path: string): AxialCoord {
  let coord = new AxialCoord(0, 0)
  const directions = path.match(/(e|se|sw|w|nw|ne)/g)!
  for (const dir of directions) {
    coord = {
      e: () => coord.east(),
      se: () => coord.southeast(),
      sw: () => coord.southwest(),
      w: () => coord.west(),
      nw: () => coord.northwest(),
      ne: () => coord.northeast(),
    }[dir]!()
  }
  return coord
}

function getListOfBlackTiles(input: string[]) {
  const blackTiles = new Set<string>()
  for (const path of input) {
    const coord = getTargetCoordinate(new AxialCoord(0, 0), path)
    if (blackTiles.has(coord.toString())) {
      blackTiles.delete(coord.toString())
    } else {
      blackTiles.add(coord.toString())
    }
  }
  return blackTiles
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  const blackTiles = getListOfBlackTiles(input)
  return blackTiles.size
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  const blackTiles = getListOfBlackTiles(input)
  const qs = Array.from(blackTiles).map(tile => AxialCoord.fromString(tile).q)
  const rs = Array.from(blackTiles).map(tile => AxialCoord.fromString(tile).r)
  const boundingBox = {
    minQ: utils.iterate.min(qs) - 1,
    maxQ: utils.iterate.max(qs) + 1,
    minR: utils.iterate.min(rs) - 1,
    maxR: utils.iterate.max(rs) + 1,
  }
  for (let day = 0; day < 100; day++) {
    const newBlackTiles = new Set<string>()
    for (let q = boundingBox.minQ; q <= boundingBox.maxQ; q++) {
      for (let r = boundingBox.minR; r <= boundingBox.maxR; r++) {
        const coord = new AxialCoord(q, r)
        const neighbors = coord.neighbors()
        const blackNeighborCount = neighbors.filter(neighbor => blackTiles.has(neighbor.toString())).length
        const isBlack = blackTiles.has(coord.toString())
        if (isBlack && (blackNeighborCount === 1 || blackNeighborCount === 2)) {
          newBlackTiles.add(coord.toString())
        } else if (!isBlack && blackNeighborCount === 2) {
          newBlackTiles.add(coord.toString())
        }
      }
    }
    blackTiles.clear()
    for (const tile of newBlackTiles) {
      blackTiles.add(tile)
    }
    boundingBox.minQ--
    boundingBox.maxQ++
    boundingBox.minR--
    boundingBox.maxR++
  }
  return blackTiles.size
}

const EXAMPLE = `
sesenwnenenewseeswwswswwnenewsewsw
neeenesenwnwwswnenewnwwsewnenwseswesw
seswneswswsenwwnwse
nwnwneseeswswnenewneswwnewseswneseene
swweswneswnenwsewnwneneseenw
eesenwseswswnenwswnwnwsewwnwsene
sewnenenenesenwsewnenwwwse
wenwwweseeeweswwwnwwe
wsweesenenewnwwnwsenewsenwwsesesenwne
neeswseenwwswnwswswnw
nenwswwsewswnenenewsenwsenwnesesenew
enewnwewneswsewnwswenweswnenwsenwsw
sweneswneswneneenwnewenewwneswswnese
swwesenesewenwneswnwwneseswwne
enesenwswwswneneswsenwnewswseenwsese
wnwnesenesenenwwnenwsewesewsesesew
nenewswnwewswnenesenwnesewesw
eneswnwswnwsenenwnwnwwseeswneewsenese
neswnwewnwnwseenwseesewsenwsweewe
wseweeenwnesenwwwswnew`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 10,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 2208,
      },
    ],
  },
} as AdventOfCodeContest
