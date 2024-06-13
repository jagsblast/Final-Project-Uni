// index.js (or App.js if you prefer)
import React from 'react';
import ReactDOM from 'react-dom';
import { Auth0Provider } from '@auth0/auth0-react';
import Home from './Home'; // Assuming your Home component is in the same directory

ReactDOM.createRoot(document.getElementById('root')).render(
  <Auth0Provider
    domain="dev-bp1s3e2ap7bopj75.uk.auth0.com"
    clientId="dnjPPljysn6Q9zMccCz2J7gHSEKRxdzl"
    redirectUri={window.location.origin}
  >
    <React.StrictMode>
      <Home />
    </React.StrictMode>
  </Auth0Provider>
);
