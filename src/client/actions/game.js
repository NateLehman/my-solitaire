'use strict';

export const gameFetch = (gameID) => {
  return {
    type: 'GAME_FETCH',
    payload: axios.get(`/v1/game/${gameID}`)
  };
};