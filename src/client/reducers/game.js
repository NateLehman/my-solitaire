'use strict';

const initialState = {
  startDrag: { x: 0, y: 0 },
  pile1: [],
  pile2: [],
  pile3: [],
  pile4: [],
  pile5: [],
  pile6: [],
  pile7: [],
  stack1: [],
  stack2: [],
  stack3: [],
  stack4: [],
  draw: [],
  discard: [],
  selected: null,
  fetched: false
};

export const gameReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'GAME_FETCH_FULFILLED': {
      return {...state, ...action.payload.data, fetched: true};
      break;
    }
    case 'GAME_FETCH_REJECTED': {
      break;
    }
    default: {
      return {...state};
      break;
    }
  }
};