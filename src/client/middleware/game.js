'use strict';

import { gameDeselect, gameSelect, gameMove, gameInit, gameDraw } from '../actions/game';

export const gameMiddleware = ({ getState, dispatch }) => next => action => {
  switch (action.type) {
    case 'GAME_DRAW': {
      const { game } = getState();
      const move = game.draw.length
        ? {
            cards: _.takeRight(game.draw, game.drawCount).reverse(),
            src: 'draw',
            dst: 'discard'
        }
        : {
          cards: [...game.discard].reverse(),
          src: 'discard',
          dst: 'draw'
        };
      dispatch(gameMove(move, game.id));
      break;
    }
    case 'GAME_FETCH': {
      dispatch(gameInit(action.gameID));
      next(action);
      break;
    }
    case 'GAME_CLICK': {
      if (action.payload === undefined) {
        dispatch(gameDeselect());
        return;
      } else {
        const { game } = getState();
        if (action.payload.pile === 'draw') {
          dispatch(gameDraw());
        } else if (game.selection === null) {
          dispatch(gameSelect(action.payload));
          return;
        } else {
          const move = {
            cards: game.selection.items,
            src: game.selection.pile,
            dst: action.payload.pile
          };
          dispatch(gameMove(move, game.id));
          dispatch(gameDeselect());
          return;
        }
      }
      next(action);
      break;
    }
    case 'GAME_MOVE_REJECTED': {
      break;
    }
    default: {
      next(action);
      break;
    }
  }
};