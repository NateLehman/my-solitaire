/* Copyright G. Hemingway, 2017 - All rights reserved */


// Necessary modules
import React, { Component } from 'react';
import { render } from 'react-dom';
import { BrowserRouter, Route, Redirect } from 'react-router-dom';

import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import logger from 'redux-logger';
import promise from 'redux-promise-middleware';

import gameReducer from './reducers/game';

import gameMiddleware from './middleware/game';

import Header from './components/header';
import Landing from './components/landing';
import Login from './components/login';
import Logout from './components/logout';
import Register from './components/register';
import Profile from './components/profile';
import Start from './components/start';
import Results from './components/results';
import Game from './components/game';

// Bring app CSS into the picture
require('./app.css');


// User object we define at root
class User {
  constructor(username, primaryEmail) {
    if (username && primaryEmail) {
      this.data = {
        username,
        primary_email: primaryEmail,
      };
    } else {
      this.data = {
        username: '',
        primary_email: '',
      };
    }
  }

  loggedIn() {
    return this.data.username && this.data.primary_email;
  }

  username() {
    return this.data.username;
  }

  logIn(router, data) {
    // Store locally
    this.data = data;
    // Go to user profile
    router.push(`/profile/${data.username}`);
  }

  logOut(router) {
    // Remove user info
    this.data = {
      username: '',
      primary_email: '',
    };
    // Go to login page
    router.push('/login');
  }

  getUser() {
    return this.data;
  }
}

// redux setup
const middleware = process.env.NODE_ENV === 'production'
  ? [gameMiddleware, promise()]
  : [gameMiddleware, promise(), logger];

const store = createStore(
  combineReducers({
    game: gameReducer,
  }),
  applyMiddleware(...middleware),
);

class MyApp extends Component {
  constructor(props) {
    super(props);
    this.user = new User(
      window.PRELOADED_STATE.username,
      window.PRELOADED_STATE.primary_email,
    );
  }

  render() {
    return (
      <Provider store={store}>
        <BrowserRouter>
          <div>
            <Header user={this.user} />
            <Route exact path="/" component={Landing} />
            <Route
              path="/login"
              render={() => (this.user.loggedIn() ?
                <Redirect to={`/profile/${this.user.username()}`} /> :
                <Login user={this.user} />)}
            />
            <Route
              path="/register"
              render={() => (this.user.loggedIn() ?
                <Redirect to={`/profile/${this.user.username()}`} /> :
                <Register />)}
            />
            <Route path="/logout" render={props => <Logout {...props} user={this.user} />} />
            <Route
              path="/profile/:username"
              render={props => <Profile {...props} user={this.user} />}
            />
            <Route
              path="/start"
              render={() => (this.user.loggedIn() ?
                <Start /> :
                <Redirect to="/login" />)}
            />
            <Route
              path="/game/:id"
              render={() => (this.user.loggedIn() ?
                <Game user={this.user} /> :
                <Redirect to="/login" />)}
            />
            <Route path="/results/:id" render={props => <Results {...props} user={this.user} />} />
          </div>
        </BrowserRouter>
      </Provider>
    );
  }
}

render(
  <MyApp />,
  document.getElementById('mainDiv'),
);

// Put store into the global
window.store = store;
