const DRAFT_CARDS_COUNT = 30; // Pendant la phase de Draft, chaque joueur doit constituer un "deck" (paquet) de 30 cartes.

class Player {
    constructor(readonly health: number, readonly mana: number, readonly deck: number, readonly rune: number, readonly draw: number) {

    }
}

class Action {

}

class Card {
    constructor(readonly index: number,
                readonly instanceId: number,
                readonly cardType: number,
                readonly cost: number,
                readonly location: number,
                readonly abilities: string) {}
}

class GameState {
    constructor(readonly player: Player,
                readonly opponent: Player,
                readonly hand: Card[],
                readonly playerBoard: Card[],
                readonly opponentBoard: Card[]) {}
}

function createAction(str: string): Action {
    // TODO: Parse str
    return new Action();
}

function createCard(index: number,
                    cardNumber: number,
                    instanceId: number,
                    location: number,
                    cardType: number,
                    cost: number,
                    attack: number,
                    defense: number,
                    abilities: string,
                    myHealthChange: number,
                    opponentHealthChange: number,
                    cardDraw: number): Card {
    // TODO create card
    return new Card(index, instanceId, cardType, cost, location, abilities);
}

function parseGameState(): GameState {
    const players = [];
    for (let i = 0; i < 2; i++) {
        const [health, mana, deck, rune, draw]: number[] = readline().split(' ').map(a => parseInt(a, 10));
        players.push(new Player(health, mana, deck, rune, draw));
    }
    const [opponentHandSize, opponentActionsCount]: number[] = readline().split(' ').map(a => parseInt(a, 10));
    const opponentActions = [];
    for (let i = 0; i < opponentActionsCount; i++) {
        const cardNumberAndAction: string = readline();
        opponentActions.push(createAction(cardNumberAndAction));
    }
    const cardCount: number = parseInt(readline());
    const cards = [];
    for (let i = 0; i < cardCount; i++) {
        const inputs: string[] = readline().split(' ');
        const cardNumber: number = parseInt(inputs[0]);
        const instanceId: number = parseInt(inputs[1]);
        const location: number = parseInt(inputs[2]);
        const cardType: number = parseInt(inputs[3]);
        const cost: number = parseInt(inputs[4]);
        const attack: number = parseInt(inputs[5]);
        const defense: number = parseInt(inputs[6]);
        const abilities: string = inputs[7];
        const myHealthChange: number = parseInt(inputs[8]);
        const opponentHealthChange: number = parseInt(inputs[9]);
        const cardDraw: number = parseInt(inputs[10]);
        cards.push(createCard(i, cardNumber, instanceId, location, cardType, cost, attack, defense, abilities, myHealthChange, opponentHealthChange, cardDraw));
    }
    const hand = cards.filter(c => c.location === 0);
    const playerBoard = cards.filter(c => c.location === 1);
    const opponentBoard = cards.filter(c => c.location === -1);
    return new GameState(players[0], players[1], hand, playerBoard, opponentBoard);
}

let turnCount = 0;

while (true) {
    const gameState = parseGameState();
    const draftPhase = turnCount < DRAFT_CARDS_COUNT;

    if (draftPhase) {
        gameState.hand.sort((c1, c2) => {
            if (c1.cardType != c2.cardType) {
                return c1.cardType - c2.cardType
            }
            if (c1.cost !== c2.cost) {
                return c1.cost - c2.cost;
            }
            return c1.abilities.localeCompare(c2.abilities);
        })
        console.log(`PICK ${gameState.hand[0].index}`);
    } else {
        // Summon all possible cards
        gameState.hand.sort((c1, c2) => c1.cost - c2.cost);
        const summonableCards = gameState.hand.filter(c => c.cardType === 0).reduce(({cards, total}, card) => {
            if (total + card.cost <= gameState.player.mana) {
                cards.push(card);
            }
            return {cards, total: total + card.cost };
        }, {cards: [], total: 0}).cards;

        // Play all cards of player board
        const playableCards = [...gameState.playerBoard, ...summonableCards.filter(c => c.abilities.indexOf('C'))];
        const guardedTargets = gameState.opponentBoard.filter(c => c.abilities.indexOf('G') >= 0);
        const attackTargets = guardedTargets.length > 0 ? guardedTargets.map(t => t.instanceId) : [-1];

        const actions = [
            ...summonableCards.map(c => `SUMMON ${c.instanceId}`),
            ...playableCards.map((c, index) => `ATTACK ${c.instanceId} ${attackTargets[index % attackTargets.length]}`)
        ]
        console.log(actions.join(";"));
    }
    turnCount++;
}
