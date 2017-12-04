"use strict";

const Joi = require('joi');
const _ = require('lodash');
const Solitare = require('../../solitare');

module.exports = app => {
  
  // Create a new game
  app.post('/v2/game', (req, res) => {
    if (!req.session.user) {
      res.status(401).send({ error: 'unauthorized' });
      return;
    }
    
    // cursory schema
    const schema = Joi.object().keys({
      game: Joi.string().lowercase().required(),
      color: Joi.string().lowercase().required(),
      draw: Joi.any()
    });
    
    Joi.validate(req.body, schema, {stripUnknown: true}, (err, data) => {
      if (err) {
        const message = err.details[0].message;
        console.log(`Game.create validation failure: ${message}`);
        res.status(400).send({error: message});
      } else {
        const newGame = {
          owner: req.session.user._id,
          active: true,
          cards_remaining: 52,
          color: data.color,
          game: data.game,
          score: 0,
          start: Date.now(),
          winner: "",
          moves: [],
          availableMoves: [],
          state: []
        };
        
        switch(data.draw) {
          case 'Draw 1': newGame.drawCount = 1; break;
          case 'Draw 3': newGame.drawCount = 3; break;
        }
        
        // Generate a new initial game state
        newGame.state.push(Solitare.initialState());
        
        // Full calculate initial moves
        newGame.availableMoves.push({moves: Solitare.initialValidMoves(newGame.state[0], newGame.drawCount)});
        
        // create db model instance
        const game = new app.models.Game(newGame);
        
        // save
        game.save(err => {
          if (err) {
            console.log(`Game.create save failure: ${err}`);
            res.status(400).send({error: 'failure creating game'});
            // TODO: Much more error management needs to happen here
          } else {
            const query = {$push: {games: game._id}};
            // Save game to user's document too
            app.models.User.findOneAndUpdate(
              { _id: req.session.user._id },
              query
            ).then(() => {
              res.status(201).send({id: game._id});
            }).catch(err => {
              // TODO something?
            });
          }
        });
      }
    });
  });
  
  // attempt move
  app.put('/v2/game/:id', (req, res) => {
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
            .select('state moves drawCount availableMoves')
            .then(game => {
              if (!game) {
                res.status(404).send({error: `unknown game: ${req.params.id}`});
              } else {
                const currentState = {
                  ..._.last(game.state).toObject(),
                  drawCount: game.drawCount
                };
                const currentMoves = _.last(game.availableMoves).toObject();
                const nextState = Solitare.validateMoveWithMoves(currentState, currentMoves.moves, data);

                if ('error' in nextState) {
                  console.log(`Game.move failure: ${nextState.error}`);
                  res.status(400).send({error: nextState.error});
                } else {
                  const nextMoves = {moves: _.cloneDeep(Solitare.initialValidMoves(nextState, game.drawCount))}

                  game.update({
                    $push: {
                      state: _.cloneDeep(nextState),
                      moves: _.cloneDeep(data),
                      availableMoves: nextMoves,
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
  
  
};