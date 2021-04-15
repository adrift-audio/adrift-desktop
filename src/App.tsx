import React, { memo } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import Home from './pages/Home';
import Index from './pages/Index';
import { ROUTES } from './constants';
import SignIn from './pages/SignIn';
import './App.scss';

function App(): React.ReactElement {
  return (
    <div className="flex direction-column justify-content-start app-wrap">
      <Router>
        <Switch>
          <Route
            component={Index}
            exact
            path="/"
          />
          <Route
            component={Home}
            path={`/${ROUTES.home}`}
          />
          <Route
            component={SignIn}
            path={`/${ROUTES.signIn}`}
          />
        </Switch>
      </Router>
    </div>
  );
}

export default memo(App);
