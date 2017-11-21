/* Copyright G. Hemingway, 2017 - All rights reserved */
'use strict';


import React, { Component }     from 'react';
import { withRouter }           from 'react-router';

/*************************************************************************/

class Start extends Component {
    constructor(props) {
        super(props);
        this.state = {
            games: ['klondike', 'pyramid', 'canfield', 'golf', 'yukon', 'hearts'],
            selected: 'klondike'
        };
        this.onSubmit = this.onSubmit.bind(this);
        this.onChange = this.onChange.bind(this);
    }

    onSubmit(ev) {
        ev.preventDefault();
        const data = {
            game: this.state.selected,
            draw: document.getElementById('draw').value,
            color: document.getElementById('color').value
        };
        $.ajax({
            url: "/v1/game",
            method: "post",
            data: data
        }).then(data => {
            this.props.history.push(`/game/${data.id}`);
        }).fail(err => {
            let errorEl = document.getElementById('errorMsg');
            errorEl.innerHTML = `Error: ${err.responseJSON.error}`;
        });
    }

    onChange(ev) {
        if(this.state.selected !== ev.target.value) {
            this.setState({ selected: ev.target.value });
        }
    }

    render() {
        const games = this.state.games.map((game, index) => {
            return <div key={index} className="radio">
                <label>
                    <input type="radio" name="game" value={game} checked={game === this.state.selected} onChange={this.onChange}/>
                    {game}
                </label>
            </div>
        });
        return <div className="row">
            <div className="col-xs-2"/>
            <div className="col-xs-8">
                <div className="center-block">
                    <p id="errorMsg" className="bg-danger"/>
                </div>
                <h4>Create New Game</h4>
                <form className="form-horizontal" action="/start" method="post">
                    <div className="form-group col-xs-4">{games}</div>
                    <div className="form-group col-xs-8">
                        <div className="row">
                            <div className="col-xs-12">
                                <label className="control-label" htmlFor="draw">Draw:</label>
                                <select id="draw" name="draw" className="form-control" disabled={'hearts' === this.state.selected}>
                                    <option>Draw 1</option>
                                    <option>Draw 3</option>
                                </select>
                            </div>
                            <div className="col-xs-12">
                                <label className="control-label" htmlFor="color">Card Color:</label>
                                <select id="color" name="color" className="form-control">
                                    <option>Red</option>
                                    <option>Green</option>
                                    <option>Blue</option>
                                    <option>Magical</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="form-group col-xs-12">
                        <button className="btn btn-default" onClick={this.onSubmit}>Start</button>
                    </div>
                </form>
            </div>
        </div>
    }
}

export default withRouter(Start);
