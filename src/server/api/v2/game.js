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
  
  // Fetch game information
  app.get('/v2/game/:id', (req, res) => {
    if (!req.session.user) {
      res.status(401).send({error: 'unauthorized'});
      return;
    }
    
    app.models.Game.findById(req.params.id)
    .then(game => {
      if (!game) {
        res.status(404).send({error: `unknown game: ${req.params.id}`});
      } else {
        const state = game.state[game.stateIndex].toJSON();
        const results = _.pick(
          game.toJSON(),
          'start',
          'moves',
          'winner',
          'score',
          'drawCount',
          'color',
          'active',
          'stateIndex',
          'finalIndex'
        );
        results.start = Date.parse(results.start);
        results.cards_remaining = 52 - (
          state.stack1.length + 
          state.stack2.length + 
          state.stack3.length + 
          state.stack4.length
        );
        results.moves = results.moves.filter((move, index) => index < results.finalIndex);
        res.status(200).send(_.extend(results, state));
      }
    })
    .catch(err => {
      console.log(`Game.get failure: ${err}`);
      res.status(404).send({error: `unknown game: ${req.params.id}`});
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
          .then(game => {
            if (!game) {
              res.status(404).send({error: `unknown game: ${req.params.id}`});
            } else {
              const currentState = game.state[game.stateIndex].toObject();
              const currentMoves = game.availableMoves[game.stateIndex].toObject();
              const nextState = Solitare.validateMoveWithMoves(currentState, currentMoves.moves, data);
              nextState.order = currentState.order + 1;
              
              if ('error' in nextState) {
                console.log(`Game.move failure: ${nextState.error}`);
                res.status(400).send({error: nextState.error});
              } else {
                const nextMoves = { 
                  moves: _.cloneDeep(Solitare.initialValidMoves(nextState, game.drawCount)),
                  order: currentMoves.order + 1
                };
                
                let lastMoveEndTime = game.start;
                if (game.stateIndex > 0) {
                  lastMoveEndTime = game.moves[game.stateIndex - 1].end;
                }

                let points = game.score;
                if (data.src === 'discard' && data.dst.startsWith('pile')) {
                  points += 5;
                }
                if (data.src === 'discard' && data.dst.startsWith('stack')) {
                  points += 10;
                }
                if (data.src.startsWith('pile') && data.dst.startsWith('stack')) {
                  points += 10;
                }
                if (data.src.startsWith('pile') && nextState[data.src].length) {
                  if (currentState[data.src][nextState[data.src].length-1].up === false) {
                    points += 5;
                  }
                }
                
                game
                  .update({
                    $set: {
                      [`moves.${nextState.order-1}`]: {
                        ...data,
                        start: lastMoveEndTime, 
                        end: Date.now(),
                        player: req.session.user.username
                      },
                      [`state.${nextState.order}`]: _.cloneDeep(nextState),
                      [`availableMoves.${nextState.order}`]: nextMoves,
                      stateIndex: nextState.order,
                      finalIndex: nextState.order,
                      score: points,
                    }
                  })
                  .then(() => {
                    res.status(201).send(
                      nextState
                    );
                  }).catch(err => {
                    console.log(`Game.move failure: ${err.message}`);
                  });
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
  
  app.put('/v2/game/:id/undo', (req, res) => {
    if (!req.session.user) {
      res.status(401).send({ error: 'unauthorized' });
    } else {
      let schema = Joi.object().keys({
        step: Joi.number().positive().default(1),
      });
      Joi.validate(req.body, schema, {stripUnknown: true}, (err, data) => {
        if (err) {
          const message = err.details[0].message;
          console.log(`Game.undo validation failure: ${message}`);
          res.status(400).send({error: message});
        } else {
          app.models.Game.findById(req.params.id)
            .then(game => {
              if (!game) {
                res.status(404).send({error: `unknown game: ${req.params.id}`});
              } else {
                if (game.stateIndex < data.step) {
                  res.status(400).send({error: 'state too far back'});
                } else {
                  game.update({
                    $set: {
                      stateIndex: game.stateIndex - data.step
                    }
                  }).then(() => {
                    res.status(201).send(game.state[game.stateIndex - data.step].toJSON());
                  }).catch(err => {
                    console.log(`Game.undo failure: ${err.message}`);
                  });
                }
              }
            });
        }
      });
    }
  });

  app.put('/v2/game/:id/redo', (req, res) => {
    if (!req.session.user) {
      res.status(401).send({ error: 'unauthorized' });
    } else {
      let schema = Joi.object().keys({
        step: Joi.number().positive().default(1),
      });
      Joi.validate(req.body, schema, {stripUnknown: true}, (err, data) => {
        if (err) {
          const message = err.details[0].message;
          console.log(`Game.redo validation failure: ${message}`);
          res.status(400).send({error: message});
        } else {
          app.models.Game.findById(req.params.id)
            .then(game => {
              if (!game) {
                res.status(404).send({error: `unknown game: ${req.params.id}`});
              } else {
                if (game.finalIndex - game.stateIndex < data.step) {
                  res.status(400).send({error: 'state too far forward'});
                } else {
                  game.update({
                    $set: {
                      stateIndex: game.stateIndex + data.step
                    }
                  }).then(() => {
                    res.status(201).send(game.state[game.stateIndex + data.step].toJSON());
                  }).catch(err => {
                    console.log(`Game.redo failure: ${err.message}`);
                  });
                }
              }
            });
        }
      });
    }
  });

  app.put('/v2/game/:id/goto', (req, res) => {
    if (!req.session.user) {
      res.status(401).send({ error: 'unauthorized' });
    } else {
      let schema = Joi.object().keys({
        state: Joi.number().positive().default(1),
      });
      Joi.validate(req.body, schema, {stripUnknown: true}, (err, data) => {
        if (err) {
          const message = err.details[0].message;
          console.log(`Game.goto validation failure: ${message}`);
          res.status(400).send({error: message});
        } else {
          app.models.Game.findById(req.params.id)
            .then(game => {
              if (!game) {
                res.status(404).send({error: `unknown game: ${req.params.id}`});
              } else {
                if (data.state > game.finalIndex) {
                  res.status(400).send({error: 'state not in history'});
                } else {
                  game.update({
                    $set: {
                      stateIndex: data.state
                    }
                  }).then(() => {
                    res.status(201).send(
                      {...game.state[data.state].toJSON(), stateIndex: data.state}
                    );
                  }).catch(err => {
                    console.log(`Game.goto failure: ${err.message}`);
                  });
                }
              }
            });
        }
      });
    }
  });
};