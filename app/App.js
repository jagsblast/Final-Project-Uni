// App.js or Routes.js
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';
import Login from './Login';
import { getAllMac, getMac, updateConnectionStatus, updateName } from './ipMac'; // Import functions
require('dotenv').config({ path: '../.env' });

const domain = process.env.domain;
const clientId = process.env.clientId;


const App = () => {
  return (
    <Router>
      <Auth0Provider
        domain={domain}
        clientId={clientId}
          redirect_uri={window.location.origin}
          audience= {process.env.audience}
          scope = { "read:current_user update:current_user_metadata" }
        redirectUri={window.location.origin}
      >
        <Switch>
          <Route exact path="/login" component={Login} />
          {/* Add other routes for  application */}
        </Switch>
      </Auth0Provider>
    </Router>
  );
};

export default App;
