// components/RevokeButton.js
import React from 'react';
import Posts from './posts';

const RevokeButton = () => {
  const handleRevokeClick = () => {
    Posts();
  };

  return (
    <button
      type="button"
      onClick={handleRevokeClick}
      className="focus:outline-none text-white bg-red-700 hover:bg-red-800 w-20 rounded-full"
    >
      Revoke
    </button>
  );
};

export default RevokeButton;