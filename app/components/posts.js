import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const Posts = () => {
  const { getAccessTokenSilently } = useAuth0();

  const fetchToken = async () => {
    try {
      const token = await getAccessTokenSilently({
        cacheMode:"off",
        domain:"https://dev-bp1s3e2ap7bopj75.uk.auth0.com/oauth/token",
        authorizationParams: {
          grant_type:"client_credentials",
          }
      });
      authtoken = toString("Bearer ", token)
      console.log("here")
      return authtoken;
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  useEffect(() => {
    fetchToken()
      .then(token => {
        // Do something with the token, like passing it to another component
      })
      .catch(error => {
        console.error('Failed to fetch token:', error);
      });
  }, [getAccessTokenSilently]);

  return null; // Return null since this component doesn't render anything
};

export default Posts;