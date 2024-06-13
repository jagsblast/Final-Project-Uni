// components/WebSocketDataDisplay.js

import React, { useEffect, useState } from 'react';

const WebSocketDataDisplay = () => {
  const [deviceData, setDeviceData] = useState({
    deviceId: '',
    ipAddress: '',
    macAddress: '',
    status: '',
  });

  useEffect(() => {
    const socket = new WebSocket('ws://192.95.44.36/:3001');

    socket.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
      setDeviceData(data);
    });

    return () => {
      // Close the WebSocket connection when the component unmounts
      socket.close();
    };
  }, []);

  return (
    <div className='relative text-center flex flex-col text-gray-700 bg-white shadow-md bg-clip-border rounded-xl'>
      <div className='p-4'>
        <p>ID: {deviceData.deviceId}</p>
        <p>IP: {deviceData.ipAddress}</p>
        <p>MAC: {deviceData.macAddress}</p>
        <div className="flex items-center justify-center space-x-2 flex-wrap">
          <span className={`bg-${deviceData.status === 'Online' ? 'green' : 'red'}-500 rounded-full h-3 w-3`} />
          <p>Status: {deviceData.status}</p>
        </div>
      </div>
      <div className='p-4'>
        <button type="button" className="focus:outline-none text-white bg-red-700 hover:bg-red-800 w-20 rounded-full">Revoke</button>
      </div>
    </div>
  );
};

// Explicitly mark the component as a Client Component
WebSocketDataDisplay.isClientSafe = true;

export default WebSocketDataDisplay;
