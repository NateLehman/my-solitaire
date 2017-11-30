"use strict";

const Joi = require('joi');
const _ = require('lodash');
const Solitare = require('../../solitare');

module.exports = app => {
  
  // Create a new game
  app.post('/v1/game', (req, res) => {
    if (!req.session.use) {
      res.status(401).send({ error: 'unauthorized' });
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

        // TODO: Full calculate initial moves

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


};