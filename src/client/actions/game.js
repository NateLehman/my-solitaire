'use strict';

export const gameInit = (gameID) => {
  return {
    type: 'GAME_INIT',
    payload: gameID,
  };
};

export const gameFetch = (gameID) => {
  return {
    type: 'GAME_FETCH',
    payload: axios.get(`/v2/game/${gameID}`),
    gameID,
  };
};

export const gameMove = (move, gameID) => {
  return {
    type: 'GAME_MOVE',
    payload: axios.put(`/v2/game/${gameID}`, move).catch(err => {
      if (err.response.data.error === 'The requested move is invalid') {
        // empty object since there's no move
        return false;
      } else {
        return err; 
      }
    }),
  };
};

export const gameUndo = (gameID) => {
  return {
    type: 'GAME_UNDO',
    payload: axios.put(`/v2/game/${gameID}/undo`),
  };
};

export const gameRedo = (gameID) => {
  return {
    type: 'GAME_REDO',
    payload: axios.put(`/v2/game/${gameID}/redo`),
  };
};

export const gameGoto = (state, gameID) => {
  return {
    type: 'GAME_GOTO',
    payload: axios.put(`/v2/game/${gameID}/goto`, {state}),
  }
}

export const gameClick = (payload) => {
  return {
    type: 'GAME_CLICK',
    payload: payload,
  };
};

export const gameSelect = (payload) => {
  return {
    type: 'GAME_SELECT',
    payload: payload,
  };
};

export const gameDeselect = () => {
  return {
    type: 'GAME_DESELECT',
  };
};

export const gameDraw = () => {
  return {
    type: 'GAME_DRAW',
  };
};