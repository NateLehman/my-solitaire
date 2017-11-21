/* Copyright G. Hemingway, 2017 - All rights reserved */
'use strict';


import React, { Component }     from 'react';
import { withRouter }           from 'react-router-dom';

/*************************************************************************/

export class Logout extends Component {
    componentWillMount() {
        this.props.user.logOut(this.props.history);
    }

    render() {
        return <div/>;
    }
}

export default withRouter(Logout);
