/* Copyright G. Hemingway, 2017 - All rights reserved */
'use strict';

import React, { Component }     from 'react';
import PropTypes                from 'prop-types';
import {} from './card.css';

/*************************************************************************/

export const Card = ({ card, top, left, genOnClick, index, pile }) => {
    const source = card.up ? `/images/${card.value}_of_${card.suit}.png` : "/images/face_down.jpg";
    const style = {left: `${left}%`, top: `${top}%`};
    const id = `${card.suit}:${card.value}`;
    return <img
        id={id}
        onClick={genOnClick({ pile, index })}
        className="card"
        style={style}
        src={source}
    />;
};

export class Pile extends Component {
    render() {
        const cards = this.props.cards.map((card, index) => {
            let top = this.props.horizontal ? 0 : index * this.props.spacing ;
            let left = this.props.horizontal ? index * this.props.spacing : 0;
            return <Card
                key={index}
                card={card}
                up={this.props.up}
                top={top}
                left={left}
                genOnClick={this.props.genOnClick}
                pile={this.props.pile}
                index={index}
            />;
        });
        const className = this.props.className ?
            "card-pile " + this.props.className :
            "card-pile";
        return <div className={className} onClick={this.props.genOnClick({
            empty: true,
            pile: this.props.pile
        })}>
            <div className="card-pile-frame"/>
            {cards}
        </div>;
    }
}

Pile.propTypes = {
    cards:      PropTypes.arrayOf(PropTypes.object).isRequired,
    genOnClick: PropTypes.func,
    pile:       PropTypes.string,
    horizontal: PropTypes.bool,
    spacing:    PropTypes.number,
    maxCards:   PropTypes.number,
    top:        PropTypes.number,
    left:       PropTypes.number
};
Pile.defaultProps = {
    horizontal: false,      // Layout horizontal?
    spacing:    8           // In percent
};
