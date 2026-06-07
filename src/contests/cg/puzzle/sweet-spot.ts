// @ts-nocheck
// 🎮 CodinGame Puzzle - sweet-spot
// https://www.codingame.com/training/easy/sweet-spot

const N = parseInt(readline());
const grid: string[] = [];
for (let i = 0; i < N; i++) {
    grid.push(readline());
}

// intensity[r][c] = current max intensity from shockwaves (0 if none)
const intensity: number[][] = [];
// bombType[r][c] = bomb letter or '' if not a bomb
const bombType: string[][] = [];

for (let r = 0; r < N; r++) {
    intensity.push([]);
    bombType.push([]);
    for (let c = 0; c < N; c++) {
        const ch = grid[r][c];
        if (ch === 'A' || ch === 'B' || ch === 'H') {
            bombType[r].push(ch);
            intensity[r].push(-1); // bomb cell, not overwritten
        } else {
            bombType[r].push('');
            intensity[r].push(parseInt(ch));
        }
    }
}

// Bomb shockwave formulas (fixed range/intensity per type):
// A-bomb: Chebyshev distance pattern, value = max(0, 4 - chebDist), range = 3
// H-bomb: constant value 5 within Chebyshev distance 3
// B-bomb: cross (same row/col only), value = max(0, 4 - axisDist), range = 3

function getAEffect(dr: number, dc: number): number {
    const dist = Math.max(Math.abs(dr), Math.abs(dc));
    return Math.max(0, 4 - dist);
}

function getHEffect(dr: number, dc: number): number {
    const dist = Math.max(Math.abs(dr), Math.abs(dc));
    return dist <= 3 ? 5 : 0;
}

function getBEffect(dr: number, dc: number): number {
    // Only affects same row (dr=0) or same col (dc=0)
    if (dr !== 0 && dc !== 0) return 0;
    const dist = Math.abs(dr) + Math.abs(dc);
    return Math.max(0, 4 - dist);
}

function applyEffect(r: number, c: number, type: string) {
    for (let r2 = 0; r2 < N; r2++) {
        for (let c2 = 0; c2 < N; c2++) {
            if (r2 === r && c2 === c) continue; // bomb cell not changed
            if (bombType[r2][c2] !== '') continue; // don't overwrite other bomb cells
            const dr = r2 - r;
            const dc = c2 - c;
            let val = 0;
            if (type === 'A') val = getAEffect(dr, dc);
            else if (type === 'H') val = getHEffect(dr, dc);
            else if (type === 'B') val = getBEffect(dr, dc);
            if (val > 0) {
                intensity[r2][c2] = Math.max(intensity[r2][c2], val);
            }
        }
    }
}

function bombReachesBomb(er: number, ec: number, etype: string, tr: number, tc: number): boolean {
    const dr = tr - er;
    const dc = tc - ec;
    let val = 0;
    if (etype === 'A') val = getAEffect(dr, dc);
    else if (etype === 'H') val = getHEffect(dr, dc);
    else if (etype === 'B') val = getBEffect(dr, dc);
    return val > 0;
}

// Phase 1: Apply A and H bombs (they always explode)
const explodedBombs: Array<[number, number, string]> = [];

for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
        const type = bombType[r][c];
        if (type === 'A' || type === 'H') {
            applyEffect(r, c, type);
            explodedBombs.push([r, c, type]);
        }
    }
}

// Phase 2: Check B bombs iteratively (chain reactions)
const explodedSet = new Set<string>(explodedBombs.map(([r, c]) => `${r},${c}`));

let changed = true;
while (changed) {
    changed = false;
    for (let r = 0; r < N; r++) {
        for (let c = 0; c < N; c++) {
            if (bombType[r][c] === 'B' && !explodedSet.has(`${r},${c}`)) {
                // Check if any exploded bomb's shockwave reaches this B bomb
                let triggered = false;
                for (const [er, ec, etype] of explodedBombs) {
                    if (bombReachesBomb(er, ec, etype, r, c)) {
                        triggered = true;
                        break;
                    }
                }
                if (triggered) {
                    applyEffect(r, c, 'B');
                    explodedBombs.push([r, c, 'B']);
                    explodedSet.add(`${r},${c}`);
                    changed = true;
                }
            }
        }
    }
}

// Build output
const result: string[] = [];
for (let r = 0; r < N; r++) {
    let row = '';
    for (let c = 0; c < N; c++) {
        if (bombType[r][c] !== '') {
            row += bombType[r][c];
        } else {
            row += intensity[r][c].toString();
        }
    }
    result.push(row);
}

console.log(result.join('\n'));
