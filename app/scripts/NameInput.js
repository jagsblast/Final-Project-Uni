// NameInput.js
import React, { useState } from 'react';

const NameInput = ({ onChange }) => {
  const [name, setName] = useState('');

  const handleInputChange = (e) => {
    setName(e.target.value);
  };

  const handleButtonClick = () => {
    onChange(name);
  };

  return (
    <div className="flex flex-col items-center">
      <input
        type="text"
        value={name}
        onChange={handleInputChange}
        placeholder="Enter Name"
        className="border border-gray-300 p-1 mb-2"
      />
      <button
        type="button"
        onClick={handleButtonClick}
        className="bg-blue-500 text-white px-2 py-1 rounded"
      >
        Change Name
      </button>
    </div>
  );
};

export default NameInput;
