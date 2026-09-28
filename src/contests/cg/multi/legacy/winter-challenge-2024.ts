/**
 * Grow and multiply your organisms to end up larger than your opponent.
 **/

type OrganType = 'ROOT' | 'BASIC'

type ProteinType = 'A' | 'B' | 'C' | 'D'

type Direction = 'N' | 'E' | 'S' | 'W'

interface Position {
    x: number
    y: number
}

interface Organ {
    id: number
    position: Position
    type: OrganType
    direction: Direction
    rootId: number
    parentId: number
    owner: 0 | 1
}

interface Cell {
    position: Position
    isWall: boolean
    protein?: ProteinType
    organ?: Organ
}

interface Game {
    grid: Cell[][]
    myProteins: { [key in ProteinType]: number }
    oppProteins: { [key in ProteinType]: number }
    myOrgans: Organ[]
    oppOrgans: Organ[]
    organMap: Map<number, Organ>
}

var inputs: string[] = readline().split(' ');
const width: number = parseInt(inputs[0]); // columns in the game grid
const height: number = parseInt(inputs[1]); // rows in the game grid

// game loop
while (true) {
    const game: Game = {
        grid: [],
        myProteins: { A: 0 , B: 0, C: 0, D: 0 },
        oppProteins: { A: 0 , B: 0, C: 0, D: 0 },
        myOrgans: [],
        oppOrgans: [],
        organMap: new Map()
    }

    for (let y = 0; y < height; ++y) {
        game.grid.push(new Array(width))
        for (let x = 0; x < width; ++x) {
            game.grid[y][x] = {
                position: { x, y },
                isWall: false,
                organ: null,
                protein: null
            }
        }   
    }

    const entityCount: number = parseInt(readline());
    for (let i = 0; i < entityCount; i++) {
        var inputs: string[] = readline().split(' ');
        const x: number = parseInt(inputs[0]);
        const y: number = parseInt(inputs[1]); // grid coordinate
        const type: string = inputs[2]; // WALL, ROOT, BASIC, TENTACLE, HARVESTER, SPORER, A, B, C, D
        const owner: number = parseInt(inputs[3]); // 1 if your organ, 0 if enemy organ, -1 if neither
        const organId: number = parseInt(inputs[4]); // id of this entity if it's an organ, 0 otherwise
        const organDir: string = inputs[5]; // N,E,S,W or X if not an organ
        const organParentId: number = parseInt(inputs[6]);
        const organRootId: number = parseInt(inputs[7]);

        if (type === 'WALL') {
            game.grid[y][x].isWall = true
        } else if (type === 'A' || type === 'B' || type === 'C' || type === 'D') {
            game.grid[y][x].protein = type as ProteinType
        } else {
            const organ: Organ = {
                id: organId,
                position: { x, y },
                type: type as OrganType,
                direction: organDir as Direction,
                parentId: organParentId,
                rootId: organRootId,
                owner: owner as 0 | 1
            }
            game.grid[y][x].organ = organ
            game.organMap.set(organId, organ)
            if (owner === 1) {
                game.myOrgans.push(organ)
            } else {
                game.oppOrgans.push(organ)
            }
        }
    }
    var inputs: string[] = readline().split(' ');
    const myA: number = parseInt(inputs[0]);
    const myB: number = parseInt(inputs[1]);
    const myC: number = parseInt(inputs[2]);
    const myD: number = parseInt(inputs[3]); // your protein stock
    game.myProteins = { A: myA, B: myB, C: myC, D: myD }
    var inputs: string[] = readline().split(' ');
    const oppA: number = parseInt(inputs[0]);
    const oppB: number = parseInt(inputs[1]);
    const oppC: number = parseInt(inputs[2]);
    const oppD: number = parseInt(inputs[3]); // opponent's protein stock
    game.oppProteins = { A: oppA, B: oppB, C: oppC, D: oppD }

    const requiredActionsCount: number = parseInt(readline()); // your number of organisms, output an action for each one in any order
    for (let i = 0; i < requiredActionsCount; i++) {

        // Write an action using console.log()
        // To debug: console.error('Debug messages...');

        console.log('GROW 1 16 2 BASIC');

    }
}