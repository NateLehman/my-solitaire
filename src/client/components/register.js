/* Copyright G. Hemingway, 2017 - All rights reserved */


import React, { Component } from 'react';
import { withRouter } from 'react-router';


class Register extends Component {
  static validPassword(password) {
    if (!password || password.length < 8) {
      return { error: 'password length must be > 7' };
    } else if (!password.match(/[0-9]/i)) {
      return { error: 'password must contain a number' };
    } else if (!password.match(/[a-z]/)) {
      return { error: 'password a lowercase letter' };
    } else if (!password.match(/@|!|#|\$|%|\^/i)) {
      return { error: 'password must contain @, !, #, $, % or ^' };
    } else if (!password.match(/[A-Z]/)) {
      return { error: 'password an uppercase letter' };
    }
    return undefined;
  }

  constructor(props) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);
  }

  onSubmit(ev) {
    ev.preventDefault();
    const data = {
      username: document.getElementById('username').value,
      first_name: document.getElementById('first_name').value,
      last_name: document.getElementById('last_name').value,
      city: document.getElementById('city').value,
      primary_email: document.getElementById('primary_email').value,
      password: document.getElementById('password').value,
    };
    const errorEl = document.getElementById('errorMsg');
    const pwdInvalid = Register.validPassword(data.password);
    if (!data.username || data.username.length > 16 || data.username.length < 6
      || !data.username.match(/^[a-z0-9]+$/i)) {
      errorEl.innerHTML = 'Error: malformed username. Must be alphanumeric string between 6-16 characters';
    } else if (pwdInvalid) {
      errorEl.innerHTML = `Error: ${pwdInvalid.error}`;
    } else {
      axios.post('/v1/user', data)
        .then(() => {
          this.props.history.push('/login');
        })
        .catch((err) => {
          errorEl.innerHTML = `Error: ${err.response.data.error}`;
        });
    }
  }

  render() {
    return (
      <div className="row">
        <div className="col-xs-2" />
        <div className="col-xs-8">
          <div className="center-block">
            <p id="errorMsg" className="bg-danger" />
          </div>
          <form className="form-horizontal">
            <div className="form-group">
              <label className="col-sm-2 control-label" htmlFor="username">Username:</label>
              <div className="col-sm-10">
                <input className="form-control" id="username" type="text" placeholder="Username" />
              </div>
            </div>
            <div className="form-group">
              <label className="col-sm-2 control-label" htmlFor="first_name">First Name:</label>
              <div className="col-sm-10">
                <input
                  className="form-control"
                  id="first_name"
                  type="text"
                  placeholder="First Name"
                />
              </div>
            </div>
            <div className="form-group">
              <label className="col-sm-2 control-label" htmlFor="last_name">Last Name:</label>
              <div className="col-sm-10">
                <input
                  className="form-control"
                  id="last_name"
                  type="text"
                  placeholder="Last Name"
                />
              </div>
            </div>
            <div className="form-group">
              <label className="col-sm-2 control-label" htmlFor="city">City:</label>
              <div className="col-sm-10">
                <input className="form-control" id="city" type="text" placeholder="City" />
              </div>
            </div>
            <div className="form-group">
              <label className="col-sm-2 control-label" htmlFor="primary_email">Email:</label>
              <div className="col-sm-10">
                <input
                  className="form-control"
                  id="primary_email"
                  type="email"
                  placeholder="Email Address"
                />
              </div>
            </div>
            <div className="form-group">
              <label className="col-sm-2 control-label" htmlFor="password">Password:</label>
              <div className="col-sm-10">
                <input
                  className="form-control"
                  id="password"
                  type="password"
                  placeholder="Password"
                />
              </div>
            </div>
            <div className="form-group">
              <div className="col-sm-offset-2 col-sm-10">
                <button onClick={this.onSubmit} className="btn btn-default">Register</button>
              </div>
            </div>
          </form>
        </div>
        <div className="col-xs-2" />
      </div>
    );
  }
}

export default withRouter(Register);
