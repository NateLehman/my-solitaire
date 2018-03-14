

import { gameDeselect, gameSelect, gameMove, gameInit, gameDraw, gameAutoComp } from '../actions/game';

const gameMiddleware = ({ getState, dispatch }) => next => (action) => {
  switch (action.type) {
    case 'GAME_DRAW': {
      const { game } = getState();
      const move = game.draw.length
        ? {
          cards: _.takeRight(game.draw, game.drawCount).reverse(),
          src: 'draw',
          dst: 'discard',
        }
        : {
          cards: [...game.discard].reverse(),
          src: 'discard',
          dst: 'draw',
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
      }
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
          dst: action.payload.pile,
        };
        dispatch(gameMove(move, game.id));
        return;
      }

      next(action);
      break;
    }
    case 'GAME_MOVE_REJECTED': {
      dispatch(gameDeselect());
      next(action);
      break;
    }
    case 'GAME_MOVE_FULFILLED': {
      dispatch(gameDeselect());
      next(action);
      break;
    }
    case 'GAME_AUTOCOMPLETE_FULFILLED': {
      const { game } = getState();
      const autoMoves = action.payload.data.availableMoves
        .filter(move => (move.src.startsWith('pile') || move.src === 'discard')
          && move.dst.startsWith('stack'));
      if (autoMoves.length) {
        _.uniqBy(autoMoves, move => move.src)
          .forEach(move => dispatch(gameMove(move, game.id)));
        dispatch(gameAutoComp(game.id));
      }
      next(action);
      break;
    }
    default: {
      next(action);
      break;
    }
  }
};

export default gameMiddleware;
