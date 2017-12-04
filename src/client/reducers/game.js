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
  selection: null,
  fetched: false
};

export const gameReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'GAME_SELECT': {
      const { pile, index } = action.payload;
      const isTableau = pile.startsWith('pile');
      if (!state[pile].length) return state; // return false;
      if (isTableau && state[pile][index].up !== true) return state;// return false;
      const selection = (isTableau) ? state[pile].slice(index) : state[pile].slice(-1);
      return {...state, selection: { pile: action.payload.pile, items: selection }};
      break;
    }
    case 'GAME_DESELECT': {
      return {...state, selection: null};
      break;
    }
    case 'GAME_MOVE_FULFILLED': {
      if (!action.payload) {
        return state;
      } else {
        return {
          ...state,
          ...action.payload.data,
          stateIndex: state.stateIndex + 1,
          finalIndex: state.stateIndex + 1,
        }
      };
      break;
    }
    case 'GAME_GOTO_FULFILLED': {
      return {
        ...state,
        ...action.payload.data,
      };
    }
    case 'GAME_UNDO_FULFILLED':
      return {
        ...state,
        ...action.payload.data,
        stateIndex: state.stateIndex - 1,
      };
      break;
    case 'GAME_REDO_FULFILLED': {
      return {
        ...state,
        ...action.payload.data,
        stateIndex: state.stateIndex + 1,
      };
      break;
    }
    case 'GAME_INIT': {
      return {...state, id: action.payload};
      break;
    }
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