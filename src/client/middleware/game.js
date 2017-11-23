'use strict';



export const gameMiddleware = ({ getState, dispatch }) => next => action => {
  switch (action.type) {
    case 'GAME_FETCH': {
      next(action);
      break;
    }
    case 'GAME_FETCH_FULFILLED': {
      next(action);
      break;
    }
    case 'GAME_FETCH_REJECTED': {
      next(action);
      break;
    }
  }
};