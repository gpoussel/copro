// @ts-nocheck
// 🎮 CodinGame Puzzle - the-travelling-salesman-problem
// https://www.codingame.com/training/easy/the-travelling-salesman-problem

const n = parseInt(readline());
const cities: [number, number][] = [];
for (let i = 0; i < n; i++) {
    const [x, y] = readline().split(' ').map(Number);
    cities.push([x, y]);
}

function dist(a: [number, number], b: [number, number]): number {
    const dx = a[0] - b[0];
    const dy = a[1] - b[1];
    return Math.sqrt(dx * dx + dy * dy);
}

const visited = new Array(n).fill(false);
let current = 0;
visited[0] = true;
let totalDist = 0;

for (let step = 0; step < n - 1; step++) {
    let nearestIdx = -1;
    let nearestDist = Infinity;
    for (let i = 0; i < n; i++) {
        if (!visited[i]) {
            const d = dist(cities[current], cities[i]);
            if (d < nearestDist) {
                nearestDist = d;
                nearestIdx = i;
            }
        }
    }
    totalDist += nearestDist;
    visited[nearestIdx] = true;
    current = nearestIdx;
}

// Return to start
totalDist += dist(cities[current], cities[0]);

console.log(Math.round(totalDist) + 0);
