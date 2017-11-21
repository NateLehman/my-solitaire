/* Copyright G. Hemingway @2017 - All rights reserved */
"use strict";

let mongoose            = require('mongoose'),
    Schema              = mongoose.Schema;

/***************** User Model *******************/

/* Schema for individual player state within Hearts */
let CardState = new Schema({
    suit:       { type: String, required: true, enum: ['hearts', 'spades', 'diamonds', 'clubs'] },
    value:      { type: String, required: true, enum: ['ace', 2, 3, 4, 5, 6, 7, 8, 9, 10, 'jack', 'queen', 'king'] },
    up:         { type: Boolean, required: true, default: false }
}, { _id : false });

/* Schema for overall hearts game state */
let KlondikeGameState = new Schema({
    pile1:      { type: [ CardState ] },
    pile2:      { type: [ CardState ] },
    pile3:      { type: [ CardState ] },
    pile4:      { type: [ CardState ] },
    pile5:      { type: [ CardState ] },
    pile6:      { type: [ CardState ] },
    pile7:      { type: [ CardState ] },
    stack1:     { type: [ CardState ] },
    stack2:     { type: [ CardState ] },
    stack3:     { type: [ CardState ] },
    stack4:     { type: [ CardState ] },
    discard:    { type: [ CardState ] },
    draw:       { type: [ CardState ] }
}, { _id : false });

/* Schema for an individual move of Klondike */
let KlondikeMove = new Schema({
    'cards':    { type: [CardState] },
    'src':      { type: String },
    'dst':      { type: String }
}, { _id : false });

/* Schema for overall game - not completely Klondike specific */
let Game = new Schema({
    owner:      { type: String, ref: 'User', required: true },
    start:      { type: Date },
    end:        { type: Date },
    state:      { type: [KlondikeGameState] },
    game:       { type: String, required: true, enum: [
        'klondike',
        'pyramid',
        'canfield',
        'golf',
        'yukon',
        'hearts'
    ] },
    active:     { type: Boolean, default: true },
    color:      { type: String, default: 'red' },
    drawCount:  { type: Number, default: 1 },
    score:      { type: Number, default: 0 },
    winner:     { type: String, default: '' },
    moves:      { type: [KlondikeMove] }
});

Game.pre('validate', function(next) {
    this.start = Date.now();
    next();
});

/***************** Registration *******************/

module.exports = mongoose.model('Game', Game);

