// @ts-nocheck
// 🎮 CodinGame Puzzle - order-of-succession
// https://www.codingame.com/training/easy/order-of-succession

const n = parseInt(readline());

const people = {};

for (let i = 0; i < n; i++) {
    const parts = readline().split(' ');
    const name = parts[0];
    const parent = parts[1];
    const birth = parseInt(parts[2]);
    const death = parts[3];
    const religion = parts[4];
    const gender = parts[5];

    people[name] = {
        name,
        parent,
        birth,
        dead: death !== '-',
        catholic: religion === 'Catholic',
        gender,
        children: [],
    };
}

// Build tree
let root = null;
for (const name in people) {
    const person = people[name];
    if (person.parent === '-') {
        root = person;
    } else {
        if (people[person.parent]) {
            people[person.parent].children.push(person);
        }
    }
}

// Sort children: males first by birth year, then females by birth year
function sortChildren(person) {
    person.children.sort((a, b) => {
        if (a.gender !== b.gender) {
            // Males (M) before females (F)
            return a.gender === 'M' ? -1 : 1;
        }
        return a.birth - b.birth;
    });
    for (const child of person.children) {
        sortChildren(child);
    }
}

sortChildren(root);

// DFS pre-order traversal, excluding dead and catholic (but still traverse their children)
const result = [];

function dfs(person) {
    if (!person.dead && !person.catholic) {
        result.push(person.name);
    }
    for (const child of person.children) {
        dfs(child);
    }
}

dfs(root);

console.log(result.join('\n'));
