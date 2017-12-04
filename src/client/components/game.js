/* Copyright G. Hemingway, 2017 - All rights reserved */
'use strict';


import React, { Component }     from 'react';
import { withRouter }           from 'react-router';

import { connect }                  from 'react-redux';

import { gameFetch, gameMove, gameUndo, gameRedo, gameClick } from '../actions/game';

/*************************************************************************/

import { Pile } from './pile';
import { ButtonToolbar, Button } from 'react-bootstrap';

class Game extends Component {
    constructor(props) {
        super(props);

        this.onBoardClick = this.onBoardClick.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);
        this.genOnClick = this.genOnClick.bind(this);
    }
    
    componentDidMount() {
        this.props.dispatch(gameFetch(this.props.match.params.id));
        document.addEventListener('keyup', this.onKeyUp, false);
    }

    componentWillUnmount() {
        document.removeEventListener('keyup', this.onKeyUp, false);
    }

    onKeyUp(ev) {
        console.log(ev);
        switch(ev.key) {
            case 'z': {
                this.props.dispatch(gameUndo(this.props.match.params.id));
                break;
            }
            case 'Z': {
                this.props.dispatch(gameRedo(this.props.match.params.id));
                break;
            }
        }
    }

    onBoardClick(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        this.props.dispatch(gameClick());
    }

    genOnClick({ pile, index }) {
        return (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            this.props.dispatch(gameClick({pile,index}));
        };
    }

    render() {
        return <div style={{ height: '100%' }} onClick={this.onBoardClick}>
            <ButtonToolbar>
                <Button
                    disabled={this.props.state.order === 0}
                    onClick={
                        () => this.props.dispatch(gameUndo(this.props.match.params.id))
                    }
                >Undo</Button>
                <Button 
                    disabled={
                        this.props.state.stateIndex === this.props.state.finalIndex
                    }
                    onClick={
                        () => this.props.dispatch(gameRedo(this.props.match.params.id))
                    }
                >Redo</Button>
            </ButtonToolbar>
            <div className="card-row">
                <Pile
                    cards={this.props.state.stack1.slice(-1)}
                    spacing={0}
                    genOnClick={this.genOnClick}
                    pile="stack1"
                />
                <Pile
                    cards={this.props.state.stack2.slice(-1)}
                    spacing={0}
                    genOnClick={this.genOnClick}
                    pile="stack2"
                />
                <Pile
                    cards={this.props.state.stack3.slice(-1)}
                    spacing={0}
                    genOnClick={this.genOnClick}
                    pile="stack3"
                />
                <Pile
                    cards={this.props.state.stack4.slice(-1)}
                    spacing={0}
                    genOnClick={this.genOnClick}
                    pile="stack4"
                />
                <div className="card-row-gap"/>
                <Pile
                    cards={this.props.state.draw.slice(-1)}
                    spacing={0}
                    genOnClick={this.genOnClick}
                    pile="draw"
                />
                <Pile
                    cards={this.props.state.discard.slice(-this.props.state.drawCount)}
                    horizontal={true}
                    genOnClick={this.genOnClick}
                    pile="discard"
                />
            </div>
            <div className="card-row">
                <Pile 
                    cards={this.props.state.pile1}
                    spacing={14}
                    genOnClick={this.genOnClick}
                    pile="pile1"
                />
                <Pile 
                    cards={this.props.state.pile2}
                    spacing={14}
                    genOnClick={this.genOnClick}
                    pile="pile2"
                />
                <Pile 
                    cards={this.props.state.pile3}
                    spacing={14}
                    genOnClick={this.genOnClick}
                    pile="pile3"
                />
                <Pile 
                    cards={this.props.state.pile4}
                    spacing={14}
                    genOnClick={this.genOnClick}
                    pile="pile4"
                />
                <Pile 
                    cards={this.props.state.pile5}
                    spacing={14}
                    genOnClick={this.genOnClick}
                    pile="pile5"
                />
                <Pile 
                    cards={this.props.state.pile6}
                    spacing={14}
                    genOnClick={this.genOnClick}
                    pile="pile6"
                />
                <Pile 
                    cards={this.props.state.pile7}
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
}))(Game);

export default withRouter(GameConnect);