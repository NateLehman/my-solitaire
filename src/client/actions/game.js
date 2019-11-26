

export const gameInit = gameID => ({
  type: 'GAME_INIT',
  payload: gameID,
});

export const gameFetch = gameID => ({
  type: 'GAME_FETCH',
  payload: axios.get(`/v2/game/${gameID}`),
  gameID,
});

export const gameMove = (move, gameID) => ({
  type: 'GAME_MOVE',
  payload: axios.put(`/v2/game/${gameID}`, move).catch((err) => {
    if (err.response.data.error === 'The requested move is invalid') {
      // false object since there's no move
      return false;
    }
    return err;
  }),
});

export const gameUndo = gameID => ({
  type: 'GAME_UNDO',
  payload: axios.put(`/v2/game/${gameID}/undo`),
});

export const gameRedo = gameID => ({
  type: 'GAME_REDO',
  payload: axios.put(`/v2/game/${gameID}/redo`),
});

export const gameGoto = (state, gameID) => ({
  type: 'GAME_GOTO',
  payload: axios.put(`/v2/game/${gameID}/goto`, { state }),
});

export const gameClick = payload => ({
  type: 'GAME_CLICK',
  payload,
});

export const gameSelect = payload => ({
  type: 'GAME_SELECT',
  payload,
});

export const gameDeselect = () => ({
  type: 'GAME_DESELECT',
});

export const gameDraw = () => ({
  type: 'GAME_DRAW',
});

export const gameAutoComp = gameID => ({
  type: 'GAME_AUTOCOMPLETE',
  payload: axios.get(`/v2/game/${gameID}`),
});
