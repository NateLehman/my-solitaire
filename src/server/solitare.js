/* Copyright G. Hemingway, @2017 */
'use strict';

let _ = require('lodash');

let shuffleCards = (includeJokers = false) => {
    //return [{ "suit": "clubs", "value": 7 }, { "suit": "diamonds", "value": 12 }];

    /* Return an array of 52 cards (if jokers is false, 54 otherwise). Carefully follow the instructions in the README */
    let cards = [];
    ['spades', 'clubs', 'hearts', 'diamonds'].forEach(suit => {
        ['ace', 2, 3, 4, 5, 6, 7, 8, 9, 10, 'jack', 'queen', 'king'].forEach(value => {
            cards.push({ suit: suit, value: value });
        });
    });
    // Add in jokers here
    if (includeJokers) {/*...*/}
    // Now shuffle
    let deck = [];
    while (cards.length > 0) {
        // Find a random number between 0 and cards.length - 1
        const index = Math.floor((Math.random() * cards.length));
        deck.push(cards[index]);
        cards.splice(index, 1);
    }
    return deck;
};

let initialState = () => {
    /* Use the above function.  Generate and return an initial state for a game */
    let state = {
        id: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 10),
        pile1: [],
        pile2: [],
        pile3: [],
        pile4: [],
        pile5: [],
        pile6: [],
        pile7: [],
        stack1: [],
        stack2: [],
        stack3: [],
        stack4: [],
        draw: [],
        discard: []
    };

    // Get the shuffled deck and distribute it to the players
    const deck = shuffleCards(false);
    // Setup the piles
    for (let i = 1; i <= 7; ++i) {
        let card = deck.splice(0, 1)[0];
        card.up = true;
        state[`pile${i}`].push(card);
        for (let j = i+1; j <= 7; ++j) {
            card = deck.splice(0, 1)[0];
            card.up = false;
            state[`pile${j}`].push(card);
        }
    }
    // Finally, get the draw right
    state.draw = deck.map(card => {
        card.up = false;
        return card;
    });
    return state;
};


let filterForProfile = game => ({
    id:         game._id,
    game:       game.game,
    color:      game.color,
    draw:       game.drawCount,
    start:      game.start,
    winner:     game.winner,
    score:      game.score,
    cards_remaining: 99,
    active:     game.active,
    moves:      game.moves.length
});

const nextCardVals = {
    'ace': '2',
    '2': '3',
    '3': '4',
    '4': '5',
    '5': '6',
    '6': '7',
    '7': '8',
    '8': '9',
    '9': '10',
    '10': 'jack',
    'jack': 'queen',
    'queen': 'king'
}


let canPlaceCardTableau = (src, dest) => {
    if (dest === undefined) {
        if (src.value === 'king') {
            return true;
        }
        return false;
    }

    const possibleSuits = ['clubs', 'spades'].includes(src.suit)
        ? ['hearts', 'diamonds']
        : ['clubs', 'spades'];

    const possibleVal = nextCardVals[src.value];

    if (!possibleSuits.includes(dest.suit)) {
        return false;
    }
    if (dest.value !== possibleVal) {
        return false;
    }
    return true;
}

let canPlaceCardFoundation = (src, dest) => {
    if (dest === undefined) {
        if (src.value === 'ace') {
            return true;
        }
        return false;
    }

    const possibleVal = (dest) ? nextCardVals[dest.value] : 'ace';

    if (src.suit !== dest.suit) {
        return false;
    }
    if (possibleVal !== src.value) {
        return false;
    }
    return true;
}

let validMoves = state => {
    const tableauPiles = ['pile1', 'pile2', 'pile3', 'pile4', 'pile5', 'pile6', 'pile7'];
    const foundationPiles = ['stack1', 'stack2', 'stack3', 'stack4'];
    const discardPiles = ['discard'];
    const singleMovePiles = foundationPiles.concat(['discard', 'draw']);
    const moveFromPiles = tableauPiles.concat(singleMovePiles);
    const moveToPiles = tableauPiles.concat(foundationPiles);

    const selectionMoves = _.flattenDeep(moveFromPiles
        .map(srcPile => state[srcPile]
            .map((card, index) => ({ card, index }))
            .filter(({ card, index }) => card.up)
            .filter(({ card, index }) => singleMovePiles.includes(srcPile) 
                ? _.isEqual(card, _.last(state[srcPile])) : true)
            .map(({ card, index }) => moveToPiles
                .filter(name => name !== srcPile)
                .map(destPile => ({ pile: destPile, top: _.last(state[destPile]) }))
                .filter(dest => (tableauPiles.includes(dest.pile)) 
                    ? canPlaceCardTableau(card, dest.top) : true)
                .filter(dest => (foundationPiles.includes(dest.pile))
                    ? canPlaceCardFoundation(card, dest.top) : true)
                .map(dest => ({cards: state[srcPile].slice(index), src: srcPile, dst: dest.pile})))));

    const drawMove = state.draw.length 
        ? { cards: _.takeRight(state.draw, state.drawCount).reverse(), src: 'draw', dst: 'discard' }
        : { cards: [...state.discard].reverse(), src: 'discard', dst: 'draw' };

    return [...selectionMoves, drawMove];
};


let validateMove = (state, requestedMove) => _.chain(validMoves(state))
    .filter(_.matches(requestedMove))
    .map(({ cards, src, dst }) => ({ 
        [src]: _.chain(state[src])
            .differenceWith(cards, _.isEqual)
            .thru(remaining => (_.negate(_.eq)(src, 'draw') 
                ? remaining.map((o, i) => (_.eq(i, remaining.length - 1)
                    ? {...o, up: true} : o))
                : remaining))
            .value(),
        [dst]: _.chain(state[dst])
            .concat(cards.map(card => ({...card, up: !_.eq(dst, 'draw')})))
            .value()}))
    .thru((deltas) => (_.isEmpty(deltas)
        ? {error: "The requested move is invalid"}
        : {...state, ...deltas[0]}))
    .value();


module.exports = {
    shuffleCards: shuffleCards,
    initialState: initialState,
    filterForProfile: filterForProfile,
    validateMove: validateMove
};