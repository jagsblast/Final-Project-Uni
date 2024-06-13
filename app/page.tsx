"use client"
import React, { useState, useEffect } from 'react';
import { useAuth0, Auth0Provider } from '@auth0/auth0-react';
import Profile from './scripts/profile'; // Import the Profile component
import { AddCard, addContent } from './scripts/add-card';
import { getAllMac } from './scripts/ipMac';
import debounce from 'lodash/debounce';
import Posts from './components/posts';

const Home = () => {
  const { isLoading, isAuthenticated, user, getAccessTokenSilently } = useAuth0();
  const [additionalContent, setAdditionalContent] = useState([]);
  const [macData, setMacData] = useState({});
  const [isReady, setIsReady] = useState(false);
  const [token, setToken] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const initialMacData = await getAllMac(token); // Pass token here
      // console.log(token) u didn't see this
      setMacData(initialMacData);
      const newContent = await addContent([], handleRevokeClick, token);
      setAdditionalContent(newContent);
      setIsReady(true);
    };

    const fetchToken = async () => {
      try {
        const accessToken = await getAccessTokenSilently();
        setToken(`Bearer ${accessToken}`);
      } catch (error) {
        console.error('Error fetching access token:', error);
      }
    };

    if (!isLoading) {
      fetchData();
      fetchToken();
    }
  }, [isLoading]);

  useEffect(() => {
    if (isReady) {
      const intervalId = setInterval(async () => {
        // console.log(token) or this
        const updatedMacData = await getAllMac(token); // Pass token here
        setMacData(updatedMacData);
        const newContent = await addContent([], handleRevokeClick, token);
        setAdditionalContent(newContent);
      }, 10000);

      return () => clearInterval(intervalId);
    }
  }, [isReady, token]);

  const handleRevokeClick = (cardId) => {
    setAdditionalContent((prevContent) => prevContent.filter((card) => card.id !== cardId));
  };

  const renderContent = () => {
    if (!isAuthenticated) {
      return <LoginPage />;
    }

    if (!isReady) {
      return <div>Loading...</div>;
    }

    return (
      <main className="flex min-h-screen flex-col justify-between p-24">
        <div>
          <div>
            <Profile /> {/* Render the Profile component here */}
            <LogoutButton />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {additionalContent.map((content) => (
              <React.Fragment key={content.id}>{content.jsx()}</React.Fragment>
            ))}
          </div>
        </div>
      </main>
    );
  };

  return renderContent();
};

const LoginPage = () => {
  const { loginWithRedirect } = useAuth0();
  return (
    <button className="focus:outline-none text-white bg-blue-700 hover:bg-red-800 w-20 rounded-full m-5" onClick={() => loginWithRedirect()}>Log In</button>
  );
};

const LogoutButton = () => {
  const { logout } = useAuth0();

  return (
    <button className="focus:outline-none text-white bg-red-700 hover:bg-red-800 w-20 rounded-full m-5" onClick={() => logout({ returnTo: window.location.origin })}>
      Log Out
    </button>
  );
};

const AuthenticatedApp = () => {
  // Check if window is defined before accessing window.location.origin
  const redirectUri = typeof window !== 'undefined' ? window.location.origin : null;

  return (
    <Auth0Provider
      domain="dev-bp1s3e2ap7bopj75.uk.auth0.com"
      clientId="dnjPPljysn6Q9zMccCz2J7gHSEKRxdzl"
      authorizationParams={{
        redirect_uri: redirectUri,
        audience: "https://dev-bp1s3e2ap7bopj75.uk.auth0.com/api/v2/",
        scope: "read:current_user access:posts update:current_user_metadata"
      }}
    >
      <Home />
    </Auth0Provider>
  );
};

export default AuthenticatedApp;
