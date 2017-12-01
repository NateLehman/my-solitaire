/* Copyright G. Hemingway, 2017 - All rights reserved */
'use strict';


import React, { Component }     from 'react';
import { withRouter }           from 'react-router';

import { connect }                  from 'react-redux';

import { gameFetch } from '../actions/game';

/*************************************************************************/

import { Pile } from './pile';

const nextCardVals = {
    'ace': '2',
    '2': '3',
    '3': '4',
    '4': '5',
    '5': '6',
    '6': '7',
    '7': '8',
    '8': '9',
    '9': '10',
    '10': 'jack',
    'jack': 'queen',
    'queen': 'king'
};

class Game extends Component {
    constructor(props) {
        super(props);
        this.state = {
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
            selected: null
        };

        this.onBoardClick = this.onBoardClick.bind(this);
        this.genOnClick = this.genOnClick.bind(this);
        this.genOnDrawClick = this.genOnDrawClick.bind(this);
        this.attemptMove = this.attemptMove.bind(this);
        this.attemptSelect = this.attemptSelect.bind(this);
    }
    
    componentDidMount() {
        this.props.dispatch(gameFetch(this.props.match.params.id));

        axios.get(`/v1/game/${this.props.match.params.id}`)
            .then(res => {
                this.setState({
                    pile1: res.data.pile1,
                    pile2: res.data.pile2,
                    pile3: res.data.pile3,
                    pile4: res.data.pile4,
                    pile5: res.data.pile5,
                    pile6: res.data.pile6,
                    pile7: res.data.pile7,
                    stack1: res.data.stack1,
                    stack2: res.data.stack2,
                    stack3: res.data.stack3,
                    stack4: res.data.stack4,
                    draw: res.data.draw,
                    discard: res.data.discard,
                    drawCount: res.data.drawCount,
                });
            })
            .catch(err => {
                // TODO: Should show a helpful error message that the game could not be found
                console.log(err);
            });
    }

    canPlaceCardTableau(src, dest) {
        if (dest === undefined) {
            if (src.value === 'king') {
                return true;
            }
            return false;
        }

        const possibleSuits = ['clubs', 'spades'].includes(src.suit)
            ? ['hearts', 'diamonds']
            : ['clubs', 'spades'];

        const possibleVal = nextCardVals[src.value];

        if (!possibleSuits.includes(dest.suit)) {
            return false;
        }
        if (dest.value !== possibleVal) {
            return false;
        }
        return true;
    }

    canPlaceCardFoundation(src, dest) {
        if (dest === undefined) {
            if (src.value === 'ace') {
                return true;
            }
            return false;
        }

        const possibleVal = (dest) ? nextCardVals[dest.value] : 'ace';

        if (src.suit !== dest.suit) {
            return false;
        }
        if (possibleVal !== src.value) {
            return false;
        }
        return true;
    }

    onBoardClick(ev) {
        ev.preventDefault();
        ev.stopPropagation();

        // deselect
        this.setState({ selected: null });
    }

    genOnClick({ pile, index }) {
        return (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            
            const targetPile = this.state[pile];
            
            if (this.state.selected !== null) {
                // cards are already selected
                const move = {
                    cards: this.state.selected.items,
                    src: this.state.selected.pile,
                    dst: pile
                };
                this.attemptMove(move);

                // always deselect at the end
                this.setState({
                    selected: null
                });
            } else {
                const selection = { pile, index };
                const selected = this.attemptSelect(selection);
            }
        };
    }

    genOnDrawClick({ pile }) {
        return (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            
            if (this.state.selected === null) {
                if (this.state.draw.length) {
                    const move = {
                        cards: _.takeRight(this.state.draw, this.state.drawCount).reverse(),
                        src: 'draw',
                        dst: 'discard'
                    };
                    this.attemptMove(move);
                } else {
                    const move = {
                        cards: [...this.state.discard].reverse(),
                        src: 'discard',
                        dst: 'draw'
                    }
                    this.attemptMove(move);
                }
            }
            this.setState({
                selected: null
            });
        };
    }

    attemptMove({ cards, src, dst }) {
        axios.put(`/v1/game/${this.props.match.params.id}`, { cards, src, dst })
            .then(({data}) => this.setState(data))
            .catch(err => console.log(err.response.data.error));
    }

    attemptSelect({ pile, index }) {
        const isTableau = pile.startsWith('pile');
        // check all for empty, if empty
        if (!this.state[pile].length) return false;
        if (isTableau && this.state[pile][index].up !== true) return false;
        const selection = (isTableau) ? this.state[pile].slice(index) : this.state[pile].slice(-1);
        this.setState({selected: { pile, items: selection }});
        return true;
    }

    render() {
        return <div style={{ height: '100%' }} onClick={this.onBoardClick}>
            <div className="card-row">
                <Pile
                    cards={this.state.stack1.slice(-1)}
                    spacing={0}
                    genOnClick={this.genOnClick}
                    pile="stack1"
                />
                <Pile
                    cards={this.state.stack2.slice(-1)}
                    spacing={0}
                    genOnClick={this.genOnClick}
                    pile="stack2"
                />
                <Pile
                    cards={this.state.stack3.slice(-1)}
                    spacing={0}
                    genOnClick={this.genOnClick}
                    pile="stack3"
                />
                <Pile
                    cards={this.state.stack4.slice(-1)}
                    spacing={0}
                    genOnClick={this.genOnClick}
                    pile="stack4"
                />
                <div className="card-row-gap"/>
                <Pile
                    cards={this.state.draw.slice(-1)}
                    spacing={0}
                    genOnClick={this.genOnDrawClick}
                    pile="draw"
                />
                <Pile
                    cards={this.state.discard.slice(-this.state.drawCount)}
                    horizontal={true}
                    genOnClick={this.genOnClick}
                    pile="discard"
                />
            </div>
            <div className="card-row">
                <Pile 
                    cards={this.state.pile1}
                    spacing={14}
                    genOnClick={this.genOnClick}
                    pile="pile1"
                />
                <Pile 
                    cards={this.state.pile2}
                    spacing={14}
                    genOnClick={this.genOnClick}
                    pile="pile2"
                />
                <Pile 
                    cards={this.state.pile3}
                    spacing={14}
                    genOnClick={this.genOnClick}
                    pile="pile3"
                />
                <Pile 
                    cards={this.state.pile4}
                    spacing={14}
                    genOnClick={this.genOnClick}
                    pile="pile4"
                />
                <Pile 
                    cards={this.state.pile5}
                    spacing={14}
                    genOnClick={this.genOnClick}
                    pile="pile5"
                />
                <Pile 
                    cards={this.state.pile6}
                    spacing={14}
                    genOnClick={this.genOnClick}
                    pile="pile6"
                />
                <Pile 
                    cards={this.state.pile7}
                    spacing={14}
                    genOnClick={this.genOnClick}
                    pile="pile7"
                />
            </div>
        </div>
    }
}

const GameConnect = connect(store => ({
    state: store.game
}))(Game)

export default withRouter(GameConnect);