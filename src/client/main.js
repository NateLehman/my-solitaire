/* Copyright G. Hemingway, 2017 - All rights reserved */
"use strict";

// Necessary modules
import React, { Component }     from 'react';
import { render }               from 'react-dom';
import { BrowserRouter, Route, Redirect } from 'react-router-dom';

import Header                   from './components/header';
import Landing                  from './components/landing';
import Login                    from './components/login';
import Logout                   from './components/logout';
import Register                 from './components/register';
import Profile                  from './components/profile';
import Start                    from './components/start';
import Results                  from './components/results';
import Game                     from './components/game';

// Bring app CSS into the picture
require('./app.css');

/*************************************************************************/

class MyApp extends Component {
    constructor(props) {
        super(props);
        this.user = new User(
            window.__PRELOADED_STATE__.username,
            window.__PRELOADED_STATE__.primary_email
        );
    }

    render() {
        return <BrowserRouter>
            <div>
                <Header user={this.user}/>
                <Route exact path="/" component={Landing}/>
                <Route path="/login" render={() => {
                    return this.user.loggedIn() ?
                        <Redirect to={`/profile/${this.user.username()}`}/> :
                        <Login user={this.user}/>
                }}/>
                <Route path="/register" render={() => {
                    return this.user.loggedIn() ?
                        <Redirect to={`/profile/${this.user.username()}`}/> :
                        <Register/>;
                }}/>
                <Route path="/logout" render={props => <Logout user={this.user}/>}/>
                <Route path="/profile/:username" render={props => <Profile user={this.user}/>}/>
                <Route path="/start" render={() => {
                    return this.user.loggedIn() ?
                        <Start/> :
                        <Redirect to={'/login'}/>;
                }}/>
                <Route path="/game/:id" render={() => {
                    return this.user.loggedIn() ?
                        <Game user={this.user}/> :
                        <Redirect to={'/login'}/>;
                }}/>
                <Route path="/results/:id" render={props => <Results user={this.user}/>}/>
            </div>
        </BrowserRouter>;
    }
}

class User {
    constructor(username, primary_email) {
        if (username && primary_email) {
            this.data = {
                username: username,
                primary_email: primary_email
            };
        } else {
            this.data =  {
                username: "",
                primary_email: ""
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
            username: "",
            primary_email: ""
        };
        // Go to login page
        router.push('/login');
    }

    getUser() {
        return this.data;
    }
}

render(
    <MyApp/>,
    document.getElementById('mainDiv')
);
