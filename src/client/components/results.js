/* Copyright G. Hemingway, 2017 - All rights reserved */
'use strict';

import React, { Component }         from 'react';
import { withRouter, Link }         from 'react-router-dom';
import  moment                  from 'moment';

import { connect }                  from 'react-redux';

import { gameGoto }                 from '../actions/game';

/*************************************************************************/

const Move = ({ move, index, handleClick }) => {
    const duration = moment(move.start).from(move.end, true);
    const exactDuration = moment(move.end).diff(move.start, 'seconds', true);
    return <tr onClick={handleClick}>
        <th>{move.id ? move.id : index + 1}</th>
        <th>{duration} ({exactDuration}s)</th>
        <th><Link onClick={(ev) => ev.stopPropagation()} to={`/profile/${move.player}`}>{move.player}</Link></th>
        <th>{move.move}</th>
    </tr>
};

class Results extends Component {
    constructor(props) {
        super(props);
        this.state = {
            game: {
                moves: []
            }
        }
    }

    componentDidMount() {
        axios.get(`/v1/game/${this.props.match.params.id}`)
            .then(({data}) => this.setState({game: data}))
            .catch(err => {
                console.log(err);
                let errorEl = document.getElementById('errorMsg');
                errorEl.innerHTML = `Error: ${err.response.data.error}`;
            });
    }

    render() {
        let moves = this.state.game.moves.map((move, index) => (
            <Move key={index} move={move} index={index} handleClick={() => {
                console.log('fire');
                this.props.dispatch(gameGoto(index, this.props.match.params.id));
                this.props.history.push(`/game/${this.props.match.params.id}`);
            }}/>
        ));
        const duration = this.state.game.start ? moment().from(this.state.game.start, true) : '--';
        return <div className="row">
            <div className="center-block">
                <p id="errorMsg" className="bg-danger"/>
            </div>
            <div className="col-xs-2"><h4>Game Detail</h4></div>
            <div className="col-xs-10">
                <div className="row">
                    <div className="col-xs-3 text-right">
                        <p><b>Duration:</b></p>
                        <p><b>Number of Moves:</b></p>
                        <p><b>Points:</b></p>
                        <p><b>Cards Remaining:</b></p>
                        <p><b>Able to Move:</b></p>
                    </div>
                    <div className="col-xs-6">
                        <p>{duration}</p>
                        <p>{this.state.game.moves.length}</p>
                        <p>{this.state.game.score}</p>
                        <p>{this.state.game.cards_remaining}</p>
                        <p>{this.state.game.active? "Active" : "Complete"}</p>
                    </div>
                </div>
                <div className="row">
                    <table id="gameTable" className="col-xs-12 table">
                        <thead>
                        <tr>
                            <th>Id</th>
                            <th>Duration</th>
                            <th>Player</th>
                            <th>Move Details</th>
                        </tr>
                        </thead>
                        <tbody>{moves}</tbody>
                    </table>
                </div>
            </div>
        </div>;
    }
}

const ResultsConnect = connect(store => ({
    game: store.game
}))(Results);

export default withRouter(ResultsConnect);
