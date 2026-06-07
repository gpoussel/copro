// @ts-nocheck
// 🎮 CodinGame Puzzle - unflood-the-world
// https://www.codingame.com/training/hard/unflood-the-world

const [W, H] = readline().split(' ').map(Number);
const grid: number[][] = [];
for (let i = 0; i < H; i++) {
    grid.push(readline().split(' ').map(Number));
}

// Union-Find (DSU) to group adjacent same-height cells into components
const parent: number[] = Array.from({ length: W * H }, (_, i) => i);
const rank: number[] = new Array(W * H).fill(0);

function find(x: number): number {
    if (parent[x] !== x) parent[x] = find(parent[x]);
    return parent[x];
}

function union(a: number, b: number): void {
    const ra = find(a);
    const rb = find(b);
    if (ra === rb) return;
    if (rank[ra] < rank[rb]) { parent[ra] = rb; }
    else if (rank[ra] > rank[rb]) { parent[rb] = ra; }
    else { parent[rb] = ra; rank[ra]++; }
}

function idx(r: number, c: number): number {
    return r * W + c;
}

// Merge adjacent cells with the same height
const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
for (let r = 0; r < H; r++) {
    for (let c = 0; c < W; c++) {
        for (const [dr, dc] of dirs) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < H && nc >= 0 && nc < W) {
                if (grid[r][c] === grid[nr][nc]) {
                    union(idx(r, c), idx(nr, nc));
                }
            }
        }
    }
}

// For each component, check if it has any adjacent cell with strictly lower height
const hasLowerNeighbor = new Set<number>();
for (let r = 0; r < H; r++) {
    for (let c = 0; c < W; c++) {
        for (const [dr, dc] of dirs) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < H && nc >= 0 && nc < W) {
                if (grid[nr][nc] < grid[r][c]) {
                    // Component of (r,c) has a lower neighbor
                    hasLowerNeighbor.add(find(idx(r, c)));
                }
            }
        }
    }
}

// Count distinct components that are local minima (no lower neighbor)
const allComponents = new Set<number>();
for (let r = 0; r < H; r++) {
    for (let c = 0; c < W; c++) {
        allComponents.add(find(idx(r, c)));
    }
}

let drains = 0;
for (const comp of allComponents) {
    if (!hasLowerNeighbor.has(comp)) {
        drains++;
    }
}

console.log(drains);
