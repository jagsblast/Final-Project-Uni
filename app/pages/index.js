import React from 'react';
import { render } from 'react-dom'; // Import render instead of createRoot
import { Auth0Provider } from '@auth0/auth0-react';
import App from './App';

// Use render instead of createRoot
render(
  <Auth0Provider
    domain="dev-bp1s3e2ap7bopj75.uk.auth0.com"
    clientId="dnjPPljysn6Q9zMccCz2J7gHSEKRxdzl"
    authorizationParams={{
      redirect_uri: window.location.origin
    }}
  >
    <App />
  </Auth0Provider>,
  document.getElementById('root')
);
