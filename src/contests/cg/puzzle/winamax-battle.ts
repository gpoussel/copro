// @ts-nocheck
// 🎮 CodinGame Puzzle - winamax-battle
// https://www.codingame.com/training/medium/winamax-battle

const CARD_VALUES: Record<string, number> = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
  'J': 11, 'Q': 12, 'K': 13, 'A': 14
};

function cardValue(card: string): number {
  return CARD_VALUES[card.slice(0, -1)];
}

const n: number = parseInt(readline());
const deck1: string[] = [];
for (let i = 0; i < n; i++) {
  deck1.push(readline());
}
const m: number = parseInt(readline());
const deck2: string[] = [];
for (let i = 0; i < m; i++) {
  deck2.push(readline());
}

let rounds = 0;
const seenStates = new Set<string>();

function getState(): string {
  return deck1.join(',') + '|' + deck2.join(',');
}

let pat = false;

while (deck1.length > 0 && deck2.length > 0) {
  const state = getState();
  if (seenStates.has(state)) {
    pat = true;
    break;
  }
  seenStates.add(state);

  rounds++;
  const pot1: string[] = [];
  const pot2: string[] = [];

  // Draw top cards
  let c1 = deck1.shift() as string;
  let c2 = deck2.shift() as string;
  pot1.push(c1);
  pot2.push(c2);

  let roundPat = false;

  // Compare, handle war chains
  while (cardValue(c1) === cardValue(c2)) {
    // War: each player puts 3 face-down cards
    if (deck1.length < 3 || deck2.length < 3) {
      roundPat = true;
      break;
    }
    for (let i = 0; i < 3; i++) {
      pot1.push(deck1.shift() as string);
      pot2.push(deck2.shift() as string);
    }
    // Then each draws a face-up card for the next comparison
    if (deck1.length === 0 || deck2.length === 0) {
      roundPat = true;
      break;
    }
    c1 = deck1.shift() as string;
    c2 = deck2.shift() as string;
    pot1.push(c1);
    pot2.push(c2);
  }

  if (roundPat) {
    pat = true;
    break;
  }

  // Winner takes all: player 1's cards first, then player 2's
  if (cardValue(c1) > cardValue(c2)) {
    for (const card of pot1) deck1.push(card);
    for (const card of pot2) deck1.push(card);
  } else {
    for (const card of pot1) deck2.push(card);
    for (const card of pot2) deck2.push(card);
  }
}

if (pat) {
  console.log('PAT');
} else if (deck1.length === 0) {
  console.log('2 ' + rounds);
} else {
  console.log('1 ' + rounds);
}
