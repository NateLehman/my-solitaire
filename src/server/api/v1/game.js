/* Copyright G. Hemingway @2017 - All rights reserved */
"use strict";

let Joi             = require('joi'),
    _               = require('lodash'),
    Solitare        = require('../../solitare');


module.exports = app => {

    // Create a new game
    app.post('/v1/game', (req, res) => {
        if (!req.session.user) {
            res.status(401).send({ error: 'unauthorized' });
        } else {
            // Schema for user info validation
            let schema = Joi.object().keys({
                game: Joi.string().lowercase().required(),
                color: Joi.string().lowercase().required(),
                draw: Joi.any()
            });
            // Validate user input
            Joi.validate(req.body, schema, {stripUnknown: true}, (err, data) => {
                if (err) {
                    const message = err.details[0].message;
                    console.log(`Game.create validation failure: ${message}`);
                    res.status(400).send({error: message});
                } else {
                    // Set up the new game
                    let newGame = {
                        owner:          req.session.user._id,
                        active:         true,
                        cards_remaining: 52,
                        color:          data.color,
                        game:           data.game,
                        score:          0,
                        start:          Date.now(),
                        winner:         "",
                        moves:          [],
                        state:          []
                    };
                    switch(data.draw) {
                        case 'Draw 1': newGame.drawCount = 1; break;
                        case 'Draw 3': newGame.drawCount = 3; break;
                    }
                    // Generate a new initial game state
                    newGame.state.push(Solitare.initialState());
                    let game = new app.models.Game(newGame);
                    game.save(err => {
                        if (err) {
                            console.log(`Game.create save failure: ${err}`);
                            res.status(400).send({ error: 'failure creating game' });
                            // TODO: Much more error management needs to happen here
                        } else {
                            const query = { $push: { games: game._id }};
                            // Save game to user's document too
                            app.models.User.findOneAndUpdate({ _id: req.session.user._id }, query, () => {
                                res.status(201).send({
                                    id: game._id
                                });
                            });
                        }
                    });
                }
            });
        }
    });

    // Fetch game information
    app.get('/v1/game/:id', (req, res) => {
        if (!req.session.user) {
            res.status(401).send({error: 'unauthorized'});
            return;
        }

        app.models.Game.findById(req.params.id)
            .then(game => {
                if (!game) {
                    res.status(404).send({error: `unknown game: ${req.params.id}`});
                } else {
                    const state = _.last(game.state).toJSON();
                    const results = _.pick(
                        game.toJSON(),
                        'start',
                        'moves',
                        'winner',
                        'score',
                        'drawCount',
                        'color',
                        'active'
                    );
                    results.start = Date.parse(results.start);
                    results.cards_remaining = 52 - (
                        state.stack1.length + 
                        state.stack2.length + 
                        state.stack3.length + 
                        state.stack4.length
                    );
                    res.status(200).send(_.extend(results, state));
                }
            })
            .catch(err => {
                console.log(`Game.get failure: ${err}`);
                res.status(404).send({error: `unknown game: ${req.params.id}`});
            });
    });

    // attempt move
    app.put('/v1/game/:id', (req, res) => {
        if (!req.session.user) {
            res.status(401).send({ error: 'unauthorized' });
        } else {
            // Schema for user info validation
            let schema = Joi.object().keys({
                cards: Joi.array().items(Joi.object().keys({
                    suit: Joi.string().valid('diamonds', 'hearts', 'spades', 'clubs'),
                    value: Joi.string().allow('ace', 'jack', 'king', 'queen').allow(_.range(2, 11)),
                    up: Joi.boolean()
                })),
                src: Joi.string().regex(/^stack[1-4]$|^pile[1-7]$/).allow('draw', 'discard'),
                dst: Joi.string().regex(/^stack[1-4]$|^pile[1-7]$/).allow('draw', 'discard')
            });
            Joi.validate(req.body, schema, {stripUnknown: true}, (err, data) => {
                if (err) {
                    const message = err.details[0].message;
                    console.log(`Game.move validation failure: ${message}`);
                    res.status(400).send({error: message});
                } else {
                    app.models.Game.findById(req.params.id)
                        .select('state moves drawCount')
                        .then(game => {
                            if (!game) {
                                res.status(404).send({error: `unknown game: ${req.params.id}`});
                            } else {
                                const currentState = {
                                    ..._.last(game.state).toObject(),
                                    drawCount: game.drawCount
                                };
                                const nextState = Solitare.validateMove(currentState, data);
                                if ('error' in nextState) {
                                    console.log(`Game.move failure: ${nextState.error}`);
                                    res.status(400).send({error: nextState.error});
                                } else {
                                    game.update({
                                        $push: {
                                            state: _.cloneDeep(nextState),
                                            moves: _.cloneDeep(data)
                                        }
                                    }).then(() => {
                                        res.status(201).send(nextState);
                                    }).catch(err => {
                                        console.log(`Game.move failure: ${err.message}`);
                                    })
                                }
                            }
                        }, err => {
                            console.log(`Game.move failure: ${err}`);
                            res.status(404).send({error: `unknown game: ${req.params.id}`});
                        });
                }
            });
        }
    });


    // Provide end-point to request shuffled deck of cards and initial state - for testing
    app.get('/v1/cards/shuffle', (req, res) => {
        res.send(Solitare.shuffleCards(false));
    });
    app.get('/v1/cards/initial', (req, res) => {
        res.send(Solitare.initialState());
    });

};
