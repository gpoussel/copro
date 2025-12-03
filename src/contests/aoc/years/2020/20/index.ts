import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2020 - Day 20

const MONSTER = ["                  # ", "#    ##    ##    ###", " #  #  #  #  #  #   "].map(([...row]) => row)
type Edges = { top: string; bottom: string; left: string; right: string }
type EdgeLookup = { [key: string]: { [key: string]: Tile } }

class Tile {
  tileId: string
  edges: Edges
  image: string[][]
  croppedImage: string[][]
  constructor(tileId: string, image: string[][]) {
    this.tileId = tileId
    const top = image[0].join("")
    const bottom = image[image.length - 1].join("")
    const left = image.map(row => row[0]).join("")
    const right = image.map(row => row[row.length - 1]).join("")
    this.edges = { top, bottom, left, right }
    this.image = image
    this.croppedImage = image.slice(1, image.length - 1).map(row => row.slice(1, row.length - 1))
  }
  flipHorizontal() {
    return new Tile(this.tileId, utils.grid.flipHorizontal(this.image))
  }
  flipVertical() {
    return new Tile(this.tileId, utils.grid.flipVertical(this.image))
  }
  rotateLeft() {
    return new Tile(this.tileId, utils.grid.rotateLeft(this.image))
  }
}

class Puzzle {
  tiles: Tile[]
  size: number
  leftEdges: EdgeLookup
  rightEdges: EdgeLookup
  topEdges: EdgeLookup
  bottomEdges: EdgeLookup
  constructor(tiles: Tile[]) {
    this.tiles = tiles
    this.size = Math.sqrt(tiles.length)

    this.leftEdges = {}
    this.rightEdges = {}
    this.topEdges = {}
    this.bottomEdges = {}
    this.tiles.forEach(tile => {
      const addTileToEdges = (theTile: Tile, tileId: string, edge: string, edges: EdgeLookup) => {
        if (!(edge in edges)) {
          edges[edge] = {}
        }
        edges[edge][tileId] = theTile
      }
      const addTile = (theTile: Tile) => {
        addTileToEdges(theTile, theTile.tileId, theTile.edges.left, this.leftEdges)
        addTileToEdges(theTile, theTile.tileId, theTile.edges.right, this.rightEdges)
        addTileToEdges(theTile, theTile.tileId, theTile.edges.top, this.topEdges)
        addTileToEdges(theTile, theTile.tileId, theTile.edges.bottom, this.bottomEdges)
      }
      for (let i = 0; i < 4; i++) {
        addTile(tile)
        addTile(tile.flipHorizontal())
        addTile(tile.flipVertical())
        tile = tile.rotateLeft()
      }
    })
  }

  public getCorners() {
    return this.tiles.filter(tile => this.isCornerPiece(tile))
  }

  public solve() {
    const tileIds = new Set<string>([...this.tiles.map(tile => tile.tileId)])
    const corner = this.getCorners().find(
      corner =>
        !this.checkForMatch(corner, corner.edges.top, this.bottomEdges) &&
        !this.checkForMatch(corner, corner.edges.left, this.rightEdges) &&
        this.checkForMatch(corner, corner.edges.right, this.leftEdges) &&
        this.checkForMatch(corner, corner.edges.bottom, this.topEdges)
    )!
    const tiles2D: Array<Tile[]> = []
    for (let i = 0; i < this.size; i++) {
      tiles2D.push(new Array<Tile>(this.size))
    }
    tiles2D[0][0] = corner
    tileIds.delete(corner.tileId)

    for (let x = 1; x < this.size; x++) {
      const previous = tiles2D[0][x - 1]
      const matching = this.leftEdges[previous.edges.right]
      const availableTiles = Object.keys(matching).filter(key => tileIds.has(key) && key !== previous.tileId)
      tiles2D[0][x] = matching[availableTiles[0]]
      tileIds.delete(matching[availableTiles[0]].tileId)
    }
    for (let y = 1; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        const previous = tiles2D[y - 1][x]
        const matching = this.topEdges[previous.edges.bottom]
        const availableTiles = Object.keys(matching).filter(key => tileIds.has(key) && key !== previous.tileId)
        if (availableTiles.length > 1) {
          throw new Error(`More than 1 match! at index ${x},${y}`)
        }
        if (availableTiles.length !== 1) {
          throw new Error(`No match at index ${x}`)
        }
        tiles2D[y][x] = matching[availableTiles[0]]
        tileIds.delete(matching[availableTiles[0]].tileId)
      }
    }
    const pixels: Array<string[]> = this.buildImage(tiles2D)
    return this.computeRoughness(pixels)
  }

  private computeRoughness(pixels: string[][]) {
    const size = this.size
    function findSeaMonster(pixels: string[][], totalRough: number) {
      for (let y = 0; y < size * 8 - MONSTER.length; y++) {
        for (let x = 0; x < size * 8 - MONSTER[0].length; x++) {
          let found = true
          for (let dy = 0; dy < MONSTER.length; dy++) {
            for (let dx = 0; dx < MONSTER[0].length; dx++) {
              if (MONSTER[dy][dx] === "#" && pixels[y + dy][x + dx] !== "#") {
                found = false
              }
            }
          }
          if (found) {
            for (let dy = 0; dy < MONSTER.length; dy++) {
              for (let dx = 0; dx < MONSTER[0].length; dx++) {
                if (MONSTER[dy][dx] === "#" && pixels[y + dy][x + dx] === "#") {
                  totalRough--
                }
              }
            }
          }
        }
      }
      return totalRough
    }
    let totalRough = 0
    for (let y = 0; y < size * 8; y++) {
      for (let x = 0; x < size * 8; x++) {
        if (pixels[y][x] === "#") {
          totalRough++
        }
      }
    }
    let p = pixels
    let remainingRoughness = 0
    for (let i = 0; i < 4; i++) {
      remainingRoughness = findSeaMonster(p, totalRough)
      if (remainingRoughness != totalRough) {
        break
      }
      remainingRoughness = findSeaMonster(utils.grid.flipHorizontal(p), totalRough)
      if (remainingRoughness != totalRough) {
        break
      }
      remainingRoughness = findSeaMonster(utils.grid.flipVertical(p), totalRough)
      if (remainingRoughness != totalRough) {
        break
      }
      p = utils.grid.rotateLeft(p)
    }
    return remainingRoughness
  }

  private buildImage(tiles2D: Tile[][]) {
    const pixels: Array<string[]> = []
    for (let i = 0; i < this.size * 8; i++) {
      pixels.push(new Array<string>(this.size * 8))
    }
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        for (let dy = 0; dy < 8; dy++) {
          for (let dx = 0; dx < 8; dx++) {
            pixels[y * 8 + dy][x * 8 + dx] = tiles2D[y][x].croppedImage[dy][dx]
          }
        }
      }
    }
    return pixels
  }

  private checkForMatch(tile: Tile, edge: string, edges: EdgeLookup) {
    const matchingEdges = edges[edge]
    if (!matchingEdges) return false
    if (tile.tileId in matchingEdges) {
      return Object.keys(matchingEdges).length == 2
    }
    return Object.keys(matchingEdges).length == 1
  }

  private isCornerPiece(tile: Tile) {
    let result = 0
    if (this.checkForMatch(tile, tile.edges.top, this.bottomEdges)) {
      result++
    }
    if (this.checkForMatch(tile, tile.edges.bottom, this.topEdges)) {
      result++
    }
    if (this.checkForMatch(tile, tile.edges.left, this.rightEdges)) {
      result++
    }
    if (this.checkForMatch(tile, tile.edges.right, this.leftEdges)) {
      result++
    }
    return result === 2
  }
}

function parseInput(input: string) {
  return new Puzzle(
    utils.input.blocks(input).map(tile => {
      const [tileIdString, ...image] = tile.split("\n")
      const tileId = tileIdString.split(" ")[1].replace(":", "")
      return new Tile(
        tileId,
        image.map(row => row.split(""))
      )
    })
  )
}

function part1(inputString: string) {
  return parseInput(inputString)
    .getCorners()
    .reduce((product, corner) => (product *= parseInt(corner.tileId)), 1)
}

function part2(inputString: string) {
  return parseInput(inputString).solve()
}

const EXAMPLE = `
Tile 2311:
..##.#..#.
##..#.....
#...##..#.
####.#...#
##.##.###.
##...#.###
.#.#.#..##
..#....#..
###...#.#.
..###..###

Tile 1951:
#.##...##.
#.####...#
.....#..##
#...######
.##.#....#
.###.#####
###.##.##.
.###....#.
..#.#..#.#
#...##.#..

Tile 1171:
####...##.
#..##.#..#
##.#..#.#.
.###.####.
..###.####
.##....##.
.#...####.
#.##.####.
####..#...
.....##...

Tile 1427:
###.##.#..
.#..#.##..
.#.##.#..#
#.#.#.##.#
....#...##
...##..##.
...#.#####
.#.####.#.
..#..###.#
..##.#..#.

Tile 1489:
##.#.#....
..##...#..
.##..##...
..#...#...
#####...#.
#..#.#.#.#
...#.#.#..
##.#...##.
..##.##.##
###.##.#..

Tile 2473:
#....####.
#..#.##...
#.##..#...
######.#.#
.#...#.#.#
.#########
.###.#..#.
########.#
##...##.#.
..###.#.#.

Tile 2971:
..#.#....#
#...###...
#.#.###...
##.##..#..
.#####..##
.#..####.#
#..#.#..#.
..####.###
..#.#.###.
...#.#.#.#

Tile 2729:
...#.#.#.#
####.#....
..#.#.....
....#..#.#
.##..##.#.
.#.####...
####.#.#..
##.####...
##..#.##..
#.##...##.

Tile 3079:
#.#.#####.
.#..######
..#.......
######....
####.#..#.
.#...#.##.
#.#####.##
..#.###...
..#.......
..#.###...`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 20899048083289,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 273,
      },
    ],
  },
} as AdventOfCodeContest
