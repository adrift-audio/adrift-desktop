import React, { memo } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import DarkWave from './assets/wave-dark.svg';
import Home from './pages/Home';
import SignIn from './pages/SignIn';
import './App.scss';

function App(): React.ReactElement {
  return (
    <div className="flex direction-column justify-content-start app-wrap">
      <Router>
        <Switch>
          <Route
            component={() => (
              <header className="app-title noselect">
                <div className="title">
                  ADRIFT
                </div>
                <div className="wave-logo noselect">
                  <img
                    alt="Adrift"
                    className="wave-logo noselect"
                    src={DarkWave}
                  />
                </div>
              </header>
            )}
            exact
            path="/"
          />
          <Route
            component={Home}
            path="/home"
          />
          <Route
            component={SignIn}
            path="/sign-in"
          />
        </Switch>
      </Router>
    </div>
  );
}

export default memo(App);
