import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";

const Profile = () => {
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [userMetadata, setUserMetadata] = useState(null);
  const [userName, setUserName] = useState(null);
  const [userPicture, setUserPicture] = useState(null);
  const [userEmail, setUserEmail] = useState(null);


  useEffect(() => {
    
    const getUserMetadata = async () => {
      
      const domain = "dev-bp1s3e2ap7bopj75.uk.auth0.com";
  
      try {
        const accessToken = await getAccessTokenSilently({
          authorizationParams: {
            audience: `https://${domain}/api/v2/`,
            scope: "read:current_user update:current_user_metadata",
          },
          
        });
        const userDetailsByIdUrl = `https://${domain}/api/v2/users/${user.sub}`;
        
        const metadataResponse = await fetch(userDetailsByIdUrl, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
  
        const { user_metadata, name, picture, email} = await metadataResponse.json();
        setUserMetadata(user_metadata);
        setUserName(name);
        setUserPicture(picture); 
        setUserEmail(email);
      } catch (e) {
        console.log(e.message);
      }
      


    };
    

    const getNewToken = async () => {
      const newAccessToken = await getAccessTokenSilently({ ignoreCache: true });
      return(newAccessToken)
   }
  
  


    getUserMetadata();
  }, [getAccessTokenSilently, user?.sub]);


  

  
  
  return (
    
    isAuthenticated && (
      <div>
        <img src={userPicture} alt={user.name} style={{ maxWidth: "5%", height: "auto" }}/>
        <h2>Username: {userName}</h2>
        <p>Email: {userEmail}</p>
      </div>
    )
  );
};






export default Profile;


