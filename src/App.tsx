import React, { memo } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import Routes from './constants';
import SignIn from './pages/SignIn';
import './App.scss';

function App(): React.ReactElement {
  return (
    <Router>
      <Switch>
        <Route
          component={() => (
            <div className="App">
              <header className="App-header">
                ADRIFT
              </header>
            </div>
          )}
          exact
          path="/"
        />
        <Route
          component={SignIn}
          path={Routes.signIn}
        />
      </Switch>
    </Router>
  );
}

export default memo(App);
