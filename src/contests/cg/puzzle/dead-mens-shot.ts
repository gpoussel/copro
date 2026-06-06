// @ts-nocheck
// 🎮 CodinGame Puzzle - dead-mens-shot
// https://www.codingame.com/training/easy/dead-mens-shot

const N = parseInt(readline());
const corners: [number, number][] = [];
for (let i = 0; i < N; i++) {
    const [x, y] = readline().split(' ').map(Number);
    corners.push([x, y]);
}

const M = parseInt(readline());
for (let i = 0; i < M; i++) {
    const [px, py] = readline().split(' ').map(Number);

    // For a convex polygon in counterclockwise order, a point is inside (or on edge)
    // if for every edge (A -> B), the cross product (B-A) x (P-A) >= 0
    // cross product >= 0 means point is to the left of or on the edge
    let hit = true;
    for (let j = 0; j < N; j++) {
        const [ax, ay] = corners[j];
        const [bx, by] = corners[(j + 1) % N];
        // Cross product of (B-A) x (P-A)
        const cross = (bx - ax) * (py - ay) - (by - ay) * (px - ax);
        if (cross < 0) {
            hit = false;
            break;
        }
    }

    console.log(hit ? 'hit' : 'miss');
}
