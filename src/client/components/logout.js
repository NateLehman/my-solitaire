/* Copyright G. Hemingway, 2017 - All rights reserved */


import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';


class Logout extends Component {
  componentWillMount() {
    axios.delete('/v1/session')
      .then(() => this.props.user.logOut(this.props.history));
  }

  render() {
    return <div />;
  }
}

export default withRouter(Logout);
